# SnapNest 📸🪺

**Turn your screenshots into an organised life.** Everyone's camera roll is
full of things they meant to remember — products, gigs, recipes, job adverts,
messages to answer. SnapNest catches them in a cosy inbox, reads them with a
tiny on-device brain, and turns each one into a smart little card: a wishlist
item with its price, an event with its date, a recipe with its ingredients,
a reply you owe someone lovely.

Built with **Expo SDK 57** — runs entirely inside **Expo Go**. No accounts, no cloud:
your whole nest lives on your device.

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

Then scan the QR code with **Expo Go** and open your nest. 🪺

> If your PC and phone are on different networks, use `npx expo start --tunnel`.

---

## What's inside

- **Six cute onboarding screens** — a smiling camera in a cloud, your camera
  roll's messy pile, one screenshot blooming into three tidy cards, interest
  bubbles to pick what you save most, a padlock hugging a photo (your privacy,
  in writing), and a first Nest that sorts itself in front of you.
- **The Nest Brain 🧠** — a little parser that lives on your phone and reads
  screenshot text: it works out *what* you saved (product, event, recipe, job,
  outfit, place, message, trip or idea) and pulls out the useful bits — prices,
  "was" prices, dates and doors times, salary ranges, deadlines, ingredients,
  postcodes, senders. Then it shows its working: *"Found a price — £54.99"*.
- **A screenshot inbox** — new arrivals wait like unread messages, each one a
  scan away from becoming a card. A rose beam sweeps, the Brain explains, you
  tweak anything, and it files itself into the right Nest.
- **A home worth waking up to** — *"Good morning, Becca 🌸"*, a Today strip
  (gigs coming up, jobs to apply for, Sophie still waiting on you, a £12 price
  drop), and pastel shelves: Upcoming, Saved products, Reply later, Recipes,
  Dream trips, Recently added.
- **Nests** — every kind of card has a pastel folder, you can build custom
  Nests (trip plans, house dreams), and a weekly recap is ready to share:
  *"5 saved · 3 ticked off · 1 price drop 📉"*.
- **Ask My Screenshots 💭** — type *"pink trainers"* or *"jobs in crawley"*
  and the Brain rummages through every card it ever filed.
- **Honest edges** — 30 free scans a month with a soft, sweet nudge towards a
  £3.99 SnapNest Plus that politely admits it isn't on sale yet. Recipes tick
  off as you shop, messages mark themselves replied, cards remember the
  screenshot they came from so you can clean up your camera roll.
- **Gentle by design** — bouncing pastel cards, three hand-drawn SVG mascots,
  and every animation honors your system Reduce Motion setting.

## How the "AI" works (a promise, not a trick)

There is no cloud and no model API in here. The Nest Brain is honest,
hand-tuned pattern reading — keyword banks, date grammar, price and postcode
regexes — running entirely on your device, with unit tests to keep it sharp.
The six **sample screenshots** are drawn procedurally and carry their own
text, which the Brain reads live, exactly the way it reads anything else.
For your own screenshots, Expo Go can't yet see *inside* the image — so you
lend the Brain the words: copy them with iOS Live Text (or type a line or
two), paste, and the same magic runs. A future standalone build would slot
real OCR into that exact seam.

## Lineage

SnapNest is the fourth life of this repository (MoodScape → a quiet pause →
Ember, who still glows in the git history). The family DNA carries on: a
living pastel world drawn in code, everything stored on-device, seeded
randomness so your nest never rearranges itself — turned, this time, toward
the two hundred screenshots you were always going to sort out someday.
