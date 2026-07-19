import type { Phase } from '../types/game'

const PHASE_LABELS: Record<Phase, string> = {
  SETUP: 'SETUP',
  PRE_FLOP: 'PRE-FLOP',
  FLOP: 'FLOP',
  TURN: 'TURN',
  RIVER: 'RIVER',
  SHOWDOWN: 'SHOWDOWN',
}

const PHASE_COLORS: Record<Phase, string> = {
  SETUP: 'text-gray-400',
  PRE_FLOP: 'text-blue-300',
  FLOP: 'text-green-300',
  TURN: 'text-yellow-300',
  RIVER: 'text-orange-300',
  SHOWDOWN: 'text-red-300',
}

interface Props {
  pot: number
  phase: Phase
  handNumber: number
}

export default function PotDisplay({ pot, phase, handNumber }: Props) {
  return (
    <div className="text-center py-3">
      <div className="flex items-center justify-center gap-3 mb-1">
        <span className={`text-xs font-bold uppercase tracking-widest ${PHASE_COLORS[phase]}`}>
          {PHASE_LABELS[phase]}
        </span>
        <span className="text-green-600 text-xs">Hand #{handNumber}</span>
      </div>
      <div className="text-3xl font-bold text-white">
        🪙 {pot.toLocaleString()}
      </div>
      <div className="text-green-400 text-xs mt-0.5">POT</div>
    </div>
  )
}
