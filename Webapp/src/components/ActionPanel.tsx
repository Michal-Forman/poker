import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function ActionPanel() {
  const { players, currentPlayerIndex, currentBet, minBet, pot, fold, call, raise } = useGameStore()
  const [showRaise, setShowRaise] = useState(false)
  const [raiseTotal, setRaiseTotal] = useState(0)

  const player = players[currentPlayerIndex]
  if (!player || player.status !== 'active') return null

  const toCall = Math.max(0, currentBet - player.currentBet)
  const isCheck = toCall === 0
  const minRaise = Math.min(currentBet + minBet, player.chips + player.currentBet)
  const maxRaise = player.chips + player.currentBet
  const canRaise = player.chips > toCall

  const openRaise = () => {
    setRaiseTotal(minRaise)
    setShowRaise(true)
  }

  const closeRaise = () => {
    setShowRaise(false)
  }

  const handleCall = () => {
    call()
    closeRaise()
  }

  const handleFold = () => {
    fold()
    closeRaise()
  }

  const handleRaiseConfirm = () => {
    raise(raiseTotal)
    closeRaise()
  }

  const setQuick = (total: number) => setRaiseTotal(Math.min(Math.max(total, minRaise), maxRaise))

  return (
    <div className="bg-black/50 backdrop-blur-xl border-t border-white/[0.08] px-4 pt-3 pb-safe">
      {/* Active player label */}
      <div className="text-center mb-3">
        <span className="text-amber-400 font-bold text-base">{player.name}</span>
        <span className="text-white/40 text-sm"> — 🪙 {player.chips.toLocaleString()}</span>
        {toCall > 0 && (
          <span className="text-white text-sm"> · to call: <span className="font-bold text-amber-300">{toCall.toLocaleString()}</span></span>
        )}
      </div>

      {showRaise ? (
        <div className="space-y-3">
          {/* Amount display */}
          <div className="text-center">
            <span className="text-amber-400 text-2xl font-bold">{raiseTotal.toLocaleString()}</span>
            <span className="text-white/40 text-sm ml-2">total bet</span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            step={minBet}
            value={raiseTotal}
            onChange={e => setRaiseTotal(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
          <div className="flex justify-between text-white/30 text-xs">
            <span>Min {minRaise.toLocaleString()}</span>
            <span>All-in {maxRaise.toLocaleString()}</span>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setQuick(minRaise)}
              className="flex-1 bg-white/[0.07] border border-white/10 text-white/70 py-2 rounded-xl text-xs font-medium active:bg-white/[0.12]">
              Min
            </button>
            <button type="button" onClick={() => setQuick(Math.floor(pot / 2) + currentBet)}
              className="flex-1 bg-white/[0.07] border border-white/10 text-white/70 py-2 rounded-xl text-xs font-medium active:bg-white/[0.12]">
              ½ Pot
            </button>
            <button type="button" onClick={() => setQuick(pot + currentBet)}
              className="flex-1 bg-white/[0.07] border border-white/10 text-white/70 py-2 rounded-xl text-xs font-medium active:bg-white/[0.12]">
              Pot
            </button>
            <button type="button" onClick={() => setRaiseTotal(maxRaise)}
              className="flex-1 bg-amber-400/15 border border-amber-400/25 text-amber-300 py-2 rounded-xl text-xs font-bold active:bg-amber-400/25">
              All-in
            </button>
          </div>

          {/* Confirm / cancel */}
          <div className="flex gap-2">
            <button onClick={closeRaise}
              className="flex-1 bg-white/[0.05] border border-white/10 text-white/40 font-semibold py-3 rounded-2xl text-base">
              Cancel
            </button>
            <button onClick={handleRaiseConfirm}
              className="flex-2 flex-[2] bg-amber-400 text-black font-bold py-3 rounded-2xl text-base active:bg-amber-300">
              BET {raiseTotal.toLocaleString()}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleFold}
            className="flex-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/[0.18] active:bg-red-500/10 text-red-400 font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            FOLD
          </button>
          <button
            onClick={handleCall}
            className="flex-1 bg-sky-500/10 border border-sky-400/20 hover:bg-sky-500/[0.18] active:bg-sky-500/10 text-sky-300 font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            {isCheck ? 'CHECK' : `CALL ${toCall >= player.chips ? '(All-in)' : toCall.toLocaleString()}`}
          </button>
          {canRaise && (
            <button
              onClick={openRaise}
              className="flex-1 bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/[0.18] active:bg-amber-400/10 text-amber-300 font-bold py-4 rounded-2xl text-lg transition-colors"
            >
              RAISE
            </button>
          )}
        </div>
      )}
    </div>
  )
}
