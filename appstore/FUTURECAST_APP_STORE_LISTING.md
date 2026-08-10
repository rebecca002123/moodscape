# FutureCast — App Store Connect submission package

Everything below is paste-ready for App Store Connect
(**appstoreconnect.apple.com → My Apps → FutureCast → iOS App → the version
you're preparing**). It is written for the weather app in
`rebecca002123/glasscast` (bundle id `com.rebeccaguntrip.ahead`), which is the
app this listing describes.

Character limits are noted next to each field; every entry below fits its
limit.

---

## 1. App Information (left sidebar → App Information)

| Field | Value |
|---|---|
| **Name** (30 chars max) | `FutureCast` |
| **Subtitle** (30 chars max) | `Weather that warns you first` |
| **Primary Category** | Weather |
| **Secondary Category** | (leave empty) |
| **Content Rights** | Does not contain third-party content requiring rights (Apple Weather data is licensed through WeatherKit) |
| **Age Rating** | Answer "No" to everything → **4+** |

> ⚠️ **Display-name mismatch to fix before submitting a build:** the app's
> `Info.plist` currently sets `CFBundleDisplayName` to **"GlassCast AI"**, so
> the icon on the home screen will not say FutureCast. Change it to
> `FutureCast` in `ios/GlassCast/Resources/Info.plist` in the glasscast repo
> and rebuild, or Apple's reviewer may flag the name difference (and users
> will see a different name than the store page).

---

## 2. Promotional Text (170 chars max — editable anytime without review)

```
Rain starting in 25–40 minutes. Wind picking up this evening. FutureCast tells you what's about to change — with a time window, a confidence level, and the why.
```

---

## 3. Description (4000 chars max)

```
Most weather apps tell you what the sky is doing right now. FutureCast tells you what it's about to do — and how sure it is.

WHAT'S ABOUT TO CHANGE
FutureCast watches the forecast for your location and surfaces the next meaningful change: rain starting, rain stopping, wind picking up, temperature dropping. Every call comes with an estimated time window ("in 25–40 minutes"), never a false-precision single instant.

HONEST CONFIDENCE, ALWAYS
Every prediction carries a confidence level — Low, Medium, or High — based on probability, lead time, and whether independent forecast signals agree. Tap "Why we think this" to see the actual readings behind the call. FutureCast never says "it will rain" when the honest answer is "it looks likely."

MINUTE-BY-MINUTE RAIN
A precipitation chart shows the next hour minute by minute, so you know whether to wait out a shower or grab the umbrella now.

YOUR BEST WINDOW TO GO OUT
The second question everyone asks a weather app: "When should I go out?" FutureCast finds the best outdoor window in the hours ahead and scores it — and says nothing at all when the forecast is too thin to answer honestly.

IN SHORT
A plain-language summary tells you what the day actually means — no decoding icons or scanning tables. Nimbus, a small companion character, reacts to conditions alongside it (and can be turned off in Settings).

ALERTS THAT RESPECT YOU
Optional notifications warn you before a change arrives. Quiet hours are built in. FutureCast is honest about how iOS schedules background checks — it never claims to be watching continuously, because no app truthfully can.

LIVE ACTIVITIES
When a change is approaching, follow the countdown on your Lock Screen and in the Dynamic Island.

PRIVATE BY DESIGN
No account. No tracking. No servers of our own. Your location is used on your device and sent only to Apple Weather to fetch the forecast for where you stand — it is never stored, never linked to your identity, and never sold. Location access is "While Using the App" only.

Weather data provided by  Weather (Apple Weather).
```

---

## 4. Keywords (100 chars max, comma-separated, no spaces after commas)

```
weather,rain,forecast,alert,radar,hyperlocal,umbrella,wind,storm,minute,precipitation,notification
```
(99 characters. Don't repeat "FutureCast" or "weather app" — the name and
category already index those.)

---

## 5. Support URL and Privacy Policy URL (both required)

| Field | Value |
|---|---|
| **Support URL** | `https://github.com/rebecca002123/glasscast` (or a page you prefer — must be reachable) |
| **Privacy Policy URL** | Required before submission. A one-page policy stating what §7 below says is enough. GitHub Pages works fine. |

---

## 6. Screenshots — what to capture and how

App Store Connect requires at least one screenshot set. Upload **6.9-inch
iPhone** shots (1320 × 2868 px portrait); Apple scales them down for every
smaller size. (6.5-inch, 1284 × 2778, is also accepted.) iPad shots are not
needed — the app sets `supportsTablet: false`.

**How to capture (on your Mac):**
1. Open the project in Xcode (`xcodegen` first if needed — see
   APPLE_BUILD_GUIDE.md in the glasscast repo).
2. Run on the **iPhone 17 Pro Max** simulator (any 6.9-inch device).
3. Wait for a real forecast to load, then press **⌘S** in the simulator —
   screenshots land on the Desktop at exactly the right pixel size.
4. Drag them into App Store Connect → your version → **App Previews and
   Screenshots**.

**Shot list (in this order — the first two matter most):**

| # | Screen | What to show | Suggested caption (if you overlay text) |
|---|---|---|---|
| 1 | Home | Current weather hero + "next change" summary with a time window and confidence badge | *Know what's coming — and how sure we are* |
| 2 | Home (scrolled) | Minute-by-minute precipitation chart during/near rain | *The next hour, minute by minute* |
| 3 | Home | Outdoor window card with its score bar | *Your best window to go out* |
| 4 | "Why we think this" | The expanded reasoning view showing actual readings | *Every call shows its work* |
| 5 | Timeline | The day timeline view | *The whole day at a glance* |
| 6 | Smart Tools | Dry-gap finder + forecast confidence card | *Smart Tools that answer questions* |
| 7 | Lock Screen | Live Activity countdown to a change (optional but strong) | *Follow the change from your Lock Screen* |

Tips: use a location/time with weather actually happening (simulator →
Features → Location → Custom lets you set coordinates). Dark, rain-heavy
shots demo this app best. Plain screenshots are fine; captions are optional.

---

## 7. App Privacy (App Privacy section — must match the code's privacy manifest)

These answers mirror `PrivacyInfo.xcprivacy` in the repo. Answering anything
different is a rejection risk.

- **Do you collect data from this app?** → **Yes** (location is technically
  "collected" because it's sent off-device to Apple Weather)
- **Data type:** Location → **Precise Location**
  - Used for: **App Functionality** only
  - Linked to the user's identity: **No**
  - Used for tracking: **No**
- Every other data type: **not collected**
- Result shown on the store page: "Data Not Linked to You: Precise Location"

---

## 8. App Review Information (version page → App Review Information)

| Field | Value |
|---|---|
| **Sign-in required** | No — there are no accounts |
| **Contact** | Your name, phone, and email (rebeccaguntrip2001@gmail.com) |

**Notes for the reviewer (paste into the Notes field):**

```
FutureCast is a WeatherKit-based forecast app. No account or sign-in exists.

LOCATION: requested When-In-Use only, to fetch the Apple Weather forecast for
the user's current position. It is not stored on any server (the app has no
servers), not linked to identity, and not used for tracking. This matches the
app's privacy manifest (PrivacyInfo.xcprivacy).

WEATHER DATA ATTRIBUTION: Apple Weather attribution and the data-source link
are displayed in-app via WeatherKit's WeatherAttribution API (visible at the
bottom of the main screen).

NOTIFICATIONS: local notifications only, scheduled from background app
refresh. The app's own copy states that iOS controls background scheduling —
it makes no continuous-monitoring claims.

To see a forecast immediately: grant location when prompted, or add any city
from the Locations screen.
```

---

## 9. Remaining submission checklist (in order)

1. [ ] Fix `CFBundleDisplayName` → `FutureCast` (see §1 warning) and rebuild
2. [ ] Archive & upload a build (Xcode Organizer → Distribute App, or the
       Codemagic/EAS pipelines already in the glasscast repo)
3. [ ] Wait for the build to finish processing in ASC (~15 min), answer the
       export-compliance question: **No** (`ITSAppUsesNonExemptEncryption`
       is already false, so it may auto-answer)
4. [ ] Publish a privacy-policy page; paste both URLs (§5)
5. [ ] Paste Name/Subtitle (§1), Promotional Text (§2), Description (§3),
       Keywords (§4)
6. [ ] Capture and upload screenshots (§6)
7. [ ] Fill App Privacy answers (§7) — required before first submission
8. [ ] Select the build on the version page, fill App Review notes (§8)
9. [ ] Set pricing (Pricing and Availability → Free unless you choose
       otherwise)
10. [ ] **Add for Review → Submit**

Typical first review takes 24–48 hours. The most likely rejection risks for
this app — name mismatch, location justification, missing attribution,
privacy-label mismatch — are all addressed above.
