"""Population-weighted national climate normals from WorldClim 2.1 (1970-2000, 10 arc-min),
sampled at every GeoNames city with population >= 15,000 and weighted by city population."""
import sys, json, math, csv
import numpy as np, rasterio
RAW = sys.argv[1]; OUT = sys.argv[2]
iso2to3 = {}
for line in open(f'{RAW}/countryInfo.txt', encoding='utf-8'):
    if line.startswith('#'): continue
    p = line.rstrip('\n').split('\t')
    iso2to3[p[0]] = p[1]
iso2to3['XK'] = 'XKX'
cities = []
for line in open(f'{RAW}/cities15000.txt', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    lat, lon, cc, pop = float(p[4]), float(p[5]), p[8], int(p[14] or 0)
    if cc in iso2to3 and pop > 0:
        cities.append((iso2to3[cc], lat, lon, pop))
coords = [(c[2], c[1]) for c in cities]
def sample(var):
    out = np.zeros((len(cities), 12))
    for m in range(12):
        with rasterio.open(f'{RAW}/worldclim/wc2.1_10m_{var}_{m+1:02d}.tif') as ds:
            nod = ds.nodata
            vals = np.array([v[0] for v in ds.sample(coords)], dtype=float)
            if nod is not None: vals[vals == nod] = np.nan
            vals[vals < -1e30] = np.nan
            out[:, m] = vals
    return out
V = {v: sample(v) for v in ['tmax', 'tmin', 'prec', 'srad', 'vapr']}
iso = np.array([c[0] for c in cities]); pop = np.array([c[3] for c in cities], dtype=float)
def dewpoint(e_kpa):
    e = np.maximum(e_kpa * 10.0, 0.01)  # hPa
    g = np.log(e / 6.112)
    return 243.5 * g / (17.67 - g)
def es(t):  # saturation vapour pressure, hPa
    return 6.112 * np.exp(17.67 * t / (t + 243.5))
res = {}
for code in sorted(set(iso)):
    mask = (iso == code) & ~np.isnan(V['tmax']).any(axis=1) & ~np.isnan(V['vapr']).any(axis=1)
    if mask.sum() == 0: continue
    w = pop[mask] / pop[mask].sum()
    prof = {v: (V[v][mask] * w[:, None]).sum(axis=0) for v in V}
    tmax, tmin, prec, srad, vapr = prof['tmax'], prof['tmin'], prof['prec'], prof['srad'], prof['vapr']
    td = dewpoint(vapr); tavg = (tmax + tmin) / 2
    rh = np.clip(vapr * 10 / es(tavg) * 100, 0, 100)
    month = np.full(12, 100.0)
    month -= np.where(tmax < 20, (20 - tmax) * 4.0, 0) + np.where(tmax > 28, (tmax - 28) * 6.0, 0)
    month -= np.where(tmin < 5, (5 - tmin) * 2.0, 0)
    month -= np.where(td > 16, (td - 16) * 5.0, 0)
    month -= np.minimum(np.where(prec > 100, (prec - 100) * 0.15, 0), 30)
    month = np.clip(month, 0, 100)
    kwh = srad.mean() / 3600.0  # kJ m-2 day-1 -> kWh m-2 day-1
    sun = float(np.clip((kwh - 2.5) / (6.0 - 2.5) * 100, 0, 100))
    score = 0.8 * month.mean() + 0.2 * sun
    res[code] = {
        'score': round(float(score), 1), 'monthComfort': [round(float(x), 1) for x in month],
        'comfortableMonths': int((month >= 70).sum()),
        'hottestMonthHigh': round(float(tmax.max()), 1), 'coldestMonthLow': round(float(tmin.min()), 1),
        'meanTemp': round(float(tavg.mean()), 1), 'annualPrecip': round(float(prec.sum())),
        'solarKwh': round(kwh, 2), 'meanRH': round(float(rh.mean())), 'maxDewPoint': round(float(td.max()), 1),
        'nCities': int(mask.sum()), 'popCovered': int(pop[mask].sum()),
    }
json.dump(res, open(OUT, 'w'))
print(len(res))
for c in ['GBR', 'ESP', 'CAN', 'RUS', 'AUS', 'SGP', 'ARE', 'NOR', 'PRT', 'MEX', 'IND', 'URY']:
    r = res.get(c); print(c, r and {k: r[k] for k in ['score', 'comfortableMonths', 'hottestMonthHigh', 'coldestMonthLow', 'meanTemp', 'annualPrecip', 'solarKwh', 'maxDewPoint', 'nCities']})
