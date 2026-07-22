import { useGameStore } from './store/gameStore'
import { useWakeLock } from './hooks/useWakeLock'
import SetupScreen from './screens/SetupScreen'
import GameScreen from './screens/GameScreen'

export default function App() {
  const phase = useGameStore(s => s.phase)
  useWakeLock()

  if (phase === 'SETUP') {
    return <SetupScreen />
  }

  return <GameScreen />
}
