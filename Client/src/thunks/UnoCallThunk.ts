import type { Dispatch } from '../stores/store'
import * as api from '../model/api'
import { active_games_slice } from '../slices/active_games_slice'

const UnoCallThunk =
  (gameId: number, playerId: number) => async (dispatch: Dispatch) => {
    try {
      const updatedGame = await api.sayUno(gameId, playerId)
      dispatch(active_games_slice.actions.upsert(updatedGame))
    } catch (error) {
      console.error('Failed to call UNO', error)
      throw error
    }
  }

export default UnoCallThunk
