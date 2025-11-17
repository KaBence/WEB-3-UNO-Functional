import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import * as _ from 'lodash/fp'
import type { GameSpecs } from "../model/game"

export type ActiveGamesState = Readonly<GameSpecs[]>

export const findActiveGame = (id: string, state: ActiveGamesState): GameSpecs | undefined => _.find(_.matches({id}), state)

const init_state: ActiveGamesState = []

const active_games_reducers = {
    reset(_state: ActiveGamesState, action: PayloadAction<GameSpecs[]>): ActiveGamesState {
        return action.payload
    },

    upsert(state: ActiveGamesState, action: PayloadAction<GameSpecs>): ActiveGamesState {
        const index = _.findIndex(_.matches({ id: action.payload.id }), state)
        if (index === -1)
            return _.concat(state, action.payload)
        return _.set(index, action.payload, state)
    },

    remove(state: ActiveGamesState, action: PayloadAction<{id:number}>): ActiveGamesState {
    return _.remove(_.matches({id: action.payload.id}), state)
    }
}

export const active_games_slice = createSlice({
    name: 'Active games',
    initialState: init_state,
    reducers: active_games_reducers
})
