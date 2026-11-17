# The dataset

How the site's figures are scored, and how the maintainer rebuilds them. They are built offline from a snapshot of
each publisher's file, kept in `data/sources/`. The build needs no network access, so the same snapshot always gives
the same dataset.

## Rebuild from the snapshots

```bash
pip install pandas python-calamine pycountry
python3 scripts/build_dataset.py   # writes src/data/*.json and SOURCES.md
```

Then set `DATA_UPDATED` in `src/config.ts` to the date of the rebuild and run `npm test`. Behind the rankings quotes
ranks, scores and correlations by hand (`src/data/indexBiases.ts`); `test/critique.test.ts` recomputes each one from
the data, so a figure that has moved fails the tests and names the text to correct.

## Download the sources again

```bash
pip install pandas python-calamine pyreadr pycountry rasterio geopandas pyarrow
./scripts/fetch_sources.sh         # needs curl, unzip and pdftotext (poppler)
python3 scripts/build_dataset.py
```

`fetch_sources.sh` downloads each source from its publisher into `data/sources/`. Large intermediate downloads go to
`data/raw/`, which is not committed.

## Method

The scoring rules (the goalposts, the minimum number of indicators, how dimensions are averaged and the one averaged
value) are set out in [SOURCES.md](../SOURCES.md), which `build_dataset.py` writes from the same constants it scores
with. The browser then weights and ranks the scores (`src/lib/scoring.ts`).

Climate comfort is the one derived indicator. It is computed from WorldClim 2.1 monthly climate normals at every
city of 15,000 or more people (GeoNames), weighted by population, so that it reflects the climate where people live.
The comfort thresholds are in `scripts/derive_climate.py`.

## Files

| Path | Contents |
|---|---|
| `data/sources/` | Source snapshots (spreadsheets, CSVs and API responses) |
| `scripts/fetch_sources.sh` | Downloads every source from its publisher |
| `scripts/build_dataset.py` | The indicator catalogue, normalisation and ranking; writes `src/data/*.json` and `SOURCES.md` |
| `scripts/derive_climate.py`, `scripts/derive_broadband.py` | Turn WorldClim/GeoNames and Ookla tile data into country values |
| `src/data/indexBiases.ts` | The commentary on Behind the rankings |
| `src/lib/scoring.ts` | The scoring in the browser: overall scores, ranks, and each country's strengths and weaknesses |
