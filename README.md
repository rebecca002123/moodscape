# MoodScape 🌌

**A living emotion world.** Every feeling you plant becomes a floating glass island
in an endless sky — and the world keeps growing with you.

Built with **Expo SDK 54** — runs entirely inside **Expo Go**. No accounts, no cloud:
your whole sky lives on your device.

---

## Run it

You need: [Node.js](https://nodejs.org) and the **Expo Go** app on your phone
(iOS / Android — make sure it's up to date, SDK 54).

```bash
git clone https://github.com/rebecca002123/moodscape.git
cd moodscape
npm install        # also paints the app icon + synthesizes the ambient audio (postinstall)
npx expo start
```

Then scan the QR code with **Expo Go** and step into your sky. 🌱

> If your PC and phone are on different networks, use `npx expo start --tunnel`.

---

## What's inside

- **A living sky** — sunrise, bright afternoons, golden hour, starlit nights with aurora.
  The world follows your clock, and **real weather** (Open-Meteo, no key) bends the light:
  rain, snow, fog and storms fall across everything.
- **Procedural glass islands** — every memory grows a unique island seeded by its own id.
  Mood decides the landscape: happy blooms with crystal trees and butterflies, excited
  pours waterfalls, peaceful holds a misty lake, sad brings gentle rain, anxious drifts
  in fragments, inspired raises auroras and crystal towers. Season, hour, weather and the
  **tone of your words** all leave marks.
- **Planting a memory** — tap **＋**: a glass seed wakes and grows as you add a mood,
  journal, tags, weather, a photo portal and a voice crystal. Then it blooms. 🌱
- **Time travel** — pinch out to rise above the world; recent islands glow at the centre,
  older ones drift outward. Double-tap to come home.
- **Lumi, your companion** — a small orb of light with on-device insights: streaks,
  weekly moods, recurring threads, and gentle flights back to old memories.
- **World evolution** — 5 islands wake distant mountains, 10 summon fireflies,
  25 raise a floating city… the sky keeps secrets up to 1000.
- **Sound** — an ambient soundscape loop and a soft glass chime when an island blooms
  (toggle in Lumi's panel).
- **Accessibility** — honours system Reduce Motion, VoiceOver labels throughout.

Everything is **on-device**: journal sentiment is read locally, memories are stored in
AsyncStorage, and nothing ever leaves your phone. 🔒

## Assets

`npm install` runs `scripts/setup-assets.js`, which paints the icon/splash PNGs and
synthesizes `ambient.wav` / `chime.wav` in pure Node — no downloads, no dependencies.
If you have the full **MoodScape.zip** (with the AI-painted icon and studio audio),
just drop its `assets/` folder over the generated one — same filenames.

## Project structure

```
App.js                    entry
src/
  screens/WorldScreen.js  the endless sky, camera gestures, HUD
  components/
    Sky.js                crossfading time-of-day gradients, sun/moon, stars, aurora
    Clouds.js             drifting glass clouds (parallax)
    Particles.js          light motes & fireflies
    WeatherOverlay.js     rain / snow / fog / lightning
    Island.js             procedural SVG glass island + animated overlays
    SeedComposer.js       the memory-planting flow
    IslandDetail.js       opening a memory
    CompanionOrb.js       Lumi + insights, milestones, settings
    GlassPanel.js         liquid-glass primitives
  state/MemoryStore.js    on-device persistence (AsyncStorage)
  utils/                  seeded rng, palettes, moods, island generator, sentiment
  services/               weather (Open-Meteo), insights
scripts/setup-assets.js   procedural icon + audio generator (postinstall)
```

## Ideas for the future

The design leaves room for Supabase sync, Apple/Google sign-in, Spotify forests,
widgets, and LLM-written yearly reflections — the current build is fully offline
so it runs in Expo Go with zero setup.

Made with Kimi. 💜
