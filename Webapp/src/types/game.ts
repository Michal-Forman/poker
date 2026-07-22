export type Phase = 'SETUP' | 'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN'

export interface SidePot {
  amount: number
  eligiblePlayerIds: number[]  // non-folded players who contributed to this level
}

export type PlayerStatus = 'active' | 'folded' | 'all-in'

export interface Player {
  id: number
  name: string
  chips: number
  currentBet: number  // bet placed in the current betting round
  totalBet: number    // total bet placed in the entire hand (for pot calculation)
  totalBuyIn: number  // cumulative chips purchased this session (initial + top-ups)
  status: PlayerStatus
  hasActed: boolean   // whether the player has acted in the current betting round
}

export interface SetupConfig {
  playerNames: string[]
  startingChips: number[]
  smallBlind: number
  bigBlind: number
  minBet: number
}

export interface GameState {
  phase: Phase
  players: Player[]
  pot: number
  currentPlayerIndex: number
  dealerIndex: number
  smallBlind: number
  bigBlind: number
  currentBet: number      // highest bet on the table this round
  handNumber: number
  lastRaiserIndex: number | null  // to detect when betting round is complete
  minBet: number          // minimum raise increment

  // actions
  startGame: (config: SetupConfig) => void
  fold: () => void
  call: () => void
  raise: (amount: number) => void
  nextRound: () => void
  awardPot: (potWinners: number[][]) => void  // potWinners[i] = winner ids for side pot i
  nextHand: () => void
  resetToSetup: () => void
  topUp: (playerId: number, amount: number) => void
}
