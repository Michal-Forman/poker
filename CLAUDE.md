# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Texas Hold'em chip tracker PWA. No backend — all state is client-side. The phone lays flat on the table; players use physical cards and the app replaces the chip set.

## Commands

All commands run from `Webapp/`:

```bash
npm run dev      # dev server (localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run preview  # serve the production build locally
```

## Architecture

**Stack**: React 18 + Vite + TypeScript + Tailwind CSS + Zustand + vite-plugin-pwa

```
Webapp/src/
├── types/game.ts          # All TypeScript types (Player, Phase, GameState, etc.)
├── store/gameStore.ts     # Single Zustand store — all game logic lives here
├── screens/
│   ├── SetupScreen.tsx    # Home screen: player names, chips, blinds config
│   └── GameScreen.tsx     # Main game view, rendered during all non-SETUP phases
└── components/
    ├── PlayerCard.tsx     # One player tile (chips, status, D/SB/BB badges)
    ├── PotDisplay.tsx     # Pot total + current phase label
    ├── ActionPanel.tsx    # Fold / Call / Raise controls for the active player
    └── WinnerModal.tsx    # Post-river: select winner(s), award pot
```

**State machine** (`Phase`): `SETUP → PRE_FLOP → FLOP → TURN → RIVER → SHOWDOWN → (next hand loops back to PRE_FLOP)`

`App.tsx` simply switches between `SetupScreen` (when `phase === 'SETUP'`) and `GameScreen` (all other phases).

**Game store** (`gameStore.ts`) owns all Texas Hold'em logic:
- `startGame(config)` — initialises players, posts blinds, sets UTG as first to act
- `fold() / call() / raise(totalBetAmount)` — betting actions; each checks if the round is over after the action and auto-advances the phase if so
- `nextRound()` — manual phase advance button (deals flop/turn/river)
- `awardPot(winnerIds[])` — splits pot among winners (floor division + remainder to first winner)
- `nextHand()` — rotates dealer, removes busted players, posts new blinds
- `resetToSetup()` — returns to SETUP phase

State is persisted to `localStorage` via Zustand's `persist` middleware (key: `poker-game-state`), so a page refresh survives.

**Blind posting**: blinds are deducted automatically at the start of each hand. `currentBet` starts at big blind value. UTG acts first pre-flop; post-flop action starts left of dealer.

**Betting round completion**: after every fold/call the store checks `isBettingRoundOver()` — all `active` players must have matched `currentBet`. If so, `advancePhase()` is called inline.

## PWA

`vite.config.ts` configures `vite-plugin-pwa` with a `fullscreen` portrait manifest and green theme (`#1a4731`). Icons live in `public/icons/`. The built service worker enables offline play.
