import { useGameStore } from '../store/gameStore'

const PLACE_LABEL = ['🥇', '🥈', '🥉']

interface Props {
  onClose: () => void
}

export default function LeaderboardModal({ onClose }: Props) {
  const { players, resetToSetup } = useGameStore()

  const ranked = [...players].sort((a, b) => b.chips - a.chips)

  const handleNewGame = () => {
    resetToSetup()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 pb-safe">
      <div className="bg-green-900 rounded-t-3xl w-full max-w-sm p-6 space-y-4">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold">Final Standings</h2>
        </div>

        <div className="space-y-2">
          {ranked.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                i === 0 ? 'bg-yellow-400 text-green-900' : 'bg-green-800 text-white'
              }`}
            >
              <span className="text-xl w-7 text-center">
                {PLACE_LABEL[i] ?? `${i + 1}.`}
              </span>
              <span className="flex-1 font-bold truncate">{p.name}</span>
              <span className={`font-bold ${i === 0 ? 'text-green-900' : 'text-yellow-400'}`}>
                🪙 {p.chips.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-green-800 text-green-300 font-semibold py-3 rounded-2xl"
          >
            Continue
          </button>
          <button
            onClick={handleNewGame}
            className="flex-[2] bg-yellow-400 text-green-900 font-bold py-3 rounded-2xl"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  )
}
