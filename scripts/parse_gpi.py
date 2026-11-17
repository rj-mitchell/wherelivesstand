"""Extract the Global Peace Index 2026 overall scores from the results table (pages 9-10) of IEP's report PDF.
Usage: parse_gpi.py <pdftotext -layout output> <out.json>"""
import os, re, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from country_names import to_iso3
lines = open(sys.argv[1]).read().splitlines()[575:700]
pat = re.compile(r"(=?\d{1,3})\s+([A-Za-zÀ-ÿ'’\-\. ]+?)\s+(\d\.\d{1,3})\b")
out = {}
for l in lines:
    for rank, name, score in pat.findall(l):
        name = name.strip()
        if not name or name in ('UP-LONG','DOWN-LONG'): continue
        out[name] = (rank, float(score))
# Names that wrap onto two lines in the PDF table
manual = {'Bosnia and Herzegovina':('48',1.81),'Republic of the Congo':('120',2.256),'United States of America':('134',2.535),
          'Central African Republic':('150',2.906),'Democratic Republic of the Congo':('161',3.189)}
out.update(manual)
res = {}
for name,(rank,score) in out.items():
    iso = to_iso3(name)
    if not iso: print('UNMATCHED', name); continue
    res[iso] = {'v': score, 'rank': rank, 'name': name}
print(len(res))
json.dump(res, open(sys.argv[2],'w'), ensure_ascii=False)
