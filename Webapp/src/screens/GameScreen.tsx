import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAnimationStore } from '../store/animationStore'
import PlayerCard from '../components/PlayerCard'
import PotDisplay, { PHASE_COLORS, PHASE_LABELS } from '../components/PotDisplay'
import ActionPanel from '../components/ActionPanel'
import WinnerModal from '../components/WinnerModal'
import LeaderboardModal from '../components/LeaderboardModal'

interface FlyingCoin {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  delay: number
}

export default function GameScreen() {
  const { players, phase, pot, handNumber, dealerIndex, smallBlind, bigBlind, currentPlayerIndex, nextRound } = useGameStore()
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const playerCardRefs = useRef<(HTMLDivElement | null)[]>([])
  const chipsRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const potRef = useRef<HTMLDivElement | null>(null)
  const coinIdRef = useRef(0)
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([])

  const lastAction = useAnimationStore(s => s.lastAction)

  const prevPhaseRef = useRef<typeof phase>(phase)
  const [announcedPhase, setAnnouncedPhase] = useState<typeof phase | null>(null)

  useEffect(() => {
    const prev = prevPhaseRef.current
    prevPhaseRef.current = phase
    const triggerPhases = ['FLOP', 'TURN', 'RIVER'] as const
    if ((triggerPhases as readonly string[]).includes(phase) && phase !== prev) {
      setAnnouncedPhase(phase)
      const timer = setTimeout(() => setAnnouncedPhase(null), 1500)
      const dismiss = () => setAnnouncedPhase(null)
      document.addEventListener('pointerdown', dismiss, { once: true })
      return () => {
        clearTimeout(timer)
        document.removeEventListener('pointerdown', dismiss)
      }
    }
  }, [phase])

  useEffect(() => {
    if (!lastAction) return
    const chipsEl = chipsRefs.current[lastAction.playerIndex]
    const potEl = potRef.current
    if (!chipsEl || !potEl) return

    const pRect = chipsEl.getBoundingClientRect()
    const potRect = potEl.getBoundingClientRect()

    const startX = pRect.left + pRect.width / 2
    const startY = pRect.top + pRect.height / 2
    const endX = potRect.left + potRect.width / 2
    const endY = potRect.top + potRect.height / 2
    const dx = endX - startX
    const dy = endY - startY

    const coins: FlyingCoin[] = Array.from({ length: 4 }, (_, i) => ({
      id: coinIdRef.current++,
      x: startX + (i % 2 === 0 ? -8 : 8),
      y: startY + (i < 2 ? -8 : 8),
      dx,
      dy,
      delay: i * 45,
    }))

    setFlyingCoins(prev => [...prev, ...coins])
    const timer = setTimeout(
      () => setFlyingCoins(prev => prev.filter(c => !coins.find(n => n.id === c.id))),
      600
    )
    return () => clearTimeout(timer)
  }, [lastAction])

  const count = players.length
  const sbIndex = (dealerIndex + 1) % count
  const bbIndex = (dealerIndex + 2) % count

  const isShowdown = phase === 'SHOWDOWN'

  // All-in situation: no active players left but game isn't over — need manual advance
  const noOneCanAct = !isShowdown && players.length > 0 &&
    players.every(p => p.status !== 'active')

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-stretch gap-3 px-4 pb-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        {/* Left: phase + hand, then blinds pushed to bottom */}
        <div className="flex flex-col justify-between min-w-0">
          <div className="flex flex-col gap-0.5">
            <span className={`text-xs font-bold uppercase tracking-widest ${PHASE_COLORS[phase]}`}>
              {PHASE_LABELS[phase]}
            </span>
            <span className="text-white/25 text-xs">Hand #{handNumber}</span>
          </div>
          <span className="text-white/20 text-xs">Blinds {smallBlind}/{bigBlind}</span>
        </div>

        {/* Center: pot */}
        <div ref={potRef} className="flex-1">
          <PotDisplay pot={pot} />
        </div>

        {/* Right: End Session button */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="shrink-0 px-3 rounded-lg border border-white/15 bg-white/5 text-white/40 text-xs font-medium active:bg-red-900/40 active:border-red-500/40 active:text-red-400 transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Player grid */}
      <div className="flex-1 px-3 pb-2">
        <div className={`grid gap-2 ${
          count <= 2 ? 'grid-cols-1' :
          count <= 4 ? 'grid-cols-2' :
          count <= 6 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {players.map((player, i) => (
            <PlayerCard
              key={player.id}
              ref={el => { playerCardRefs.current[i] = el }}
              chipsRef={el => { chipsRefs.current[i] = el }}
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

      {/* Phase transition announcement */}
      {announcedPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/50">
          <span
            className={`text-8xl font-black tracking-widest ${PHASE_COLORS[announcedPhase]}`}
            style={{ animation: 'phase-announce 1.5s ease-out forwards' }}
          >
            {PHASE_LABELS[announcedPhase]}
          </span>
        </div>
      )}

      {/* Flying coin animation overlay */}
      {flyingCoins.map(coin => (
        <div
          key={coin.id}
          style={{
            position: 'fixed',
            left: coin.x,
            top: coin.y,
            transform: 'translate(-50%, -50%)',
            animationName: 'coin-fly-to-pot',
            animationDuration: '0.42s',
            animationTimingFunction: 'ease-in',
            animationDelay: `${coin.delay}ms`,
            animationFillMode: 'both',
            ['--coin-dx' as string]: `${coin.dx}px`,
            ['--coin-dy' as string]: `${coin.dy}px`,
            fontSize: '18px',
            pointerEvents: 'none',
            zIndex: 9999,
            userSelect: 'none',
          }}
        >
          🪙
        </div>
      ))}
    </div>
  )
}
