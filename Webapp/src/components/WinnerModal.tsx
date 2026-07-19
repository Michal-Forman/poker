import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

interface Props {
  onEndGame: () => void
}

export default function WinnerModal({ onEndGame }: Props) {
  const { players, pot, awardPot, nextHand } = useGameStore()
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const eligible = players.filter(p => p.status !== 'folded')
  const isAutoWin = eligible.length === 1

  const toggleWinner = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleAward = () => {
    const winners = isAutoWin ? [eligible[0].id] : selectedIds
    if (winners.length === 0) return
    awardPot(winners)
    setSelectedIds([])
  }

  const sharePerWinner = selectedIds.length > 0
    ? Math.floor(pot / (isAutoWin ? 1 : selectedIds.length))
    : null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 pb-safe">
      <div className="bg-green-900 rounded-t-3xl w-full max-w-sm p-6 space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-white text-2xl font-bold">Showdown</h2>
          <p className="text-yellow-400 text-xl font-bold mt-1">
            Pot: 🪙 {pot.toLocaleString()}
          </p>
        </div>

        {isAutoWin ? (
          <div className="text-center">
            <p className="text-green-300 text-sm mb-3">Everyone else folded</p>
            <div className="bg-yellow-400 text-green-900 rounded-2xl p-4">
              <p className="font-bold text-xl">{eligible[0].name} wins!</p>
              <p className="text-sm mt-1">+🪙 {pot.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-green-300 text-sm text-center">
              Tap player(s) who won (tap multiple for split pot)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {eligible.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleWinner(p.id)}
                  className={`rounded-2xl p-3 text-left transition-all ${
                    selectedIds.includes(p.id)
                      ? 'bg-yellow-400 text-green-900'
                      : 'bg-green-800 text-white'
                  }`}
                >
                  <p className="font-bold truncate">{p.name}</p>
                  <p className={`text-sm ${selectedIds.includes(p.id) ? 'text-green-800' : 'text-yellow-400'}`}>
                    🪙 {p.chips.toLocaleString()}
                  </p>
                  {selectedIds.includes(p.id) && sharePerWinner !== null && (
                    <p className="text-xs text-green-700 mt-1">+{sharePerWinner.toLocaleString()}</p>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleAward}
          disabled={!isAutoWin && selectedIds.length === 0}
          className="w-full bg-yellow-400 disabled:opacity-40 text-green-900 font-bold text-xl py-4 rounded-2xl"
        >
          {isAutoWin ? 'COLLECT POT' : 'AWARD POT'}
        </button>

        {/* After awarding, show next hand / end game */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={nextHand}
            className="flex-1 bg-green-700 text-white font-semibold py-3 rounded-2xl"
          >
            Next Hand
          </button>
          <button
            onClick={onEndGame}
            className="flex-1 bg-green-950 text-green-400 font-semibold py-3 rounded-2xl"
          >
            End Game
          </button>
        </div>
      </div>
    </div>
  )
}
