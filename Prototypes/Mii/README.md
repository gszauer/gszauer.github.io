# Tomodachi Mii Tracker

A phone-first, dark-mode **PWA** that works like the iOS *Contacts* app, for tracking
the Miis in *Tomodachi Life: Living the Dream* — their photos, names, the nicknames
they give each other, and how they feel about every food.

Everything is stored **on-device** (IndexedDB) and works **fully offline** once loaded.
No accounts, no servers, no network calls. Back up or move your data with **Export / Import**.

## Features

- **Miis tab** — an alphabetical contact list (A–Z section index, search, avatar bubbles).
  Tap a Mii to open it; **long-press** a row to reveal a red **Delete** (with confirm).
  The **+** button adds a Mii and drops you straight into its editable card.
- **Mii detail** — big avatar (tap in *Edit* mode to take a photo), name, and three sub-tabs:
  - **General** — Most Favorite / Favorite / Hated / Most Hated food summary + free-text **Notes**.
  - **Nicknames** — two linked lists: *nicknames this Mii has for others* and *nicknames others
    have for this Mii*. A nickname A→B automatically shows on both Miis and stays in sync.
  - **Food** — a 4-slot "at a glance" summary plus one list per taste level
    (Most Hated → Most Favorite). Long-press a slot to set it; **Add food** to any list.
- **Foods tab** — a matching contact list of foods. Tap for the food's card (which Miis
  love/hate it, derived automatically); **long-press** to jump into its edit view.
- **Data tab** — the whole database as JSON (photos inline as base64). **Apply** edits,
  **Select all**, **Export** to a `.json` file, or **Import** one back.

## Run it

A PWA needs to be served over `http(s)` or `localhost` (service workers and the home-screen
install do **not** work from `file://`). From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000 in a browser
```

(Any static file server works — e.g. `npx serve`.) To develop, just edit the files and reload;
bump `CACHE_VERSION` in `service-worker.js` when you change a shell file so clients refresh.

## Install on your phone (iOS)

1. Serve the folder somewhere your phone can reach it (your computer's LAN IP, or any static host
   such as GitHub Pages / Netlify).
2. Open it in **Safari** → **Share** → **Add to Home Screen**.
3. Launch it from the Home Screen — it runs full-screen, offline, in dark mode, and the camera
   button lets you photograph each Mii.

On Android, Chrome shows an **Install app** prompt instead.

> Tip: browsers can evict on-device storage under pressure. Use **Data → Export** now and then
> to keep a backup `.json` you can **Import** anywhere.

## Project layout

```
index.html              app shell + iOS/PWA meta tags
styles.css              iOS dark-mode design tokens + all component styles
app/store.js            data model, persistence (IndexedDB), mutations, import/export
app/ui.js               DOM builder, icons, avatars, camera, dialogs, long-press gestures
app/screens.js          every screen renderer + shared list/nav wiring
app/main.js             hash router + render loop + boot + service-worker registration
manifest.webmanifest    installable metadata
service-worker.js       cache-first offline app shell
icons/                  generated app / maskable / apple-touch icons
```

No build step, no dependencies — plain HTML/CSS/JS.
