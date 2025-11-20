import type { Dispatch } from '../stores/store'
import * as api from '../model/api'
import { active_games_slice } from '../slices/active_games_slice'

type PlayCardArgs = {
  gameId: number
  cardId: number
  chosenColor?: string
}

const PlayCardThunk =
  ({ gameId, cardId, chosenColor }: PlayCardArgs) =>
  async (dispatch: Dispatch) => {
    try {
      const updatedGame = await api.play(gameId, cardId, chosenColor)
      dispatch(active_games_slice.actions.upsert(updatedGame))
    } catch (error) {
      console.error('Failed to play card', error)
      throw error
    }
  }

export default PlayCardThunk
