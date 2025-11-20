import * as api from '../model/api'
import { pending_games_slice } from '../slices/pending_games_slice'
import type { Dispatch } from '../stores/store'

export const addPlayerThunk = (gameId: number, playerName: string) => async (dispatch: Dispatch) => {
  try {
    const updatedGame = await api.joinGame(gameId, playerName)
    dispatch(pending_games_slice.actions.upsert(updatedGame))
  } catch (error) {
    console.error("Failed to add player:", error)
  }
}
