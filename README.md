# MoodScape 💙

**A Liquid Glass mood journal.** Check in with a ten-second tap, watch your inner
weather move across real glass, and let the patterns behind your days surface.

Designed in the spirit of Apple's **Liquid Glass** language: real blur panes with
specular top edges, floating capsule controls, a slow aurora drifting beneath every
surface, and springy, haptic touches everywhere.

Runs entirely inside **Expo Go** — no accounts, no cloud, no build step.
Your journal never leaves your phone.

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

- **Today** — pick one of six liquid glass mood orbs (each with its own little
  face), and the whole sky washes with that mood's glow. Add a note and context
  tags, then save with a mood-tinted capsule button. Streak chip keeps you honest.
- **Journal** — your history in glass cards, grouped by day. Long-press any
  check-in to delete it.
- **Insights** — streaks, check-in counts and your "typical" mood; a smooth
  mood curve over 7 or 30 days; a five-week heatmap of tinted glass tiles;
  your mood mix; and the tags that shape your days.
- **Settings** — Auto/Light/Dark glass, haptics toggle, sample-data fill for a
  quick tour, and one-tap erase.

### The Liquid Glass system

Every surface is built from one material recipe (`src/components/Glass.js`):
a real `expo-blur` pane, a whisper of fill, a hairline stroke, a bright specular
top edge and a soft lifting shadow. Segmented controls and the floating tab bar
share a sliding "liquid pill". Beneath it all, `AuroraBackground` drifts four
soft radial blobs so the glass always has something to refract — and it honours
system **Reduce Motion**.

- Adaptive **light & dark** themes, SF-flavoured type scale
- **Haptics** on every meaningful touch (toggleable)
- **On-device only**: AsyncStorage persistence, zero network calls
- VoiceOver labels throughout

## Project structure

```
App.js                        providers + root
src/
  AppShell.js                 aurora + panes + floating tab bar
  theme/theme.js              Liquid Glass material tokens, type scale
  theme/moods.js              the six moods: gradients, glows, scores
  components/
    Glass.js                  GlassSurface / buttons / chips / segmented
    AuroraBackground.js       drifting radial glow field
    MoodOrb.js                glass spheres with faces (picker + hero)
    TabBar.js                 floating capsule tab bar, SVG icons
    charts.js                 mood curve, 5-week heatmap, mood mix bars
  screens/                    Today, Journal, Insights, Settings
  state/store.js              entries + settings (AsyncStorage)
  utils/                      dates, stats, haptics
scripts/setup-assets.js       paints icon/splash PNGs in pure Node (postinstall)
```

## Ideas for the future

Reminders via local notifications, widgets, iCloud/Supabase sync, exporting a
year-in-review — the current build stays fully offline so it runs in Expo Go
with zero setup.
