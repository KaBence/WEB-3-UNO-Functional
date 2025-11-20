import * as api from '../model/api'
import { pending_games_slice } from '../slices/pending_games_slice'
import type { Dispatch } from '../stores/store'

export const createGameThunk = () => async (dispatch: Dispatch) => {
  try {
    const newGame = await api.createGame()
    dispatch(pending_games_slice.actions.upsert(newGame))
  } catch (error) {
    console.error("Failed to create game:", error)
  }
}
//Should the pending games be updated after creating a game into the active game here?