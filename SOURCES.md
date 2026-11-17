# Data sources

Written by `scripts/build_dataset.py` from the same build as the figures, so the two always match.

## Countries ranked

186 countries are ranked. A country needs at least 20 of the 34 indicators to be ranked. Figures from before 2015 are left out, and nothing is imputed: a country a source does not cover has no value for it.

## Scoring each indicator

Each indicator is rescaled to a score from 0 to 100 between two goalposts, set at the 2.5th and 97.5th percentiles of the countries' values (on a log scale for skewed figures such as income), and turned round where a lower value is better. A value beyond a goalpost scores 0 or 100. A country's world rank on an indicator comes from its value, so values beyond the goalposts still rank in order. A dimension's score is the average of the indicator scores a country has in it; if the country has fewer than half of them, the dimension is n/a and the overall score is the average of the other dimensions.

V-Dem's freedom-of-religion score is averaged over its last three years (2023 to 2025), because it rests on a single question rated by a handful of experts per country and moves a lot from year to year. It is the only averaged value.

The files as downloaded from each publisher are kept in `data/sources/`; `scripts/fetch_sources.sh` downloads them again.

## The indicators

Grouped by dimension. “Lower is better” marks an indicator turned round for scoring. The goalposts are the values that score 0 and 100, in the publisher's units.

### Safety and peace

| Indicator | Publisher | Data years | Countries | Lower is better | Goalposts (score 0 to 100) |
|---|---|---|---|---|---|
| [Intentional homicide rate](https://data.worldbank.org/indicator/VC.IHR.PSRC.P5) | UNODC via World Bank WDI | 2015 to 2023 | 148 | yes | 41.97 to 0.218 per 100k |
| [Road traffic death rate](https://www.who.int/data/gho/data/indicators/indicator-details/GHO/estimated-road-traffic-death-rate-(per-100-000-population)) | WHO Global Health Observatory | 2023 | 183 | yes | 34.055 to 2.36 deaths per 100k |
| [Global Peace Index 2026](https://www.visionofhumanity.org/maps/) | Institute for Economics & Peace (IEP) | 2026 | 161 | yes | 3.124 to 1.371 Score 1-5 (lower = more peaceful) |
| [Organised crime: criminality score](https://ocindex.net/) | Global Initiative Against Transnational Organized Crime | 2025 | 184 | yes | 7.474 to 2.712 Score 1-10 (lower = less crime) |
| [WorldRiskIndex 2026 (disaster risk)](https://weltrisikobericht.de/en/) | Bündnis Entwicklung Hilft & IFHV Ruhr University Bochum | 2026 | 184 | yes | 38.211 to 0.837 Risk score 0-100 (lower = safer) |

### Governance and rule of law

| Indicator | Publisher | Data years | Countries | Lower is better | Goalposts (score 0 to 100) |
|---|---|---|---|---|---|
| [Corruption Perceptions Index 2025](https://www.transparency.org/en/cpi/2025) | Transparency International | 2025 | 179 |  | 13 to 80.55 Score 0-100 (higher = cleaner) |
| [Rule of law (WGI)](https://www.worldbank.org/en/publication/worldwide-governance-indicators) | World Bank Worldwide Governance Indicators | 2017 to 2025 | 186 |  | -1.853 to 1.719 Estimate -2.5 to +2.5 |
| [Government effectiveness (WGI)](https://www.worldbank.org/en/publication/worldwide-governance-indicators) | World Bank Worldwide Governance Indicators | 2017 to 2025 | 186 |  | -1.885 to 1.948 Estimate -2.5 to +2.5 |
| [Regulatory quality (WGI)](https://www.worldbank.org/en/publication/worldwide-governance-indicators) | World Bank Worldwide Governance Indicators | 2017 to 2025 | 186 |  | -1.795 to 1.653 Estimate -2.5 to +2.5 |
| [Organised crime: resilience score](https://ocindex.net/) | Global Initiative Against Transnational Organized Crime | 2025 | 184 |  | 1.88 to 8 Score 1-10 (higher = more resilient) |

### Civil liberties and inclusion

| Indicator | Publisher | Data years | Countries | Lower is better | Goalposts (score 0 to 100) |
|---|---|---|---|---|---|
| [World Press Freedom Index 2026](https://rsf.org/en/index) | Reporters Without Borders (RSF) | 2026 | 175 |  | 19.25 to 87.124 Score 0-100 |
| [Liberal Democracy Index](https://www.v-dem.net/data/the-v-dem-dataset/) | V-Dem Institute (v16) | 2025 | 174 |  | 0.024 to 0.832 Index 0-1 |
| [Academic Freedom Index](https://academic-freedom-index.net/) | V-Dem Institute / FAU Erlangen-Nürnberg | 2025 | 174 |  | 0.056 to 0.936 Index 0-1 |
| [Freedom of religion](https://www.v-dem.net/data/the-v-dem-dataset/) | V-Dem Institute (v16) | 2025 | 174 |  | -2.522 to 2.486 Latent scale, about -3 to +3 |
| [Women, Peace and Security Index 2025](https://giwps.georgetown.edu/the-index/) | Georgetown Institute for Women, Peace and Security & PRIO | 2025 | 176 |  | 0.398 to 0.92 Index 0-1 |
| [LGBTQ+ legal equality index](https://ourworldindata.org/grapher/lgbt-legal-equality-index) | Equaldex Equality Index via Our World in Data | 2026 | 184 |  | 2.176 to 97.551 Score 0-100 |

### Economy, labour and living costs

| Indicator | Publisher | Data years | Countries | Lower is better | Goalposts (score 0 to 100) |
|---|---|---|---|---|---|
| [GDP per capita (PPP)](https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.CD) | World Bank WDI / ICP | 2015 to 2025 | 181 |  | 1795.8 to 103276 current international $ |
| [Income inequality (Gini)](https://data.worldbank.org/indicator/SI.POV.GINI) | World Bank Poverty & Inequality Platform | 2015 to 2025 | 149 | yes | 54.19 to 24.7 Gini 0-100 (lower = more equal) |
| [Unemployment rate](https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS) | ILO modelled estimates via World Bank WDI | 2021 to 2025 | 180 | yes | 22.394 to 0.986 % of labour force |
| [Average weekly working hours](https://ilostat.ilo.org/topics/working-time/) | International Labour Organization (ILOSTAT) | 2018 to 2025 | 136 | yes | 50 to 35 hours per week |
| [Economic Complexity Index](https://atlas.hks.harvard.edu/rankings) | Harvard Growth Lab (Atlas of Economic Complexity) | 2024 | 144 |  | -2.389 to 1.426 ECI (HS92) |

### Health, education and family

| Indicator | Publisher | Data years | Countries | Lower is better | Goalposts (score 0 to 100) |
|---|---|---|---|---|---|
| [Healthy life expectancy (HALE)](https://www.who.int/data/gho/data/indicators/indicator-details/GHO/gho-ghe-hale-healthy-life-expectancy-at-birth) | WHO Global Health Observatory | 2023 | 183 |  | 52.555 to 71.2 years |
| [Essential health services coverage](https://www.who.int/data/gho/data/indicators/indicator-details/GHO/uhc-index-of-service-coverage) | WHO / World Bank (SDG 3.8.1) | 2023 | 185 |  | 36 to 88.4 Index 0-100 |
| [Under-5 mortality rate](https://data.worldbank.org/indicator/SH.DYN.MORT) | UN IGME via World Bank WDI | 2024 | 185 | yes | 93.913 to 2.4 per 1,000 live births |
| [Education Index (HDI)](https://hdr.undp.org/data-center/documentation-and-downloads) | UNDP Human Development Report 2025 | 2023 | 185 |  | 0.315 to 0.933 Index 0-1 |

### Infrastructure and tech

| Indicator | Publisher | Data years | Countries | Lower is better | Goalposts (score 0 to 100) |
|---|---|---|---|---|---|
| [Fixed broadband download speed](https://github.com/teamookla/ookla-open-data) | Ookla Open Data (Speedtest, Q3 2026) | 2026 | 164 |  | 23.63 to 412.626 Mbps (test-weighted mean) |
| [Internet users](https://data.worldbank.org/indicator/IT.NET.USER.ZS) | ITU via World Bank WDI | 2015 to 2025 | 184 |  | 14.108 to 99.401 % of population |
| [Access to electricity](https://data.worldbank.org/indicator/EG.ELC.ACCS.ZS) | World Bank / SDG 7.1.1 | 2024 | 186 |  | 20.85 to 100 % of population |
| [Logistics Performance Index](https://lpi.worldbank.org/) | World Bank LPI | 2016 to 2022 | 167 |  | 2.071 to 4.1 Score 1-5 |

### Weather and climate

| Indicator | Publisher | Data years | Countries | Lower is better | Goalposts (score 0 to 100) |
|---|---|---|---|---|---|
| [Climate comfort (where people live)](https://www.worldclim.org/data/worldclim21.html) | Derived from WorldClim 2.1 normals + GeoNames city populations | 1970 to 2000 climate averages | 184 |  | 0 to 100 Score 0-100 |

### Environment and resilience

| Indicator | Publisher | Data years | Countries | Lower is better | Goalposts (score 0 to 100) |
|---|---|---|---|---|---|
| [Air pollution (PM2.5)](https://www.who.int/data/gho/data/themes/air-pollution) | WHO Global Health Observatory (SDG 11.6.2) | 2023 | 185 | yes | 49.887 to 5.483 μg/m³ annual mean |
| [Safely managed drinking water](https://data.worldbank.org/indicator/SH.H2O.SMDW.ZS) | WHO/UNICEF JMP via World Bank WDI | 2017 to 2024 | 134 |  | 12.417 to 100 % of population |
| [Environmental Performance Index 2026](https://epi.yale.edu/) | Yale & Columbia (EPI) | 2026 | 174 |  | 24.005 to 70.308 Score 0-100 |
| [ND-GAIN Climate Adaptation Index](https://gain.nd.edu/our-work/country-index/) | Notre Dame Global Adaptation Initiative | 2024 | 183 |  | 29.415 to 68.544 Score 0-100 |

## Considered and left out

- The Global Terrorism Index (IEP) was left out because terrorism is already one of the 23 indicators in the Global Peace Index, and more than half of countries score exactly 0.
- The International Property Rights Index was left out because it is published by an advocacy group and largely repeats the World Bank's rule-of-law measure.
- The ITUC Global Rights Index was left out because its website was offline when this dataset was built. The ILO's SDG indicator 8.8.2 was also left out, because the ILO says it “is not intended as a tool to compare compliance among ILO member States”.
- Housing affordability, access to public transport and the KidsRights Index were left out because no source covers most countries.
- Taiwan, Kosovo, Monaco, Liechtenstein and other small states are shown but not ranked: the UN-system sources (the World Bank, WHO and UNDP) do not report them, which leaves them short of the minimum number of indicators.
