import * as api from '../model/api'
import { pending_games_slice } from '../slices/pending_games_slice'
import type { Dispatch } from '../stores/store'

export default async (dispatch: Dispatch) => {
  const gamesfeed = await api.PendingGamesRXJS()
  
  gamesfeed.subscribe(({ action, Game, gameID }) => {
    switch (action) {
      case 'ADDED':
      case 'UPDATED':
        dispatch(pending_games_slice.actions.upsert(Game))
        break
      case 'REMOVED':
        dispatch(pending_games_slice.actions.remove({ id: gameID }))
        break
    }
  })
}
