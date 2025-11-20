import type { Dispatch } from '../stores/store'
import * as api from '../model/api'
import { active_games_slice } from '../slices/active_games_slice'

const DrawCardThunk = (gameId: number) => async (dispatch: Dispatch) => {
  try {
    const updatedGame = await api.drawCard(gameId)
    dispatch(active_games_slice.actions.upsert(updatedGame))
  } catch (error) {
    console.error('Failed to draw card', error)
    throw error
  }
}

export default DrawCardThunk
