import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function SetupScreen() {
  const startGame = useGameStore(s => s.startGame)

  const [playerCount, setPlayerCount] = useState(4)
  const [names, setNames] = useState<string[]>(Array(9).fill(''))
  const [chips, setChips] = useState<number[]>(Array(9).fill(1000))
  const [smallBlind, setSmallBlind] = useState(1)
  const [bigBlind, setBigBlind] = useState(2)
  const [minBet, setMinBet] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleNameChange = (i: number, value: string) => {
    setNames(prev => {
      const next = [...prev]
      next[i] = value
      return next
    })
  }

  const handleChipsChange = (i: number, value: number) => {
    setChips(prev => {
      const next = [...prev]
      next[i] = Math.max(1, value)
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const playerNames = names.slice(0, playerCount).map((n, i) => n.trim() || `Player ${i + 1}`)
    const startingChips = chips.slice(0, playerCount)
    startGame({ playerNames, startingChips, smallBlind, bigBlind, minBet })
  }

  return (
    <div className="min-h-screen bg-green-900 flex flex-col items-center px-4 py-8">
      <h1 className="text-4xl font-bold text-yellow-400 mb-1 tracking-wide">♠ POKER</h1>
      <p className="text-green-300 text-sm mb-8">Texas Hold'em Chip Tracker</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">

        {/* Player count */}
        <div className="bg-green-800 rounded-2xl p-4 space-y-3">
          <label className="text-white font-semibold text-lg">
            Players: <span className="text-yellow-400">{playerCount}</span>
          </label>
          <input
            type="range"
            min={2}
            max={9}
            value={playerCount}
            onChange={e => setPlayerCount(Number(e.target.value))}
            className="w-full accent-yellow-400"
          />
          <div className="flex justify-between text-green-300 text-xs">
            <span>2</span><span>9</span>
          </div>
        </div>

        {/* Player names + chips */}
        <div className="bg-green-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center mb-3">
            <p className="text-white font-semibold text-lg flex-1">Players</p>
            <span className="text-green-400 text-xs">Name / Chips</span>
          </div>
          {Array.from({ length: playerCount }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder={`Player ${i + 1}`}
                value={names[i]}
                onChange={e => handleNameChange(i, e.target.value)}
                maxLength={16}
                className="flex-1 bg-green-700 text-white placeholder-green-400 rounded-xl px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="number"
                value={chips[i]}
                onChange={e => handleChipsChange(i, Number(e.target.value))}
                className="w-24 bg-green-700 text-white rounded-xl px-2 py-2.5 text-base font-bold outline-none focus:ring-2 focus:ring-yellow-400 text-center"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            {[500, 1000, 2000, 5000].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setChips(prev => prev.map(() => v))}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-green-700 text-green-200 hover:bg-green-600 transition-colors"
              >
                All {v >= 1000 ? `${v / 1000}K` : v}
              </button>
            ))}
          </div>
        </div>

        {/* Blinds */}
        <div className="bg-green-800 rounded-2xl p-4 space-y-3">
          <p className="text-white font-semibold text-lg">Blinds</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-green-300 text-sm block mb-1">Small Blind</label>
              <input
                type="number"
                value={smallBlind}
                onChange={e => {
                  const val = Math.max(1, Number(e.target.value))
                  setSmallBlind(val)
                  if (bigBlind <= val) setBigBlind(val * 2)
                }}
                className="w-full bg-green-700 text-white rounded-xl px-3 py-2.5 text-lg font-bold outline-none focus:ring-2 focus:ring-yellow-400 text-center"
              />
            </div>
            <div>
              <label className="text-green-300 text-sm block mb-1">Big Blind</label>
              <input
                type="number"
                value={bigBlind}
                onChange={e => setBigBlind(Math.max(smallBlind + 1, Number(e.target.value)))}
                className="w-full bg-green-700 text-white rounded-xl px-3 py-2.5 text-lg font-bold outline-none focus:ring-2 focus:ring-yellow-400 text-center"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[[1,2],[5,10],[10,20],[25,50]].map(([sb,bb]) => (
              <button
                key={`${sb}/${bb}`}
                type="button"
                onClick={() => { setSmallBlind(sb); setBigBlind(bb) }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  smallBlind === sb && bigBlind === bb
                    ? 'bg-yellow-400 text-green-900'
                    : 'bg-green-700 text-green-200 hover:bg-green-600'
                }`}
              >
                {sb}/{bb}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-green-800 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-white font-semibold"
          >
            <span>Advanced</span>
            <span className="text-green-400 text-sm">{showAdvanced ? '▲' : '▼'}</span>
          </button>
          {showAdvanced && (
            <div className="px-4 pb-4 space-y-3 border-t border-green-700 pt-3">
              <div>
                <label className="text-green-300 text-sm block mb-1">Min Bet / Raise Increment</label>
                <input
                  type="number"
                  value={minBet}
                  onChange={e => setMinBet(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-green-700 text-white rounded-xl px-4 py-2.5 text-lg font-bold outline-none focus:ring-2 focus:ring-yellow-400 text-center"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-green-900 font-bold text-xl py-4 rounded-2xl transition-colors shadow-lg"
        >
          START GAME
        </button>
      </form>
    </div>
  )
}
