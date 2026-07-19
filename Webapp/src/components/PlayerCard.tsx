import type { Player } from '../types/game'

interface Props {
  player: Player
  isActive: boolean
  isDealer: boolean
  isSB: boolean
  isBB: boolean
}

export default function PlayerCard({ player, isActive, isDealer, isSB, isBB }: Props) {
  const isFolded = player.status === 'folded'
  const isAllIn = player.status === 'all-in'

  return (
    <div
      className={`rounded-2xl p-3 transition-all duration-200 border ${
        isFolded
          ? 'bg-white/[0.03] border-white/5 opacity-30'
          : isActive
          ? 'bg-amber-400 border-amber-300/50 text-black shadow-xl shadow-amber-500/20 scale-[1.02]'
          : 'bg-white/[0.06] border-white/10 text-white'
      }`}
    >
      {/* Badges row */}
      <div className="flex gap-1 mb-1.5 min-h-[20px]">
        {isDealer && (
          <span className="bg-white/20 text-white border border-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">D</span>
        )}
        {isSB && (
          <span className="bg-sky-400/20 text-sky-300 border border-sky-400/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">SB</span>
        )}
        {isBB && (
          <span className="bg-red-400/20 text-red-300 border border-red-400/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">BB</span>
        )}
        {isAllIn && (
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">ALL IN</span>
        )}
        {isFolded && (
          <span className="bg-white/10 text-white/40 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">FOLD</span>
        )}
      </div>

      {/* Name */}
      <p className={`font-bold text-base truncate leading-tight ${isActive ? 'text-black' : 'text-white'}`}>
        {player.name}
      </p>

      {/* Chips */}
      <p className={`text-sm font-semibold mt-0.5 ${isActive ? 'text-black/70' : 'text-amber-400'}`}>
        🪙 {player.chips.toLocaleString()}
      </p>

      {/* Current bet */}
      {player.currentBet > 0 && (
        <p className={`text-xs mt-1 ${isActive ? 'text-black/50' : 'text-white/40'}`}>
          Bet: {player.currentBet.toLocaleString()}
        </p>
      )}
    </div>
  )
}
