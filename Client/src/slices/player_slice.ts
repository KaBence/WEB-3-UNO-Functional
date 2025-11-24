import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type PlayerState = {
  player: string | undefined
  playerName?: number
}

const storedPlayer = typeof window !== 'undefined'
  ? localStorage.getItem('uno.playerName') ?? undefined
  : undefined

const init_state: PlayerState = { player: storedPlayer, playerName: undefined }
// When calling player_slice.actions.login(player) -> player value becomes the payload
// initial state is not needed because I am overwriting the whole state and saving is handled by redux
const player_reducers = {
  login(_state: PlayerState, action: PayloadAction<string>): PlayerState {
    return { player: action.payload }
  },

  joinGame(state: PlayerState, action: PayloadAction<number>): PlayerState {
    return { ...state, playerName: action.payload }
  },

  leaveGame(state: PlayerState): PlayerState {
    return { ...state, playerName: undefined }
  }
}

export const player_slice = createSlice({
  name: 'Players Name',
  initialState: init_state,
  reducers: player_reducers
})
