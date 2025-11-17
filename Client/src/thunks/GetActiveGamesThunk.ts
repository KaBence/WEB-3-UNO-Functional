import * as api from '../model/api'
import { active_games_slice } from '../slices/active_games_slice'
import { pending_games_slice} from '../slices/pending_games_slice'
import type { Dispatch } from '../stores/store'

export default async (dispatch: Dispatch) => {
  const gamesfeed  = await api.ActiveGamesRXJS()
  gamesfeed.subscribe(({action,Game,gameID}) =>{
    switch (action) {
        case 'ADDED':
        case 'UPDATED':
          dispatch(active_games_slice.actions.upsert(Game))
          break;
        case 'REMOVED':
          dispatch(pending_games_slice.actions.remove({id:gameID}))
          break;
      }
  })
}