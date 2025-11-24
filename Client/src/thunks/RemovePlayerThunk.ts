import * as api from '../model/api'
import { pending_games_slice } from '../slices/pending_games_slice'
import type { Dispatch } from '../stores/store'

export const removePlayerThunk = (gameId: number, playerId: number) => async (dispatch: Dispatch) => {
  try {
    const updatedGame = await api.removePlayer(gameId, playerId)
    if (updatedGame) {
      dispatch(pending_games_slice.actions.upsert(updatedGame))
    } else {
      // if the server returns null (game removed), drop it from pending list
      dispatch(pending_games_slice.actions.remove({ id: gameId }))
    }
  } catch (error) {
    console.error("Failed to remove player:", error)
  }
}
