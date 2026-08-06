# Summit ⛰

**The long climb of your credit.** Log your score whenever you check it, and
Summit charts the trail behind you and forecasts the route ahead — *is it going
up, by how much, and when* — with the reasoning laid out in plain words.

Built with **Expo SDK 57** — runs entirely inside **Expo Go**. No accounts, no cloud:
your whole climb lives on your device. Summit never connects to your credit report.

---

## Run it

You need [Node.js](https://nodejs.org) and the **Expo Go** app on your phone
(iOS / Android — make sure it's up to date).

```bash
git clone https://github.com/rebecca002123/moodscape.git
cd moodscape
npm install
npx expo start
```

Then scan the QR code with **Expo Go** and start climbing. ⛰

> If your PC and phone are on different networks, use `npx expo start --tunnel`.

---

## How it works

- **The altimeter** — your latest score on the 300–850 dial, its band
  (Poor → Excellent), and how far you've climbed since the last reading.
- **The ascent** — a chart of every score you've logged, then a dashed
  *estimated route* for the next twelve months inside a widening
  *likely range* cone. Your checkpoint (goal score) sits on the chart as a
  gold line, with an ETA when the route crosses it.
- **The route report** — the headline answer ("Climbing — likely +6–31 pts by
  November"), the next-3-months and next-12-months ranges, and the *why*:
  every force the forecast sees, in plain words.
- **Waypoints** — gains with dates already on the calendar: a hard inquiry
  stops counting about a year after it happened, new-account drag lifts near
  six months, late marks fade at one and two years and fall off near seven.
  Each waypoint shows its month and its estimated lift.
- **Levers** — gains that wait on a choice instead of a date, listed
  separately: paying utilization below 30% (or under 10%) usually shows up
  within a statement cycle or two. The forecast itself never assumes you pull
  them.
- **What my report knows** — tell Summit your card utilization, hard
  inquiries, new accounts, and late marks (month precision — exactly as
  precise as a credit report gets), set a checkpoint score, and manage your
  trail log. The more it knows, the sharper the route.

## How the forecast is built — and what it isn't

Summit blends the **trend of your own logged scores** (weighted toward recent
readings, decaying with distance — momentum isn't a promise) with
**widely-published scoring patterns that have predictable timing** (inquiry
and late-mark aging, new-credit drag, the slow lift of a clean paying file).
Drift is re-computed for every projected month, so a dent that ages out
mid-forecast stops muting the climb from that month on.

The real scoring formulas are proprietary. That's why every number in Summit
is a **range**, the range **widens with distance**, and the app says so on its
face. It is an estimate to plan around — not your bureau's math, and not
financial advice. Your actual reports are free at
[annualcreditreport.com](https://www.annualcreditreport.com).

## Lineage

Summit is the fourth life of this repository (after MoodScape, whose spirit
lives on in [Constella](https://github.com/rebecca002123/Expo-app), and
Ember). It keeps the family's DNA — a living night scene, everything stored
on-device, seeded randomness so your mountain never rearranges itself — and
turns it toward the longest climb most of us are on: the slow, patient one
toward a better score.
