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
      className={`rounded-2xl p-3 transition-all duration-200 ${
        isFolded
          ? 'bg-green-950 opacity-50'
          : isActive
          ? 'bg-yellow-400 text-green-900 shadow-lg shadow-yellow-400/30 scale-[1.02]'
          : 'bg-green-800 text-white'
      }`}
    >
      {/* Badges row */}
      <div className="flex gap-1 mb-1.5 min-h-[20px]">
        {isDealer && (
          <span className="bg-white text-green-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">D</span>
        )}
        {isSB && (
          <span className="bg-blue-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">SB</span>
        )}
        {isBB && (
          <span className="bg-red-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">BB</span>
        )}
        {isAllIn && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">ALL IN</span>
        )}
        {isFolded && (
          <span className="bg-gray-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">FOLD</span>
        )}
      </div>

      {/* Name */}
      <p className={`font-bold text-base truncate leading-tight ${isActive ? 'text-green-900' : 'text-white'}`}>
        {player.name}
      </p>

      {/* Chips */}
      <p className={`text-sm font-semibold mt-0.5 ${isActive ? 'text-green-800' : 'text-yellow-400'}`}>
        🪙 {player.chips.toLocaleString()}
      </p>

      {/* Current bet */}
      {player.currentBet > 0 && (
        <p className={`text-xs mt-1 ${isActive ? 'text-green-700' : 'text-green-300'}`}>
          Bet: {player.currentBet.toLocaleString()}
        </p>
      )}
    </div>
  )
}
