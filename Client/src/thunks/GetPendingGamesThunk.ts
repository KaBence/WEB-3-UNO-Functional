import * as api from '../model/api'
import { pending_games_slice } from '../slices/pending_games_slice'
import type { Dispatch } from '../stores/store'

export default async (dispatch: Dispatch) => {
  const gamesfeed = await api.PendingGamesRXJS()
  
  gamesfeed.subscribe(({ pendingGamesFeed }) => {
    if (!pendingGamesFeed) return
    const { action, game, gameId } = pendingGamesFeed as any

    switch (action) {
      case 'ADDED':
      case 'UPDATED':
        if (game) dispatch(pending_games_slice.actions.upsert(game))
        break
      case 'REMOVED':
        if (gameId !== undefined) {
          dispatch(pending_games_slice.actions.remove({ id: gameId }))
        }
        break
    }
  })
}
