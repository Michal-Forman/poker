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
    <div className="bg-green-950 border-t border-green-800 px-4 pt-3 pb-safe">
      {/* Active player label */}
      <div className="text-center mb-3">
        <span className="text-yellow-400 font-bold text-base">{player.name}</span>
        <span className="text-green-400 text-sm"> — 🪙 {player.chips.toLocaleString()}</span>
        {toCall > 0 && (
          <span className="text-white text-sm"> · to call: <span className="font-bold text-yellow-300">{toCall.toLocaleString()}</span></span>
        )}
      </div>

      {showRaise ? (
        <div className="space-y-3">
          {/* Amount display */}
          <div className="text-center">
            <span className="text-yellow-400 text-2xl font-bold">{raiseTotal.toLocaleString()}</span>
            <span className="text-green-400 text-sm ml-2">total bet</span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            step={minBet}
            value={raiseTotal}
            onChange={e => setRaiseTotal(Number(e.target.value))}
            className="w-full accent-yellow-400"
          />
          <div className="flex justify-between text-green-400 text-xs">
            <span>Min {minRaise.toLocaleString()}</span>
            <span>All-in {maxRaise.toLocaleString()}</span>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setQuick(minRaise)}
              className="flex-1 bg-green-700 text-white py-2 rounded-xl text-xs font-medium active:bg-green-600">
              Min
            </button>
            <button type="button" onClick={() => setQuick(Math.floor(pot / 2) + currentBet)}
              className="flex-1 bg-green-700 text-white py-2 rounded-xl text-xs font-medium active:bg-green-600">
              ½ Pot
            </button>
            <button type="button" onClick={() => setQuick(pot + currentBet)}
              className="flex-1 bg-green-700 text-white py-2 rounded-xl text-xs font-medium active:bg-green-600">
              Pot
            </button>
            <button type="button" onClick={() => setRaiseTotal(maxRaise)}
              className="flex-1 bg-orange-600 text-white py-2 rounded-xl text-xs font-bold active:bg-orange-500">
              All-in
            </button>
          </div>

          {/* Confirm / cancel */}
          <div className="flex gap-2">
            <button onClick={closeRaise}
              className="flex-1 bg-green-800 text-green-300 font-semibold py-3 rounded-2xl text-base">
              Cancel
            </button>
            <button onClick={handleRaiseConfirm}
              className="flex-2 flex-[2] bg-yellow-400 text-green-900 font-bold py-3 rounded-2xl text-base active:bg-yellow-300">
              BET {raiseTotal.toLocaleString()}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleFold}
            className="flex-1 bg-red-800 hover:bg-red-700 active:bg-red-900 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            FOLD
          </button>
          <button
            onClick={handleCall}
            className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            {isCheck ? 'CHECK' : `CALL ${toCall >= player.chips ? '(All-in)' : toCall.toLocaleString()}`}
          </button>
          {canRaise && (
            <button
              onClick={openRaise}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-green-900 font-bold py-4 rounded-2xl text-lg transition-colors"
            >
              RAISE
            </button>
          )}
        </div>
      )}
    </div>
  )
}
