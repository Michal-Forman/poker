import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import PlayerCard from '../components/PlayerCard'
import PotDisplay from '../components/PotDisplay'
import ActionPanel from '../components/ActionPanel'
import WinnerModal from '../components/WinnerModal'
import LeaderboardModal from '../components/LeaderboardModal'

export default function GameScreen() {
  const { players, phase, pot, handNumber, dealerIndex, smallBlind, bigBlind, currentPlayerIndex, nextRound } = useGameStore()
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const count = players.length
  const sbIndex = (dealerIndex + 1) % count
  const bbIndex = (dealerIndex + 2) % count

  const isShowdown = phase === 'SHOWDOWN'

  // All-in situation: no active players left but game isn't over — need manual advance
  const noOneCanAct = !isShowdown && players.length > 0 &&
    players.every(p => p.status !== 'active')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pt-3 pb-2">
        <div className="text-white/30 text-xs">
          Blinds: {smallBlind}/{bigBlind}
        </div>
        <PotDisplay pot={pot} phase={phase} handNumber={handNumber} />
        <button
          onClick={() => setShowLeaderboard(true)}
          className="text-white/25 text-xs text-right active:text-red-400 transition-colors"
        >
          End&nbsp;Session
        </button>
      </div>

      {/* Player grid */}
      <div className="flex-1 px-3 pb-2">
        <div className={`grid gap-2 h-full ${
          count <= 2 ? 'grid-cols-1' :
          count <= 4 ? 'grid-cols-2' :
          count <= 6 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {players.map((player, i) => (
            <PlayerCard
              key={player.id}
              player={player}
              isActive={i === currentPlayerIndex && !isShowdown}
              isDealer={i === dealerIndex}
              isSB={i === sbIndex}
              isBB={i === bbIndex}
            />
          ))}
        </div>
      </div>

      {/* Only shown when everyone is all-in and cards still need to be dealt */}
      {noOneCanAct && (
        <div className="px-4 pb-2">
          <button
            onClick={nextRound}
            className="w-full bg-white/[0.07] border border-white/10 hover:bg-white/[0.10] active:bg-white/[0.05] text-white/70 font-semibold py-3 rounded-2xl text-sm transition-colors"
          >
            → {phase === 'PRE_FLOP' ? 'Deal Flop' : phase === 'FLOP' ? 'Deal Turn' : phase === 'TURN' ? 'Deal River' : 'Showdown'}
          </button>
        </div>
      )}

      {/* Action panel */}
      {!isShowdown && !noOneCanAct && (
        <ActionPanel />
      )}

      {/* Winner modal */}
      {isShowdown && <WinnerModal onEndGame={() => setShowLeaderboard(true)} />}

      {/* Leaderboard / end session */}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </div>
  )
}
