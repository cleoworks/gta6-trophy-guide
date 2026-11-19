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

## Screenshots

Four renders of the app itself, in the order the judge sees them:

1. `screenshots/1-cover.jpg` — the checklist with a guide open: medal-grade trophy rows, the progress card, filters, and the guide panel with its missable alert, steps and sources in one screen.
2. `screenshots/2-roadmap.jpg` — the Roadmap to Platinum view: five numbered stages plus the save-discipline callout.
3. `screenshots/3-missables.jpg` — the Missables tab: both flagged trophies with their designed warning alerts and the saves that cover them.
4. `screenshots/4-spoiler.jpg` — spoiler mode on: unearned story trophies masked in the list, an earned one open with its Sources section.

## What changed in v3

- **A professional redesign, end to end.** v2 worked but looked home-made — flat boxes, a coloured dot for the grade, bare checkboxes. v3 gives the app a real design system: near-black charcoal surfaces with hairline borders, one restrained gold brand accent, a consistent spacing scale and type hierarchy, and grade colours reserved for medals.
- **Real grade medallions.** Every trophy row now carries a CSS medallion in true grade colours (pale cyan-white platinum, gold, silver, bronze) with a star glyph and a check badge once earned, instead of a plain dot; the header counts earned trophies per grade with matching mini-medals.
- **A structured guide panel.** The detail view now reads like a published guide page: medallion banner, the official description as a labelled quote block, and Guide / Steps / Sources sections with small-caps labels and dividers; numbered steps get gold counters, and the missable warning is a designed alert with an icon rather than a plain red box.
- **Finished controls.** Tabs are a segmented control, the spoiler setting is a switch, filter chips and Export / Import / Reset share one button system, and the Roadmap stages carry numbered markers.
- **Nothing else moved.** Same 55 trophies with the same names, descriptions, grades and guides; same tracker behaviour, storage keys and export format. Data file gained only an edition note.

## What changed in v2

- **The Missables tab is now shown.** v1's screenshot set never displayed it; the third screenshot now shows the flagged trophies and their warnings directly.
- **The five still-unconfirmed hidden trophies got fuller guides.** In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There and Ten Pin still have no confirmed unlock method anywhere — PowerPyx lists all five as currently unknown — so their guides now say exactly that, cite PowerPyx and GTABase alongside Exophase and Outputlag, pass on each source's best current theory (a motorcycle melee kick for Ten Pin, a Payday Loans link for Bad Luck, I Guess, a UFO questline for The Truth Is Out There), and give the strongest description-based plan for each instead of a shrug.
- **Small tracker fix:** when a filter hides the trophy whose guide is open, the panel now moves to the first trophy still visible instead of pointing at one the list no longer shows.
- **Readability pass:** slightly larger trophy names, lighter list descriptions and looser guide line spacing, so the text survives being shrunk into a contact sheet.

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

Trophy names, descriptions and grades are PlayStation's official text, as listed by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Guide steps cite [Outputlag's GTA 6 Trophy List](https://outputlag.com/guides/gta-6-trophy-list/), [PowerPyx's GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) and [GTABase's Trophy Guide & Achievements List](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series) where they draw on them; every trophy's guide names its sources in the app.

Unofficial fan guide. Not affiliated with Rockstar Games. No Rockstar logo, artwork or game screenshots are used.

## License

MIT — see [LICENSE](LICENSE).
