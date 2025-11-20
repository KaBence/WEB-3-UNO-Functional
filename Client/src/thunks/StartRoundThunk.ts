import * as api from '../model/api'
import { active_games_slice } from '../slices/active_games_slice'
import type { Dispatch } from '../stores/store'

export const startRoundThunk = (gameId: number) => async (dispatch: Dispatch) => {
  try {
    const updatedGame = await api.startRound(gameId)
    dispatch(active_games_slice.actions.upsert(updatedGame))
  } catch (error) {
    console.error("Failed to start round:", error)
  }
}
