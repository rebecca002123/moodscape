# MoonMuse Studio — Celestial Life OS (Notion Template)

> **How to install:** Notion templates can't be shipped as a file — they live in
> Notion itself. This document is the complete build: copy each section below
> into a fresh Notion page (paste as Markdown), create the databases where
> marked, and set the icons from the `notion-icons/` folder. Total build time:
> about 20 minutes, once. Then click Share → duplicate for your customers, and
> sell the duplication link.

---

## Page structure

```
🌙 MoonMuse Life OS            (cover: use desktop wallpaper dt-1-macbook-dark.png)
├── ✦ Today                    (daily dashboard)
├── ◎ Goals
├── 🗂 Projects
├── £ Finance
├── 📖 Reading
├── 🎬 Movies & TV
├── ✈ Travel
├── ♡ Wishlist
├── ✎ Journal
├── ✓ Habits
└── ▦ Calendar
```

Set each page's icon from `notion-icons/` (Upload an image → pick the matching
`ni-*.png`). Use **cream page backgrounds, default text colour, and gold
callouts sparingly** — the whole system should feel like paper, not software.

## ✦ Today (dashboard)

Paste this layout, then convert the three columns with `/columns`:

```
## Good morning.
> “Plan by moonlight — quietly, and in phases.”

### Today            ### This week          ### On the horizon
[Linked view:        [Linked view:          [Linked view:
 Tasks, filter:       Tasks, filter:         Goals, filter:
 Due = Today]         Due = This week]       Status = Active]
```

**Tasks database** (create once, `/database inline`):
| Property | Type | Notes |
|---|---|---|
| Task | Title | |
| Due | Date | |
| Project | Relation → Projects | |
| Phase | Select: New · Waxing · Full · Done | the MoonMuse status set |
| Energy | Select: Low · Medium · Deep | plan by energy, not hours |

## ◎ Goals

Database, gallery view, big cards:
| Property | Type |
|---|---|
| Goal | Title |
| Season | Select: Q1–Q4 |
| Why it matters | Text |
| First small step | Text |
| Phase | Select: New · Waxing · Full · Complete |
| Progress | Number (percent) — show as bar |

## 🗂 Projects
Table + board grouped by Phase. Properties: Project (title), Status (Select), Deadline (Date), Tasks (Relation → Tasks), Notes (Text).

## £ Finance
Three inline databases: **Income** (Source, Expected, Actual, Month),
**Fixed costs** (Item, Amount, Day due, Paid ✓), **Spending log** (Date, What,
Category select, Amount). Add a linked view of Spending log grouped by
Category with Sum on Amount — that's the monthly review.

## 📖 Reading
Gallery. Properties: Title, Author, Status (To read · Reading · Finished),
Rating (Select ✦–✦✦✦✦✦), Finished on (Date), One-line review (Text).

## 🎬 Movies & TV — same shape as Reading, plus Where to watch (Text).

## ✈ Travel
Board grouped by Status (Dreaming · Planned · Booked · Been). Properties:
Place, Dates, Budget, Notes, Photos (Files).

## ♡ Wishlist
Table: Item, For (me / gift), Price, Link (URL), Priority (Select), Bought ✓.

## ✎ Journal
Database, list view, sorted by Date desc. Template button inside named
**“Tonight's page”** containing: Date (today), *What filled my sky today?*,
*One small light I'm grateful for*, *Tomorrow's first step*.

## ✓ Habits
Table with one row per habit and 31 checkbox properties (1–31), or simpler:
a database with Date + one checkbox per habit and a weekly linked view.
Phase column optional but pleasing.

## ▦ Calendar
A calendar view of Tasks (by Due) with a second calendar of Journal (by Date)
below it. Nothing else — the calendar should be the quietest page.

---

### Widget suggestions (all free, all optional)
- Weather / clock: indify.co widgets in cream/navy match perfectly
- Moon phase: embed `https://www.moongiant.com/phase/today` as a bookmark, or skip widgets entirely — the template is designed to work without any.

### Design rules
1. Icons only from `notion-icons/` — no emoji soup.
2. Gold callouts (`/callout`, background none, gold ✦ icon) for anything important.
3. One database per idea. If a page needs three databases, it's two pages.
