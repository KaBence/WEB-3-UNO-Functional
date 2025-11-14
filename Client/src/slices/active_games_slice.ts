import type { Game } from "./../../../Domain/src/model/Game"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import * as _ from 'lodash/fp'

const init_state: Readonly<Game[]> = []

const active_games_reducers = {
    reset(_state: Readonly<Game[]>, action: PayloadAction<Game[]>): Readonly<Game[]> {
        return action.payload
    },

    upsert(state: Readonly<Game[]>, action: PayloadAction<Game>): Readonly<Game[]> {
        const index = _.findIndex(_.matches({ id: action.payload.id }), state)
        if (index === -1)
            return _.concat(state, action.payload)
        return _.set(index, action.payload, state)
    }
}

export const active_games_slice = createSlice({
    name: 'Active games slice',
    initialState: init_state,
    reducers: active_games_reducers
})
