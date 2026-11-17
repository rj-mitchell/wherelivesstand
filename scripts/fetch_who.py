"""Fetch latest country values from the WHO Global Health Observatory OData API.
Usage: fetch_who.py <out.json>"""
import json, sys, urllib.request
OUT = sys.argv[1]
codes = ['WHOSIS_000002','UHC_INDEX_REPORTED','RS_198','SDGPM25','WHOSIS_000001']
res = {}
for c in codes:
    url = f"https://ghoapi.azureedge.net/api/{c}"
    rows = json.load(urllib.request.urlopen(url, timeout=180))['value']
    best = {}
    for r in rows:
        if r.get('SpatialDimType') != 'COUNTRY' or r.get('NumericValue') is None: continue
        if r.get('Dim1') not in (None, 'SEX_BTSX', 'RESIDENCEAREATYPE_TOTL'): continue
        iso, y = r['SpatialDim'], r['TimeDim']
        if iso not in best or y > best[iso]['y']:
            best[iso] = {'v': r['NumericValue'], 'y': y}
    res[c] = best
    print(c, len(best), best.get('GBR'), sorted(set(b['y'] for b in best.values()))[-3:])
json.dump(res, open(OUT, 'w'))
