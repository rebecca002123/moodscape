# Prism 🔺

**A Liquid Glass habit tracker.** Small daily rituals, refracted into streaks,
rings and light. Tap the glass, keep the spectrum moving.

Designed in the spirit of Apple's **Liquid Glass** language: real blur panes
with specular top edges, floating capsule controls, prismatic light shafts
drifting beneath every surface, and springy, haptic touches everywhere.

Runs entirely inside **Expo Go** — no accounts, no cloud, no build step.
Your habits never leave your phone.

---

## Run it

You need [Node.js](https://nodejs.org) and the **Expo Go** app on your phone
(iOS or Android — keep it up to date).

```bash
git clone https://github.com/rebecca002123/moodscape.git
cd moodscape
npm install        # also paints the app icon + splash (postinstall, pure Node)
npx expo start
```

Scan the QR code with Expo Go and you're in.

> Phone and computer on different networks? Use `npx expo start --tunnel`.

---

## What's inside

- **Today** — your daily ring fills as you check habits off; each habit is a
  glass card with its own gradient, icon and live streak flame. A week strip
  of mini rings lets you hop back up to six days to fix a missed check-off.
  Long-press any habit to edit it.
- **The spectrum "+"** — a rainbow-ringed glass button opens the habit
  composer: name, 16 hand-drawn icons, 8 gradient colours, and per-weekday
  scheduling.
- **Stats** — best streak, perfect days and total check-offs; a twelve-week
  heatmap of glass tiles that brighten with fuller days; and a per-habit
  breakdown with completion bars, current and best streaks.
- **Settings** — Auto/Light/Dark glass, haptics toggle, eight weeks of sample
  data for a quick tour, and one-tap erase.
- **Starter rituals** — an empty journal offers six one-tap presets, from
  *Drink water* to *Touch grass*.

### The Liquid Glass system

Every surface is built from one material recipe (`src/components/Glass.js`):
a real `expo-blur` pane, a whisper of fill, a hairline stroke, a bright
specular top edge and a soft lifting shadow — plus Prism's signature, a faint
rainbow refraction along hero panes. Segmented controls and the floating tab
bar share a sliding "liquid pill". Beneath it all, `Backdrop` drifts pools and
slanted shafts of coloured light so the glass always has something to refract —
and it honours system **Reduce Motion**.

- Adaptive **light & dark** themes, SF-flavoured type scale
- Animated SVG **progress rings** with spring physics
- **Haptics** on every meaningful touch (toggleable)
- **On-device only**: AsyncStorage persistence, zero network calls
- VoiceOver labels throughout; every glyph is hand-drawn SVG — no icon fonts

## Project structure

```
App.js                        providers + root
src/
  AppShell.js                 backdrop + panes + tab bar + editor sheet
  theme/theme.js              Liquid Glass material tokens, type scale, spectrum
  theme/habitStyle.js         habit colours, icon list, starter presets
  components/
    Glass.js                  GlassSurface / buttons / chips / segmented
    Backdrop.js               drifting light pools + prismatic beams
    ProgressRing.js           spring-animated gradient ring
    HabitEditor.js            bottom-sheet habit composer
    TabBar.js                 floating capsule bar + spectrum "+"
    icons.js                  the whole glyph set, hand-drawn SVG
  screens/                    Today, Stats, Settings
  state/store.js              habits + completions + settings (AsyncStorage)
  utils/                      dates, stats (streaks, heatmap), haptics
scripts/setup-assets.js       paints icon/splash PNGs in pure Node (postinstall)
```

## Ideas for the future

Reminders via local notifications, home-screen widgets, iCloud sync, habit
notes and monthly reviews — the current build stays fully offline so it runs
in Expo Go with zero setup.
