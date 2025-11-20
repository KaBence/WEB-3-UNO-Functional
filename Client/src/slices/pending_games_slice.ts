import type { GameSpecs } from "../model/game";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import * as _ from 'lodash/fp'

export type PendingGamesState = Readonly<GameSpecs[]>

export const findPendingGame = (id: string, state: PendingGamesState): GameSpecs | undefined => _.find(_.matches({id}), state)

const init_state: PendingGamesState = []

const pending_games_reducers = {
  reset(_state: PendingGamesState, action: PayloadAction<GameSpecs[]>): PendingGamesState{
    return action.payload
  },

  upsert(state: PendingGamesState, action: PayloadAction<GameSpecs>): PendingGamesState {
    const index = _.findIndex(_.matches({id: action.payload.id}), state)
    if (index === -1)
      return _.concat(action.payload, state)
    return _.set(index, action.payload, state)
  },

  remove(state: PendingGamesState, action: PayloadAction<{id:number}>): PendingGamesState {
    return _.remove(_.matches({id: action.payload.id}), state)
  }
}

export const pending_games_slice = createSlice({
  name: 'Pending Games',
  initialState: init_state,
  reducers: pending_games_reducers
})
