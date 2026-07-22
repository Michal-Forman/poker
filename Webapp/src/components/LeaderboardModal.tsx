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
      <div className="bg-[#070a0f] border-t border-white/[0.08] rounded-t-3xl w-full max-w-sm p-6 space-y-4">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold">Final Standings</h2>
        </div>

        <div className="space-y-2">
          {ranked.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                i === 0 ? 'bg-amber-400 text-black' : 'bg-white/[0.05] border border-white/10 text-white'
              }`}
            >
              <span className="text-xl w-7 text-center">
                {PLACE_LABEL[i] ?? `${i + 1}.`}
              </span>
              <span className="flex-1 font-bold truncate">{p.name}</span>
              <div className="text-right">
                <p className={`font-bold ${i === 0 ? 'text-black' : 'text-amber-400'}`}>
                  🪙 {p.chips.toLocaleString()}
                </p>
                <p className={`text-xs ${i === 0 ? 'text-black/50' : 'text-white/30'}`}>
                  in: {(p.totalBuyIn ?? p.chips).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-white/[0.05] border border-white/10 text-white/40 font-semibold py-3 rounded-2xl"
          >
            Continue
          </button>
          <button
            onClick={handleNewGame}
            className="flex-[2] bg-amber-400 text-black font-bold py-3 rounded-2xl shadow-lg shadow-amber-500/15"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  )
}
