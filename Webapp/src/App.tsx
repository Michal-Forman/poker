import { useGameStore } from './store/gameStore'
import SetupScreen from './screens/SetupScreen'
import GameScreen from './screens/GameScreen'

export default function App() {
  const phase = useGameStore(s => s.phase)

  if (phase === 'SETUP') {
    return <SetupScreen />
  }

  return <GameScreen />
}
