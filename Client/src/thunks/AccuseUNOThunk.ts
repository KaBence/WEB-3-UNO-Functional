import * as api from '../model/api'
import { active_games_slice } from '../slices/active_games_slice'
import type { Dispatch } from '../stores/store'

export default async (gameId: number, accuser: number, accused: number, dispatch: Dispatch) => {
    const game = await api.accuseUno(gameId, accuser, accused)
    dispatch(active_games_slice.actions.upsert(game))
}