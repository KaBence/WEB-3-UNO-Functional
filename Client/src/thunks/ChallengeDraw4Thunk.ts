import * as api from '../model/api'
import { active_games_slice } from '../slices/active_games_slice'
import type { Dispatch } from '../stores/store'

export default async (gameId: number, response: boolean, dispatch: Dispatch) => {
    const game = await api.challengeDraw4(gameId, response)
    dispatch(active_games_slice.actions.upsert(game))
}