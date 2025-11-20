import type { Dispatch } from "../stores/store";
import * as api from '../model/api'
import { active_games_slice } from "../slices/active_games_slice";
import { pending_games_slice } from "../slices/pending_games_slice";

export default async (dispatch: Dispatch) => {
    const games = await api.getActiveGames();
    dispatch(active_games_slice.actions.reset(games))
    
    //const pending_games = await api.getPendingGames();
    //dispatch(pending_games_slice.actions.reset(pending_games))
}