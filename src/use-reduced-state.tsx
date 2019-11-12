import { useReducer } from "react"

export function useReducedState(initialState: any) {
  const reducedState = useReducer(
    (oldState, newState) => ({ ...oldState, ...newState }),
    initialState,
  )
  return reducedState
}
