[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/cleoworks/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/cleoworks/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Ledger — GTA VI Trophy Guide & Tracker

The offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: **1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 hidden**.

- **Checklist tracker** — tick trophies off; progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, online) and by grade, plus search.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the platinum** — five stages from Chapter 1 to 100% completion, built from the official trophy descriptions.
- **Missables flagged** — 1 confirmed missable (Lucia's balcony meditation, Chapter 1) and 1 time-sensitive strand race, with the save discipline that covers both: a manual save at the start of every chapter, since there is no mission replay.
- **A guide for every trophy, in our own words, with sources** — what to do, where, how, and when it can be missed. Steps that come from a published launch-week guide cite it; where no published guide confirms a location or method, the guide says so instead of inventing one.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network: `app/` is plain static files (`index.html`, `app.js`, `style.css`, `data/trophies.json`) and works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

Trophy names, descriptions and grades are PlayStation's official text, as listed by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Guide steps cite [Outputlag's GTA 6 Trophy List](https://outputlag.com/guides/gta-6-trophy-list/) where they draw on it; every trophy's guide names its sources in the app.

Unofficial fan guide. Not affiliated with Rockstar Games. No Rockstar logo, artwork or game screenshots are used.

## License

MIT — see [LICENSE](LICENSE).
