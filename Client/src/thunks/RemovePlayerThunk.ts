import * as api from '../model/api'
import { pending_games_slice } from '../slices/pending_games_slice'
import type { Dispatch } from '../stores/store'

export const removePlayerThunk = (gameId: number, playerId: number) => async (dispatch: Dispatch) => {
  try {
    const updatedGame = await api.removePlayer(gameId, playerId)
    dispatch(pending_games_slice.actions.upsert(updatedGame))
  } catch (error) {
    console.error("Failed to remove player:", error)
  }
}
