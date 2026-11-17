#!/usr/bin/env bash
# Re-download every source from its publisher and rebuild the snapshots in data/sources/.
# Then run:  python3 scripts/build_dataset.py
# Needs: curl, unzip, pdftotext (poppler), python3 with pandas, python-calamine, pyreadr, pycountry,
#        rasterio, geopandas, pyarrow (pip install pandas python-calamine pyreadr pycountry rasterio geopandas pyarrow)
set -euo pipefail
cd "$(dirname "$0")/.."
RAW=data/raw; OUT=data/sources
mkdir -p "$RAW/worldclim" "$RAW/ne" "$RAW/ookla" "$OUT"
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
get() { curl -fsSL -A "$UA" --retry 3 -o "$1" "$2"; }

# APIs
python3 scripts/fetch_worldbank.py "$OUT/worldbank.json"
python3 scripts/fetch_who.py "$OUT/who.json"

# Published files
get "$OUT/cpi2025.xlsx"   https://images.transparencycdn.org/images/CPI2025_Results.xlsx
get "$OUT/rsf2026.csv"    https://rsf.org/sites/default/files/import_classement/2026.csv
get "$OUT/hdr25.csv"      https://hdr.undp.org/sites/default/files/2025_HDR/HDR25_Composite_indices_complete_time_series.csv
get "$OUT/ocindex.xlsx"   https://ocindex.net/assets/downloads/global_oc_index.xlsx
get "$OUT/wps2025.xlsx"   https://giwps.georgetown.edu/wp-content/uploads/2025/10/WPS-Index-2025-Data.xlsx
get "$OUT/epi2026.xlsx"   https://epi.yale.edu/sites/default/files/2026-09/epi2026results2026-07-07.xlsx
get "$OUT/eci.csv"        "https://dataverse.harvard.edu/api/access/datafile/13439575?format=original"
get "$OUT/owid_lgbt-legal-equality-index.csv" "https://ourworldindata.org/grapher/lgbt-legal-equality-index.csv?v=1&csvType=full&useColumnShortNames=true"
get "$OUT/ilo_hours.csv"  "https://sdmx.ilo.org/rest/data/ILO,DF_HOW_TEMP_SEX_AGE_NB/.A..SEX_T.AGE_YTHADULT_YGE15?startPeriod=2015&format=csvfile"

get "$RAW/ndgain.zip" https://gain.nd.edu/assets/647440/ndgain_countryindex_2026.zip
unzip -o -q "$RAW/ndgain.zip" -d "$RAW/ndgain"
cp "$(find "$RAW/ndgain" -path '*gain/gain.csv' | head -1)" "$OUT/ndgain_gain.csv"

get "$RAW/wri_trend.csv" "https://data.humdata.org/dataset/1efb6ee7-051a-440f-a2cf-e652fecccf73/resource/3a2320fa-41b4-4dda-a847-3f397d865378/download/worldriskindex-trend.csv"
python3 -c "import pandas as pd; df=pd.read_csv('$RAW/wri_trend.csv'); df[df.Year==df.Year.max()].iloc[:,:9].to_csv('$OUT/worldriskindex_2026.csv',index=False)"

# Global Peace Index: IEP publishes country scores only in the report PDF
get "$RAW/gpi2026.pdf" https://www.visionofhumanity.org/wp-content/uploads/2026/06/Global-Peace-Index-2026-Report.pdf
pdftotext -layout "$RAW/gpi2026.pdf" "$RAW/gpi.txt"
sed -n 570,690p "$RAW/gpi.txt" > "$OUT/gpi2026_table_extract.txt"
python3 scripts/parse_gpi.py "$RAW/gpi.txt" "$OUT/gpi2026.json"

# V-Dem v16, from the V-Dem Institute's own R data package
[ -d "$RAW/vdemdata" ] || git clone --depth 1 --filter=blob:none --sparse https://github.com/vdeminstitute/vdemdata "$RAW/vdemdata"
git -C "$RAW/vdemdata" sparse-checkout set data
python3 - <<PY
import pyreadr
df = list(pyreadr.read_r('$RAW/vdemdata/data/vdem.RData').values())[0]
cols = ['country_name','country_text_id','year','v2x_libdem','v2xca_academ','v2clrelig','v2clrelig_osp','v2x_gencl',
        'v2x_freexp_altinf','v2x_rule','v2x_clphy','v2x_civlib','v2x_polyarchy','v2mecenefm','v2mecenefm_osp','v2cldiscm','v2cldiscw','v2clacfree']
# last three years: religious freedom is averaged over them (see build_dataset.py)
df[df.year >= df.year.max() - 2][[c for c in cols if c in df.columns]].to_csv('$OUT/vdem_v16_2023_2025.csv', index=False)
PY

# Climate: WorldClim 2.1 normals sampled at GeoNames cities (population-weighted)
for v in tmax tmin prec srad vapr; do
  [ -f "$RAW/worldclim/wc2.1_10m_${v}_01.tif" ] || { get "$RAW/worldclim/$v.zip" "https://geodata.ucdavis.edu/climate/worldclim/2_1/base/wc2.1_10m_${v}.zip"; unzip -o -q "$RAW/worldclim/$v.zip" -d "$RAW/worldclim"; }
done
get "$RAW/cities15000.zip" https://download.geonames.org/export/dump/cities15000.zip && unzip -o -q "$RAW/cities15000.zip" -d "$RAW"
get "$RAW/countryInfo.txt" https://download.geonames.org/export/dump/countryInfo.txt
python3 scripts/derive_climate.py "$RAW" "$OUT/climate.json"

# Broadband: Ookla Open Data fixed tiles (Q3 2026) joined to Natural Earth country polygons
get "$RAW/ookla/2026q3_fixed.parquet" "https://ookla-open-data.s3.amazonaws.com/parquet/performance/type=fixed/year=2026/quarter=3/2026-07-01_performance_fixed_tiles.parquet"
get "$RAW/ne/ne10.zip" https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries.zip && unzip -o -q "$RAW/ne/ne10.zip" -d "$RAW/ne"
python3 scripts/derive_broadband.py "$RAW" "$OUT/ookla_fixed.json"

echo "Sources refreshed in $OUT. Now run: python3 scripts/build_dataset.py"
