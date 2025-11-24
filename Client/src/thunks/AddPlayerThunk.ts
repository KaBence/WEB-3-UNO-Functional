import * as api from '../model/api'
import { pending_games_slice } from '../slices/pending_games_slice'
import { player_slice } from '../slices/player_slice'
import type { Dispatch } from '../stores/store'

export const addPlayerThunk = (gameId: number, playerName: string) => async (dispatch: Dispatch) => {
  try {
    const updatedGame = await api.joinGame(gameId, playerName)
    dispatch(pending_games_slice.actions.upsert(updatedGame))

    const me = updatedGame?.players?.find((p: { name: string; playerName?: string }) => p.name === playerName)
    if (me?.playerName !== undefined) {
      dispatch(player_slice.actions.joinGame(me.playerName))
    } else {
      console.warn(`Joined game ${gameId} but could not determine player id for ${playerName}`)
    }
  } catch (error) {
    console.error("Failed to add player:", error)
  }
}
