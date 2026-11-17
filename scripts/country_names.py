import re, unicodedata, pycountry
ALIAS = {
 'turkiye':'TUR','turkey':'TUR','russia':'RUS','russian federation':'RUS','south korea':'KOR','korea, rep.':'KOR','republic of korea':'KOR','korea, south':'KOR',
 'north korea':'PRK','korea, dem. people\'s rep.':'PRK','laos':'LAO','lao pdr':'LAO','vietnam':'VNM','viet nam':'VNM','iran':'IRN','syria':'SYR',
 'kyrgyz republic':'KGZ','kyrgyzstan':'KGZ','the gambia':'GMB','gambia':'GMB','republic of the congo':'COG','congo':'COG','congo, rep.':'COG','congo (brazzaville)':'COG',
 'democratic republic of the congo':'COD','dr congo':'COD','congo, dem. rep.':'COD','drc':'COD','congo (kinshasa)':'COD','cote d\'ivoire':'CIV','ivory coast':'CIV',
 'czech republic':'CZE','czechia':'CZE','taiwan':'TWN','bolivia':'BOL','venezuela':'VEN','tanzania':'TZA','moldova':'MDA','palestine':'PSE','state of palestine':'PSE',
 'kosovo':'XKX','united states':'USA','united states of america':'USA','usa':'USA','uk':'GBR','united kingdom':'GBR','eswatini':'SWZ','swaziland':'SWZ',
 'cape verde':'CPV','cabo verde':'CPV','micronesia':'FSM','brunei':'BRN','brunei darussalam':'BRN','east timor':'TLS','timor-leste':'TLS','macedonia':'MKD','north macedonia':'MKD',
 'bosnia and herzegovina':'BIH','bosnia-herzegovina':'BIH','uae':'ARE','united arab emirates':'ARE','hong kong':'HKG','hong kong sar, china':'HKG','macao':'MAC','macau':'MAC',
 'somaliland':'SOL','northern cyprus':'CYN','vatican':'VAT','holy see':'VAT','st. lucia':'LCA','saint lucia':'LCA','st. kitts and nevis':'KNA','st. vincent and the grenadines':'VCT',
 'sao tome and principe':'STP','egypt':'EGY','egypt, arab rep.':'EGY','yemen':'YEM','yemen, rep.':'YEM','bahamas':'BHS','bahamas, the':'BHS','gambia, the':'GMB',
 'central african republic':'CAF','car':'CAF','guinea bissau':'GNB','guinea-bissau':'GNB','myanmar':'MMR','burma':'MMR','slovak republic':'SVK','slovakia':'SVK',
 'israel':'ISR','palestinian territories':'PSE','palestine/ gaza':'PSE','iran, islamic rep.':'IRN','venezuela, rb':'VEN','micronesia, fed. sts.':'FSM','netherlands':'NLD',
 'korea, dpr':'PRK','micronesia (federated states of)':'FSM','trinidad & tobago':'TTO','antigua & barbuda':'ATG','st kitts and nevis':'KNA','st vincent and the grenadines':'VCT','sao tome & principe':'STP','solomon islands':'SLB',
}
def norm(s):
    s = unicodedata.normalize('NFKD', str(s)).encode('ascii','ignore').decode().lower().strip()
    s = s.replace('’',"'").replace('&','and') if '&' in s and s not in ALIAS else s.replace('’',"'")
    return re.sub(r'\s+',' ', s)
def to_iso3(name):
    n = norm(name)
    if n in ALIAS: return ALIAS[n]
    try: return pycountry.countries.lookup(name).alpha_3
    except LookupError: pass
    try:
        r = pycountry.countries.search_fuzzy(name)
        return r[0].alpha_3 if r else None
    except LookupError: return None
