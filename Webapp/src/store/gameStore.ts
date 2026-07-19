import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, Player, SetupConfig, Phase, SidePot } from '../types/game'

// ─── helpers ──────────────────────────────────────────────────────────────────

function nextActiveIndex(players: Player[], fromIndex: number): number {
  const count = players.length
  for (let i = 1; i <= count; i++) {
    const idx = (fromIndex + i) % count
    if (players[idx].status === 'active') return idx
  }
  return fromIndex
}

function inHandCount(players: Player[]): number {
  return players.filter(p => p.status !== 'folded').length
}

function isBettingRoundOver(players: Player[], currentBet: number): boolean {
  // All active players must have matched the current bet AND taken an action
  for (const p of players) {
    if (p.status === 'active') {
      if (p.currentBet < currentBet) return false
      if (!p.hasActed) return false
    }
  }
  return true
}

function postBlinds(
  players: Player[],
  dealerIndex: number,
  smallBlind: number,
  bigBlind: number
): { players: Player[]; sbIndex: number; bbIndex: number } {
  const count = players.length
  const sbIndex = (dealerIndex + 1) % count
  const bbIndex = (dealerIndex + 2) % count

  const updated = players.map((p, i) => {
    if (i === sbIndex) {
      const bet = Math.min(smallBlind, p.chips)
      return {
        ...p,
        chips: p.chips - bet,
        currentBet: bet,
        totalBet: bet,
        status: bet >= p.chips ? ('all-in' as const) : p.status,
      }
    }
    if (i === bbIndex) {
      const bet = Math.min(bigBlind, p.chips)
      return {
        ...p,
        chips: p.chips - bet,
        currentBet: bet,
        totalBet: bet,
        status: bet >= p.chips ? ('all-in' as const) : p.status,
      }
    }
    return p
  })

  return { players: updated, sbIndex, bbIndex }
}

// ─── side pot calculation ──────────────────────────────────────────────────────
// Side pots are determined by all-in bet levels. Each all-in creates a tier:
// everyone who put in at least that amount contributes to it, but only
// non-folded players at that level are eligible to win it.

export function computeSidePots(players: Player[]): SidePot[] {
  const allInPlayers = players.filter(p => p.status === 'all-in')

  if (allInPlayers.length === 0) {
    // No all-ins → single pot, all non-folded players eligible
    const eligible = players.filter(p => p.status !== 'folded').map(p => p.id)
    const total = players.reduce((sum, p) => sum + p.totalBet, 0)
    return total > 0 ? [{ amount: total, eligiblePlayerIds: eligible }] : []
  }

  // Unique all-in bet levels sorted ascending
  const levels = [...new Set(allInPlayers.map(p => p.totalBet))].sort((a, b) => a - b)

  const pots: SidePot[] = []
  let prevLevel = 0

  for (const level of levels) {
    const increment = level - prevLevel
    // All players (including folded) who put in at least `level` contribute chips here
    const contributors = players.filter(p => p.totalBet >= level)
    const amount = increment * contributors.length
    const eligiblePlayerIds = contributors
      .filter(p => p.status !== 'folded')
      .map(p => p.id)
    if (amount > 0) pots.push({ amount, eligiblePlayerIds })
    prevLevel = level
  }

  // Remaining chips above the highest all-in level
  const aboveLevel = players.filter(p => p.totalBet > prevLevel)
  if (aboveLevel.length > 0) {
    const amount = aboveLevel.reduce((sum, p) => sum + (p.totalBet - prevLevel), 0)
    const eligiblePlayerIds = aboveLevel.filter(p => p.status !== 'folded').map(p => p.id)
    if (amount > 0) pots.push({ amount, eligiblePlayerIds })
  }

  return pots
}

const PHASE_ORDER: Phase[] = ['PRE_FLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN']

function advancePhase(
  current: Phase,
  players: Player[],
  _pot: number,
  dealerIndex: number
): Partial<GameState> {
  const idx = PHASE_ORDER.indexOf(current)
  const next = PHASE_ORDER[idx + 1] ?? 'SHOWDOWN'

  if (next === 'SHOWDOWN') {
    return { phase: 'SHOWDOWN' }
  }

  const resetPlayers = players.map(p => ({ ...p, currentBet: 0, hasActed: false }))
  const firstToAct = nextActiveIndex(resetPlayers, dealerIndex)

  return {
    phase: next,
    players: resetPlayers,
    currentBet: 0,
    lastRaiserIndex: null,
    currentPlayerIndex: firstToAct,
  }
}

// ─── store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'SETUP',
      players: [],
      pot: 0,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      smallBlind: 1,
      bigBlind: 2,
      currentBet: 0,
      handNumber: 1,
      lastRaiserIndex: null,
      minBet: 1,

      startGame: (config: SetupConfig) => {
        const players: Player[] = config.playerNames.map((name, i) => ({
          id: i,
          name,
          chips: config.startingChips[i],
          currentBet: 0,
          totalBet: 0,
          status: 'active',
          hasActed: false,
        }))

        const dealerIndex = 0
        const { players: withBlinds, bbIndex } = postBlinds(
          players,
          dealerIndex,
          config.smallBlind,
          config.bigBlind
        )

        const pot = withBlinds.reduce((sum, p) => sum + p.currentBet, 0)
        const utgIndex = nextActiveIndex(withBlinds, bbIndex)

        set({
          phase: 'PRE_FLOP',
          players: withBlinds,
          pot,
          currentPlayerIndex: utgIndex,
          dealerIndex,
          smallBlind: config.smallBlind,
          bigBlind: config.bigBlind,
          currentBet: config.bigBlind,
          handNumber: 1,
          lastRaiserIndex: bbIndex,
          minBet: config.minBet,
        })
      },

      fold: () => {
        const state = get()
        const { players, currentPlayerIndex, pot, phase, dealerIndex } = state

        const updated = players.map((p, i) =>
          i === currentPlayerIndex ? { ...p, status: 'folded' as const, hasActed: true } : p
        )

        // Only one player left → instant win
        if (inHandCount(updated) === 1) {
          set({ players: updated, phase: 'SHOWDOWN' })
          return
        }

        const next = nextActiveIndex(updated, currentPlayerIndex)
        const roundOver = isBettingRoundOver(updated, state.currentBet)

        if (roundOver) {
          const advanced = advancePhase(phase, updated, pot, dealerIndex)
          set({ players: updated, ...advanced })
          return
        }

        set({ players: updated, currentPlayerIndex: next })
      },

      call: () => {
        const state = get()
        const { players, currentPlayerIndex, currentBet, pot, phase, dealerIndex } = state
        const player = players[currentPlayerIndex]

        const toCall = currentBet - player.currentBet
        const actualCall = Math.min(toCall, player.chips)
        const goesAllIn = actualCall >= player.chips

        const updated = players.map((p, i) =>
          i === currentPlayerIndex
            ? {
                ...p,
                chips: p.chips - actualCall,
                currentBet: p.currentBet + actualCall,
                totalBet: p.totalBet + actualCall,
                status: goesAllIn ? ('all-in' as const) : p.status,
                hasActed: true,
              }
            : p
        )

        const newPot = pot + actualCall
        const next = nextActiveIndex(updated, currentPlayerIndex)
        const roundOver = isBettingRoundOver(updated, currentBet)

        if (roundOver) {
          const advanced = advancePhase(phase, updated, newPot, dealerIndex)
          set({ players: updated, pot: newPot, ...advanced })
          return
        }

        set({ players: updated, pot: newPot, currentPlayerIndex: next })
      },

      raise: (totalBetAmount: number) => {
        const { players, currentPlayerIndex, pot } = get()
        const player = players[currentPlayerIndex]

        const additional = totalBetAmount - player.currentBet
        const actualAdditional = Math.min(additional, player.chips)
        const newPlayerBet = player.currentBet + actualAdditional
        const goesAllIn = actualAdditional >= player.chips

        const updated = players.map((p, i) => {
          if (i === currentPlayerIndex) {
            return {
              ...p,
              chips: p.chips - actualAdditional,
              currentBet: newPlayerBet,
              totalBet: p.totalBet + actualAdditional,
              status: goesAllIn ? ('all-in' as const) : p.status,
              hasActed: true,
            }
          }
          // Reset hasActed for all other active players so they must respond to the raise
          if (p.status === 'active') return { ...p, hasActed: false }
          return p
        })

        const next = nextActiveIndex(updated, currentPlayerIndex)

        set({
          players: updated,
          pot: pot + actualAdditional,
          currentBet: newPlayerBet,
          currentPlayerIndex: next,
          lastRaiserIndex: currentPlayerIndex,
        })
      },

      nextRound: () => {
        const { phase, players, pot, dealerIndex } = get()
        const advanced = advancePhase(phase, players, pot, dealerIndex)
        set(advanced)
      },

      awardPot: (potWinners: number[][]) => {
        const { players } = get()
        const sidePots = computeSidePots(players)

        // Accumulate chip gains per player across all side pots
        const gains = new Map<number, number>(players.map(p => [p.id, 0]))

        for (let i = 0; i < sidePots.length; i++) {
          const winners = potWinners[i] ?? []
          if (winners.length === 0) continue
          const { amount } = sidePots[i]
          const share = Math.floor(amount / winners.length)
          const remainder = amount % winners.length
          winners.forEach((wid, idx) => {
            gains.set(wid, (gains.get(wid) ?? 0) + share + (idx === 0 ? remainder : 0))
          })
        }

        const updated = players.map(p => ({ ...p, chips: p.chips + (gains.get(p.id) ?? 0) }))
        set({ players: updated, pot: 0 })
      },

      nextHand: () => {
        const { players, dealerIndex, smallBlind, bigBlind, handNumber } = get()

        const activePlayers = players
          .filter(p => p.chips > 0)
          .map(p => ({ ...p, currentBet: 0, totalBet: 0, status: 'active' as const, hasActed: false }))

        if (activePlayers.length < 2) {
          set({ players: activePlayers, phase: 'SETUP' })
          return
        }

        const newDealerIndex = (dealerIndex + 1) % activePlayers.length

        const { players: withBlinds, bbIndex } = postBlinds(
          activePlayers,
          newDealerIndex,
          smallBlind,
          bigBlind
        )

        const pot = withBlinds.reduce((sum, p) => sum + p.currentBet, 0)
        const utgIndex = nextActiveIndex(withBlinds, bbIndex)

        set({
          phase: 'PRE_FLOP',
          players: withBlinds,
          pot,
          currentPlayerIndex: utgIndex,
          dealerIndex: newDealerIndex,
          currentBet: bigBlind,
          handNumber: handNumber + 1,
          lastRaiserIndex: bbIndex,
        })
      },

      resetToSetup: () => {
        set({
          phase: 'SETUP',
          players: [],
          pot: 0,
          currentPlayerIndex: 0,
          dealerIndex: 0,
          currentBet: 0,
          handNumber: 1,
          lastRaiserIndex: null,
        })
      },
    }),
    {
      name: 'poker-game-state',
    }
  )
)
