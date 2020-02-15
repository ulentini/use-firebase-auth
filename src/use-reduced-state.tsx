import { useReducer } from "react"

export function useReducedState(initialState: any) {
  const reducedState = useReducer(
    (oldState: any, newState: any) => ({ ...oldState, ...newState }),
    initialState,
  )
  return reducedState
}
