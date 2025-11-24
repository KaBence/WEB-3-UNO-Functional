import * as api from '../model/api'
import { active_games_slice } from '../slices/active_games_slice'
import { pending_games_slice} from '../slices/pending_games_slice'
import type { Dispatch } from '../stores/store'

export default async (dispatch: Dispatch) => {
  const gamesfeed  = await api.ActiveGamesRXJS()
  gamesfeed.subscribe(({ activeGamesFeed }) =>{
    if (!activeGamesFeed) return
    const { action, game, gameId } = activeGamesFeed as any

    switch (action) {
      case 'ADDED':
      case 'UPDATED':
        if (game) dispatch(active_games_slice.actions.upsert(game))
        break;
      case 'REMOVED':
        if (gameId !== undefined) {
          dispatch(active_games_slice.actions.remove({id:gameId}))
        }
        break;
    }
  })
}
