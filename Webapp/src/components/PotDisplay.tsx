import type { Phase } from '../types/game'

export const PHASE_LABELS: Record<Phase, string> = {
  SETUP: 'SETUP',
  PRE_FLOP: 'PRE-FLOP',
  FLOP: 'FLOP',
  TURN: 'TURN',
  RIVER: 'RIVER',
  SHOWDOWN: 'SHOWDOWN',
}

export const PHASE_COLORS: Record<Phase, string> = {
  SETUP: 'text-white/25',
  PRE_FLOP: 'text-amber-300/70',
  FLOP: 'text-amber-300/70',
  TURN: 'text-amber-300/70',
  RIVER: 'text-amber-300/70',
  SHOWDOWN: 'text-amber-300/70',
}

interface Props {
  pot: number
}

export default function PotDisplay({ pot }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-0.5">
      <span className="text-white/25 text-xs uppercase tracking-widest">Pot</span>
      <div className="text-3xl font-bold text-white">
        🪙 {pot.toLocaleString()}
      </div>
    </div>
  )
}
