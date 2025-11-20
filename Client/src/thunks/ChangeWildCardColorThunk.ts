import * as api from '../model/api'
import { active_games_slice } from '../slices/active_games_slice'
import type { Dispatch } from '../stores/store'

export default async (gameId: number, chosenColor: string, dispatch: Dispatch) => {
    const game = await api.changeWildCardColor(gameId, chosenColor)
    dispatch(active_games_slice.actions.upsert(game))
}