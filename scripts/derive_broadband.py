"""Country fixed-broadband download speed from Ookla Open Data (tile level),
aggregated as the test-weighted mean of tile average download speed (Ookla's documented method)."""
import sys, json
import pandas as pd, geopandas as gpd, pyarrow.parquet as pq
from shapely import wkt
RAW = sys.argv[1]; OUT = sys.argv[2]
t = pq.read_table(f'{RAW}/ookla/2026q3_fixed.parquet', columns=['tile', 'avg_d_kbps', 'tests', 'devices']).to_pandas()
print('tiles', len(t))
# Tile centroids from the WKT polygons (small zoom-16 squares), parsed from the corners for speed
xy = t['tile'].str.extract(r'POLYGON\(\(([-\d\.]+) ([-\d\.]+), ([-\d\.]+) ([-\d\.]+), ([-\d\.]+) ([-\d\.]+)')
xy = xy.astype(float)
t['lon'] = (xy[0] + xy[4]) / 2; t['lat'] = (xy[1] + xy[5]) / 2
pts = gpd.GeoDataFrame(t[['avg_d_kbps', 'tests', 'devices']], geometry=gpd.points_from_xy(t.lon, t.lat), crs=4326)
ne = gpd.read_file(f'{RAW}/ne/ne_10m_admin_0_countries.shp')[['ISO_A3', 'ADM0_A3', 'geometry']]
ne['iso'] = ne['ISO_A3'].where(ne['ISO_A3'] != '-99', ne['ADM0_A3'])
ne.loc[ne['ADM0_A3'] == 'KOS', 'iso'] = 'XKX'
j = gpd.sjoin(pts, ne[['iso', 'geometry']], predicate='within', how='inner')
g = j.groupby('iso').apply(lambda d: pd.Series({'mbps': (d.avg_d_kbps * d.tests).sum() / d.tests.sum() / 1000, 'tests': int(d.tests.sum()), 'tiles': len(d)}))
res = {k: {'v': round(float(r.mbps), 1), 'tests': int(r.tests), 'tiles': int(r.tiles)} for k, r in g.iterrows()}
json.dump(res, open(OUT, 'w'))
print(len(res)); print({k: res[k] for k in ['GBR', 'USA', 'SGP', 'FRA', 'IND', 'NGA', 'ROU'] if k in res})
