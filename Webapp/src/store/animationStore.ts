import { create } from 'zustand'

interface AnimationState {
  lastAction: { playerIndex: number; id: number } | null
  triggerCoinAnimation: (playerIndex: number) => void
}

let nextId = 0

export const useAnimationStore = create<AnimationState>((set) => ({
  lastAction: null,
  triggerCoinAnimation: (playerIndex) =>
    set({ lastAction: { playerIndex, id: nextId++ } }),
}))
