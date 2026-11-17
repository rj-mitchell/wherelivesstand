// Text for the Behind the rankings page. Indicator names, publishers, links and coverage
// come from indicators.json; this file holds only the commentary. Every rank quoted below was
// checked against countries.json with all dials at 50% unless stated.

export type BiasRisk = 'Low' | 'Medium' | 'High';

export interface IndicatorCritique {
  id: string;
  whatItMeasures: string;
  pros: string[];
  cons: string[];
  blindSpot: string;
  biasRisk: BiasRisk;
}

export interface MacroCritiqueTheme {
  id: string;
  title: string;
  points: string[];
}

export interface CountryAnomalyCaseStudy {
  id: string;
  countryName: string;
  iso3: string;
  headline: string;
  rankText: string;
  whyItLooksWrong: string;
  theRealExplanation: string;
  whereItBalancesOut: string;
  relatedIndicatorId?: string;
}

export const MACRO_THEMES: MacroCritiqueTheme[] = [
  {
    id: 'weights',
    title: 'The weights pick the winner',
    points: [
      'Any “best country” ranking rests on a choice of what matters, so it describes the priorities of whoever set the weights. Change the weights and the order changes.',
      'With every dial at 50%, Denmark comes first, just ahead of Switzerland. Turn weather and climate up to 100% and Australia does.'
    ]
  },
  {
    id: 'income',
    title: 'Almost everything tracks income',
    points: [
      'Money buys hospitals, courts, broadband and clean water, so most indicators move with GDP per capita: its correlation with the health dimension is 0.92, infrastructure 0.88 and governance 0.78.',
      'Weather is the exception (−0.16). Raise any other single dial to 100% and Switzerland or Denmark still comes first.'
    ]
  },
  {
    id: 'experts',
    title: 'Measured counts and expert judgement',
    points: [
      '15 of the 34 indicators are measured counts or rates, such as homicides, road deaths or broadband speed. Ten are expert assessments, including corruption, rule of law, organised crime, press freedom and democracy. The rest are composite indices.',
      'Expert scores share sources and reputations. Corruption Perceptions and WGI Rule of Law correlate at 0.93, so weighting both mostly counts the same opinion twice. The “kind of data” line on each index below shows how much rests on judgement.'
    ]
  },
  {
    id: 'gaps',
    title: 'Missing, modelled and dated data',
    points: [
      'Values come from different years (2015 to 2026), and some are model estimates: ILO unemployment, WHO road deaths, healthy life expectancy. Check the year and coverage beside each value before trusting a close comparison.',
      'Nothing is filled in. A country needs 20 of 34 indicators to be ranked, and a dimension needs half its indicators, otherwise it shows n/a. Taiwan, Kosovo and most micro-states lack UN-system data, so they are not ranked.'
    ]
  },
  {
    id: 'whose-yardstick',
    title: 'A Western yardstick',
    points: [
      'Most of these indices are designed in Europe and North America. They define good governance, rights and democracy in liberal, rules-based terms.',
      'That is a defensible choice, and it marks down by design societies that put social harmony, family networks or religious law first. Low scores on rights and governance reflect both real problems and the yardstick used.'
    ]
  }
];

export const INDICATOR_CRITIQUES: IndicatorCritique[] = [
  {
    id: 'unodc_homicide',
    whatItMeasures: 'Intentional killings per 100,000 people.',
    pros: ['The hardest crime statistic to hide or redefine, so the most comparable across countries.'],
    cons: ['Misses non-lethal violence, domestic abuse and fear of crime.', 'Weak death registration can undercount, and only 148 ranked countries have a figure from 2015 or later.'],
    blindSpot: 'Little cultural bias, but data quality follows state capacity.',
    biasRisk: 'Low'
  },
  {
    id: 'who_traffic_safety',
    whatItMeasures: 'Road deaths per 100,000 people, as estimated by WHO.',
    pros: ['WHO models correct for police under-reporting, which is common in poorer countries.'],
    cons: ['Modelled where death registration is weak.', 'A per-person rate ignores how much people drive.'],
    blindSpot: 'Low: road deaths matter everywhere.',
    biasRisk: 'Low'
  },
  {
    id: 'global_peace_index',
    whatItMeasures: '23 indicators of conflict, safety and security, and militarisation.',
    pros: ['War, political instability and crime in one annual score.'],
    cons: ['Military spending, arms exports and wars abroad count against a country even if it is safe at home (the US ranks 132nd of 161).', 'Several inputs are analyst ratings.'],
    blindSpot: 'Treats any military strength as a negative, whatever its purpose.',
    biasRisk: 'Medium'
  },
  {
    id: 'organized_crime_index',
    whatItMeasures: 'Expert-rated scale of 15 criminal markets and 5 types of criminal actor. How well a country fights back is scored separately, as Crime Resilience under Governance.',
    pros: ['The only global measure of organised crime, covering 193 countries.'],
    cons: ['Expert judgement of activity that is hidden by nature.', 'Transit and financial hubs score badly because illicit flows pass through them: the UK ranks 124th of 184.'],
    blindSpot: 'Rates the scale of criminal markets, which ordinary residents may barely feel.',
    biasRisk: 'Medium'
  },
  {
    id: 'world_risk_index',
    whatItMeasures: 'Exposure to earthquakes, floods, storms, drought and sea-level rise, multiplied by social vulnerability.',
    pros: ['Combines the hazard with a country\'s ability to cope; open, peer-reviewed method.'],
    cons: ['Exposure dominates, so well-prepared but hazard-prone countries still score badly (Japan 166th of 184).'],
    blindSpot: 'Measures the risk of catastrophe; day-to-day safety is left to the other indicators.',
    biasRisk: 'Low'
  },

  {
    id: 'ti_cpi',
    whatItMeasures: 'Perceived public-sector corruption, aggregated from 13 expert and business surveys.',
    pros: ['Long-running and transparent, with a published margin of error.'],
    cons: ['Measures how experts and investors perceive corruption, which can differ from what residents experience.', 'Misses money laundering through rich financial centres, which helps those countries score well.'],
    blindSpot: 'Survey sources reflect business priorities.',
    biasRisk: 'Medium'
  },
  {
    id: 'wgi_rule_of_law',
    whatItMeasures: 'Confidence in contracts, property rights, police and courts, combined from about 30 sources.',
    pros: ['Pools many sources and publishes uncertainty for every country.'],
    cons: ['Shares sources with the CPI and other WGI measures; correlates 0.93 with both.'],
    blindSpot: 'Weighted towards what investors need from courts.',
    biasRisk: 'Medium'
  },
  {
    id: 'wgi_gov_effectiveness',
    whatItMeasures: 'Quality of public services and the civil service, and the credibility of policy.',
    pros: ['A broad read of state capacity from many sources.'],
    cons: ['Rewards competent delivery, whether or not the policies serve people well.', 'Largely perception-based and highly correlated with income.'],
    blindSpot: 'Favours technocratic, centralised administration.',
    biasRisk: 'Medium'
  },
  {
    id: 'wgi_regulatory_quality',
    whatItMeasures: 'Ability of government to make sound rules that support private business.',
    pros: ['Reflects the red tape and regulatory burden that people and firms face.'],
    cons: ['Its idea of good regulation leans towards what investors want.'],
    blindSpot: 'Market-liberal: protective regulation can score as a negative.',
    biasRisk: 'Medium'
  },
  {
    id: 'organized_crime_resilience',
    whatItMeasures: 'How well a country withstands organised crime: leadership, laws, courts, policing, anti-money-laundering, prevention and civil society.',
    pros: ['Credits what a country does about crime, which the criminality score ignores: the UK ranks 124th for criminality but 10th for resilience.'],
    cons: ['Expert judgement, and overlaps with the rule-of-law and government-effectiveness measures.'],
    blindSpot: 'Rewards formal institutions and international cooperation.',
    biasRisk: 'Medium'
  },

  {
    id: 'gdp_per_capita_ppp',
    whatItMeasures: 'Economic output per person, adjusted for local prices.',
    pros: ['The best single measure of average material living standards.'],
    cons: ['An average, which a few very high incomes pull above what a typical person earns.', 'Inflated where output doesn\'t reach residents: Ireland\'s multinational profits, Luxembourg\'s cross-border commuters.'],
    blindSpot: 'Ignores unpaid work, leisure and environmental cost.',
    biasRisk: 'Low'
  },
  {
    id: 'gini_inequality',
    whatItMeasures: 'How unevenly household income or consumption is shared (0 = equal).',
    pros: ['Measured in household surveys of income and spending.'],
    cons: ['Survey years vary (2015 to 2025); some countries measure consumption, which looks more equal.', 'Surveys under-sample the very rich.'],
    blindSpot: 'Little conceptual bias; data quality varies.',
    biasRisk: 'Low'
  },
  {
    id: 'ilo_unemployment',
    whatItMeasures: 'Share of the labour force without work and looking for it (ILO definition).',
    pros: ['One consistent definition, with ILO modelling filling survey gaps.'],
    cons: ['Low unemployment can mean people can\'t afford not to work and take any informal job.', 'Ignores underemployment and job quality.'],
    blindSpot: 'Fits formal wage economies best.',
    biasRisk: 'Medium'
  },
  {
    id: 'ilo_working_hours',
    whatItMeasures: 'Average weekly hours actually worked. Scored 100 at 35 hours or fewer, 0 at 50.',
    pros: ['A measured proxy for time left for family and rest.'],
    cons: ['Short averages can reflect part-time or underemployed workers.', 'Ignores commuting and unpaid care; the 35 to 50 hour band is a judgement call.'],
    blindSpot: 'In poorer countries, long hours often reflect what people need to earn.',
    biasRisk: 'Medium'
  },
  {
    id: 'atlas_economic_complexity',
    whatItMeasures: 'How diverse and sophisticated a country\'s goods exports are.',
    pros: ['Built from trade data, and a good predictor of future growth.'],
    cons: ['Goods only: service economies (tourism, finance, software) are understated.', 'Covers just 144 countries.'],
    blindSpot: 'Measures productive know-how, which says little about how people live.',
    biasRisk: 'Medium'
  },

  {
    id: 'who_hale',
    whatItMeasures: 'Years a newborn can expect to live in full health.',
    pros: ['Combines length of life with quality of health.'],
    cons: ['Relies on modelled disease and disability estimates, uncertain where health data are thin.'],
    blindSpot: 'Low.',
    biasRisk: 'Low'
  },
  {
    id: 'who_uhc_coverage',
    whatItMeasures: 'Whether essential health services reach people: maternal and child care, vaccination, and treatment for infectious and chronic disease (the UN\'s Universal Health Coverage service index).',
    pros: ['Measures access to care rather than spending.'],
    cons: ['Leaves out insurance and affordability: the US scores 88, level with the UK, despite its gaps in insurance and high costs.', 'Uses basic services, so rich countries bunch near the top.'],
    blindSpot: 'Low.',
    biasRisk: 'Low'
  },
  {
    id: 'under5_mortality',
    whatItMeasures: 'Chance of a child dying before age five, per 1,000 births.',
    pros: ['Among the most reliably recorded statistics; a sensitive summary of nutrition, sanitation and basic care.'],
    cons: ['Rich countries are all very low, so it barely separates them.'],
    blindSpot: 'Low: child survival is valued everywhere.',
    biasRisk: 'Low'
  },
  {
    id: 'undp_education',
    whatItMeasures: 'Average years of adult schooling and expected years for children (UNDP).',
    pros: ['Available for almost every country.'],
    cons: ['Counts years in school and says nothing of what is learned.', '“Expected years” is a projection.'],
    blindSpot: 'Equates formal schooling with education.',
    biasRisk: 'Low'
  },

  {
    id: 'rsf_press_freedom',
    whatItMeasures: 'Political, economic, legal, social and safety conditions for journalists.',
    pros: ['Annual, covers 180 countries, and counts violence against journalists.'],
    cons: ['Mostly a questionnaire answered by journalists and experts.', 'Method changed in 2022, so older scores aren\'t comparable.'],
    blindSpot: 'Assumes an adversarial, Western-style press as the ideal.',
    biasRisk: 'Medium'
  },
  {
    id: 'vdem_liberal_democracy',
    whatItMeasures: 'Free elections plus limits on the executive, independent courts and civil liberties.',
    pros: ['Thousands of country experts, with a statistical model that corrects for coder bias.'],
    cons: ['Still expert judgement.'],
    blindSpot: 'Defines democracy in liberal terms; other forms of participation get no credit.',
    biasRisk: 'Medium'
  },
  {
    id: 'academic_freedom',
    whatItMeasures: 'Freedom to research and teach, university autonomy, and freedom of academic expression.',
    pros: ['Covers 174 countries with the same expert-coding method as V-Dem.'],
    cons: ['Expert judgement; matters directly to a minority of residents.'],
    blindSpot: 'Modelled on the Western research university.',
    biasRisk: 'Medium'
  },
  {
    id: 'vdem_religious_freedom',
    whatItMeasures: 'Freedom to choose, practise and change religion without state repression, averaged over 2023 to 2025.',
    pros: ['Annual expert coding, corrected for coder bias.'],
    cons: ['A single question rated by only a handful of experts per country (six for the UK), so one year can swing sharply; hence the three-year average.', 'Measures state behaviour more than hostility between communities.'],
    blindSpot: 'Individual-rights view: state churches and religious law can score lower.',
    biasRisk: 'Medium'
  },
  {
    id: 'georgetown_wps',
    whatItMeasures: "Women's inclusion (education, jobs, politics), justice (legal equality) and security (violence, safety).",
    pros: ['Combines legal rights, outcomes and safety in one index.'],
    cons: ['Mixes data from different years and sources; some inputs are small-sample surveys.'],
    blindSpot: 'Uses a liberal model of gender equality.',
    biasRisk: 'Medium'
  },
  {
    id: 'lgbtq_equality',
    whatItMeasures: 'Laws on same-sex relationships, marriage, adoption, discrimination, gender recognition and conversion therapy.',
    pros: ['Current (2026) and covers 184 countries.'],
    cons: ['Covers laws on the books; social acceptance and enforcement are left out.', 'Equaldex is a collaborative database, so recent legal changes can lag.'],
    blindSpot: 'Benchmarks against the most liberal legal regimes.',
    biasRisk: 'High'
  },

  {
    id: 'ookla_broadband',
    whatItMeasures: 'Average fixed-broadband download speed across all Speedtest results, Q3 2026.',
    pros: ['About 100 million real speed tests in a single quarter, run by users themselves.'],
    cons: ['People choose when to test, and the average is pulled up by fast connections.', 'Says nothing about price or rural coverage.'],
    blindSpot: 'Equates faster with better beyond the point where it matters.',
    biasRisk: 'Low'
  },
  {
    id: 'itu_internet_penetration',
    whatItMeasures: 'Share of people who used the internet in the last three months.',
    pros: ['Separates connected and unconnected countries clearly.'],
    cons: ['Any use counts, however occasional; many figures are ITU estimates.'],
    blindSpot: 'Low.',
    biasRisk: 'Low'
  },
  {
    id: 'electricity_access',
    whatItMeasures: 'Share of people with access to electricity.',
    pros: ['A basic precondition for light, refrigeration and study.'],
    cons: ['Ignores reliability: a daily blackout counts as access.', 'Rich countries are all at 100%.'],
    blindSpot: 'Low.',
    biasRisk: 'Low'
  },
  {
    id: 'wb_lpi_infrastructure',
    whatItMeasures: 'Customs, transport infrastructure and shipping reliability, rated by logistics professionals (2023 edition).',
    pros: ['Shows how well goods move in and out of a country.'],
    cons: ['A survey of freight forwarders about trade, which says little about everyday transport.', 'Favours small trading hubs over large inland countries.'],
    blindSpot: 'Built around export trade.',
    biasRisk: 'Medium'
  },

  {
    id: 'climate_comfort',
    whatItMeasures: 'How pleasant the weather is in the cities where people live, from WorldClim climate normals.',
    pros: ['Weighted by population, so empty deserts and tundra don\'t skew it.', 'Every threshold is published.'],
    cons: ['“Pleasant” is a judgement: 20 to 28°C days, dew point under 16°C, under 100 mm of rain a month.', 'Uses 1970 to 2000 normals, before recent warming.'],
    blindSpot: 'Reflects one temperate-climate taste; people acclimatise.',
    biasRisk: 'High'
  },

  {
    id: 'who_pm25',
    whatItMeasures: 'Average fine-particle (PM2.5) air pollution where people live.',
    pros: ['The pollutant most linked to ill health; modelled from satellites where monitors are lacking.'],
    cons: ['Desert dust counts the same as smoke and exhaust, which penalises the Gulf and the Sahel.'],
    blindSpot: 'Low.',
    biasRisk: 'Low'
  },
  {
    id: 'safe_drinking_water',
    whatItMeasures: 'Share of people with clean water on premises, available when needed.',
    pros: ['The strictest international standard, including water-quality testing.'],
    cons: ['Only 134 ranked countries report it.', 'National averages hide gaps between town and country.'],
    blindSpot: 'Assumes piped, regulated utilities.',
    biasRisk: 'Low'
  },
  {
    id: 'yale_epi',
    whatItMeasures: 'Environmental health, ecosystem protection and climate policy, combined from dozens of indicators.',
    pros: ['Transparent, with all weights published.'],
    cons: ['Overlaps with the air and water indicators here.', 'Rich countries can score well while outsourcing polluting production.'],
    blindSpot: 'Rewards rich-country regulation; low consumption gets little credit.',
    biasRisk: 'Medium'
  },
  {
    id: 'nd_gain_resilience',
    whatItMeasures: 'Vulnerability to climate change combined with readiness to adapt.',
    pros: ['Covers 183 countries over many years.'],
    cons: ['Half of it is “readiness” (economy, governance), which overlaps other dials.'],
    blindSpot: 'Rich countries score well almost automatically.',
    biasRisk: 'Medium'
  }
];

export const COUNTRY_ANOMALIES: CountryAnomalyCaseStudy[] = [
  {
    id: 'sgp-liberties',
    countryName: 'Singapore',
    iso3: 'SGP',
    headline: '1st for government effectiveness, 118th for press freedom',
    rankText: 'Government effectiveness: 1st of 186. Press freedom: 118th of 175.',
    whyItLooksWrong: 'Singapore is clean, efficient and has the lowest homicide rate in the data (0.1 per 100,000).',
    theRealExplanation: 'Governance indices reward effective administration; rights indices reward a free press and political competition. Singapore leads on the first and trades away some of the second.',
    whereItBalancesOut: 'It ranks 19th overall at 50%. Its humid climate also costs it: 178th of 184 for weather.',
    relatedIndicatorId: 'rsf_press_freedom'
  },
  {
    id: 'usa-income',
    countryName: 'United States',
    iso3: 'USA',
    headline: '9th for income, 142nd for road safety',
    rankText: 'GDP per capita: 9th of 181. Road deaths: 142nd of 183.',
    whyItLooksWrong: 'The world\'s largest economy, with broadband among the fastest anywhere (6th).',
    theRealExplanation: 'Income doesn\'t buy everything: 18.4 road deaths and 5.8 homicides per 100,000, and healthy life expectancy of 64.6 years (81st). The Peace Index adds political instability (132nd of 161).',
    whereItBalancesOut: '35th overall at 50%. Weighting economy and infrastructure lifts it; safety and health pull it down.',
    relatedIndicatorId: 'gdp_per_capita_ppp'
  },
  {
    id: 'nor-nordic',
    countryName: 'Norway',
    iso3: 'NOR',
    headline: 'top five overall, 177th for weather',
    rankText: 'Press freedom: 1st. Rule of law: 3rd. Climate comfort: 177th of 184.',
    whyItLooksWrong: 'Long dark winters and cool summers aren\'t everyone\'s idea of the best place to live.',
    theRealExplanation: 'Most league tables leave the weather out. Norway is near the top of almost every institutional index, so it ranks 4th at 50%.',
    whereItBalancesOut: 'Turn weather and climate up to 100% and Australia, New Zealand, Spain and Portugal move ahead of it.',
    relatedIndicatorId: 'climate_comfort'
  },
  {
    id: 'mex-climate',
    countryName: 'Mexico',
    iso3: 'MEX',
    headline: '7th for weather, 182nd for organised crime',
    rankText: 'Climate comfort: 7th of 184. Organised crime: 182nd of 184.',
    whyItLooksWrong: 'One country appears to be both among the most pleasant and among the most dangerous.',
    theRealExplanation: 'Most Mexicans live on the central plateau, where Mexico City and Guadalajara are mild all year. Cartel violence is concentrated in particular states. National averages hide both.',
    whereItBalancesOut: 'It ranks 7th of 184 on the weather and climate dimension and 179th of 185 on safety and peace, so the dials you raise decide where it lands.',
    relatedIndicatorId: 'organized_crime_index'
  },
  {
    id: 'jpn-disasters',
    countryName: 'Japan',
    iso3: 'JPN',
    headline: '2nd for healthy lifespan, 166th for disaster risk',
    rankText: 'Healthy life expectancy: 2nd, at 72.2 years. WorldRiskIndex: 166th of 184.',
    whyItLooksWrong: 'Japan has some of the best building codes and emergency services in the world.',
    theRealExplanation: 'The WorldRiskIndex multiplies exposure by vulnerability. Japan\'s vulnerability is low, but its exposure to earthquakes, tsunamis and typhoons is among the highest on Earth.',
    whereItBalancesOut: 'It is one of five safety indicators, so Japan still ranks 14th overall.',
    relatedIndicatorId: 'world_risk_index'
  }
];
