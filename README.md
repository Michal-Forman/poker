# Poker Chip Tracker

A Texas Hold'em chip tracker PWA. The phone lays flat on the table — players use physical cards and the app replaces the chip set.

No backend. All state is client-side and persists across page refreshes via `localStorage`.

## Features

- Full Texas Hold'em betting flow: Pre-Flop → Flop → Turn → River → Showdown
- Fold / Call / Raise actions with automatic round advancement
- Blind posting and dealer rotation across hands
- Split-pot support for ties
- Offline play via service worker
- Installable as a PWA (fullscreen, portrait)

## Getting Started

```bash
cd Webapp
npm install
npm run dev       # dev server at localhost:5173
npm run build     # TypeScript check + production build
npm run preview   # serve production build locally
```

## Stack

- React 18 + TypeScript
- Vite + vite-plugin-pwa
- Tailwind CSS
- Zustand (state + localStorage persistence)

## License

MIT
