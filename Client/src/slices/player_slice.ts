import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type PlayerState =  {
  player: string | undefined
}

const init_state: PlayerState = { player: undefined }
// When calling player_slice.actions.login(player) -> player value becomes the payload
// initial state is not needed because I am overwriting the whole state and saving is handled by redux
const player_reducers = {
  login(_state: PlayerState, action: PayloadAction<string>): PlayerState {
    return { player: action.payload }
  }
}

export const player_slice = createSlice({
  name: 'Players Name',
  initialState: init_state,
  reducers: player_reducers
})
