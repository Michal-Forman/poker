import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

interface Props {
  onClose: () => void
}

const PRESETS = [100, 500, 1000, 2000]

export default function TopUpModal({ onClose }: Props) {
  const { players, topUp } = useGameStore()
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [customInput, setCustomInput] = useState('')

  const handlePreset = (value: number) => {
    setAmount(value)
    setCustomInput('')
  }

  const handleCustom = (value: string) => {
    setCustomInput(value)
    const parsed = parseInt(value, 10)
    setAmount(isNaN(parsed) || parsed < 0 ? 0 : parsed)
  }

  const handleConfirm = () => {
    if (selectedPlayerId === null || amount <= 0) return
    topUp(selectedPlayerId, amount)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-[60] pb-safe overflow-y-auto">
      <div className="bg-[#070a0f] border-t border-white/[0.08] rounded-t-3xl w-full max-w-sm p-6 space-y-5">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold">Top Up</h2>
          <p className="text-white/30 text-sm mt-1">Add chips to a player's stack</p>
        </div>

        {/* Player selection */}
        <div className="space-y-2">
          <p className="text-white/40 text-sm font-semibold">Select player</p>
          <div className="grid grid-cols-2 gap-2">
            {players.map(p => {
              const isSelected = selectedPlayerId === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayerId(p.id)}
                  className={`rounded-2xl p-3 text-left transition-all border ${
                    isSelected
                      ? 'bg-amber-400 border-amber-300/50 text-black'
                      : 'bg-white/[0.05] border-white/10 text-white'
                  }`}
                >
                  <p className="font-bold truncate">{p.name}</p>
                  <p className={`text-sm ${isSelected ? 'text-black/60' : 'text-amber-400'}`}>
                    🪙 {p.chips.toLocaleString()}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Amount selection */}
        <div className="space-y-2">
          <p className="text-white/40 text-sm font-semibold">Amount</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset}
                onClick={() => handlePreset(preset)}
                className={`rounded-xl py-2 text-sm font-bold transition-all border ${
                  amount === preset && customInput === ''
                    ? 'bg-amber-400 border-amber-300/50 text-black'
                    : 'bg-white/[0.05] border-white/10 text-white'
                }`}
              >
                {preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            value={customInput}
            onChange={e => handleCustom(e.target.value)}
            placeholder="Custom amount"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/50"
          />
        </div>

        {/* Actions */}
        <button
          onClick={handleConfirm}
          disabled={selectedPlayerId === null || amount <= 0}
          className="w-full bg-amber-400 disabled:opacity-40 text-black font-bold text-xl py-4 rounded-2xl shadow-lg shadow-amber-500/15"
        >
          ADD CHIPS{amount > 0 ? ` (+🪙 ${amount.toLocaleString()})` : ''}
        </button>

        <button
          onClick={onClose}
          className="w-full border border-white/[0.08] text-white/35 font-semibold text-sm py-3 rounded-2xl"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
