import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { computeSidePots } from '../store/gameStore'

interface Props {
  onEndGame: () => void
}

export default function WinnerModal({ onEndGame }: Props) {
  const { players, pot, awardPot, nextHand } = useGameStore()

  const sidePots = computeSidePots(players)
  const eligible = players.filter(p => p.status !== 'folded')
  const isAutoWin = eligible.length === 1

  // selectedWinners[i] = winner ids chosen for sidePots[i]
  // Pre-select pots where there's only one eligible player
  const [selectedWinners, setSelectedWinners] = useState<number[][]>(
    () => sidePots.map(sp => sp.eligiblePlayerIds.length === 1 ? [...sp.eligiblePlayerIds] : [])
  )

  const toggleWinner = (potIdx: number, playerId: number) => {
    setSelectedWinners(prev => {
      const next = prev.map(w => [...w])
      next[potIdx] = next[potIdx].includes(playerId)
        ? next[potIdx].filter(id => id !== playerId)
        : [...next[potIdx], playerId]
      return next
    })
  }

  const allPotsHaveWinners = selectedWinners.every(w => w.length > 0)

  const handleAward = () => {
    if (isAutoWin) {
      awardPot(sidePots.map(() => [eligible[0].id]))
      return
    }
    if (!allPotsHaveWinners) return
    awardPot(selectedWinners)
  }

  const potLabel = (idx: number, total: number) => {
    if (total === 1) return 'Pot'
    return idx === 0 ? 'Main Pot' : `Side Pot ${idx}`
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 pb-safe overflow-y-auto">
      <div className="bg-green-900 rounded-t-3xl w-full max-w-sm p-6 space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-white text-2xl font-bold">Showdown</h2>
          <p className="text-yellow-400 text-xl font-bold mt-1">
            Total: 🪙 {pot.toLocaleString()}
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
            {sidePots.map((sp, potIdx) => {
              const label = potLabel(potIdx, sidePots.length)
              const potWinners = selectedWinners[potIdx]
              const sharePerWinner = potWinners.length > 0
                ? Math.floor(sp.amount / potWinners.length)
                : null

              return (
                <div key={potIdx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-green-300 text-sm font-semibold">{label}</span>
                    <span className="text-yellow-400 font-bold">🪙 {sp.amount.toLocaleString()}</span>
                  </div>

                  {sp.eligiblePlayerIds.length === 1 ? (
                    // Only one eligible player — auto-awarded, just show it
                    <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-2xl p-3">
                      <p className="text-yellow-300 text-sm">
                        Auto-awarded to{' '}
                        <span className="font-bold">
                          {players.find(p => p.id === sp.eligiblePlayerIds[0])?.name}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {sp.eligiblePlayerIds.map(pid => {
                        const player = players.find(p => p.id === pid)!
                        const isSelected = potWinners.includes(pid)
                        return (
                          <button
                            key={pid}
                            onClick={() => toggleWinner(potIdx, pid)}
                            className={`rounded-2xl p-3 text-left transition-all ${
                              isSelected
                                ? 'bg-yellow-400 text-green-900'
                                : 'bg-green-800 text-white'
                            }`}
                          >
                            <p className="font-bold truncate">{player.name}</p>
                            <p className={`text-sm ${isSelected ? 'text-green-800' : 'text-yellow-400'}`}>
                              🪙 {player.chips.toLocaleString()}
                            </p>
                            {isSelected && sharePerWinner !== null && (
                              <p className="text-xs text-green-700 mt-1">+{sharePerWinner.toLocaleString()}</p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        <button
          onClick={handleAward}
          disabled={!isAutoWin && !allPotsHaveWinners}
          className="w-full bg-yellow-400 disabled:opacity-40 text-green-900 font-bold text-xl py-4 rounded-2xl"
        >
          {isAutoWin ? 'COLLECT POT' : sidePots.length > 1 ? 'AWARD POTS' : 'AWARD POT'}
        </button>

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
