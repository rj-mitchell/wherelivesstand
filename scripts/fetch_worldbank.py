"""Fetch the most recent non-empty value per country from the World Bank API (WDI = source 2, WGI = source 3).
Usage: fetch_worldbank.py <out.json>"""
import json, sys, urllib.request, time
OUT = sys.argv[1]
# (code, source) - source 2 = WDI, 3 = WGI
IND = {
 'SL.UEM.TOTL.ZS':2,'EG.ELC.ACCS.ZS':2,'SH.DYN.MORT':2,
 'NY.GDP.PCAP.PP.CD':2,'IT.NET.USER.ZS':2,'VC.IHR.PSRC.P5':2,'SH.STA.TRAF.P5':2,'EN.ATM.PM25.MC.M3':2,
 'SP.DYN.LE00.IN':2,'SI.POV.GINI':2,'SH.H2O.SMDW.ZS':2,'SH.H2O.BASW.ZS':2,'LP.LPI.OVRL.XQ':2,'LP.LPI.INFR.XQ':2,
 'IT.NET.BBND.P2':2,'SP.DYN.IMRT.IN':2,'SH.STA.SMSS.ZS':2,'SH.UHC.SRVS.CV.XD':2,'SH.STA.SUIC.P5':2,
 'GOV_WGI_RL.EST':3,'GOV_WGI_GE.EST':3,'GOV_WGI_CC.EST':3,'GOV_WGI_VA.EST':3,'GOV_WGI_PV.EST':3,'GOV_WGI_RQ.EST':3,
 'GOV_WGI_RL.SC':3,'GOV_WGI_GE.SC':3,'GOV_WGI_PV.SC':3,
}
res = {}
for code, src in IND.items():
    url = f'https://api.worldbank.org/v2/country/all/indicator/{code}?format=json&per_page=20000&mrnev=1&source={src}'
    for attempt in range(4):
        try:
            data = json.load(urllib.request.urlopen(url, timeout=120)); break
        except Exception as e:
            print('retry', code, e); time.sleep(3)
    rows = data[1] if len(data) > 1 and data[1] else []
    res[code] = {'name': rows[0]['indicator']['value'] if rows else None,
                 'values': {r['countryiso3code'] or r['country']['id']: {'v': r['value'], 'y': r['date']} for r in rows if r['value'] is not None}}
    print(code, src, len(res[code]['values']), res[code]['name'])
json.dump(res, open(OUT, 'w'))
