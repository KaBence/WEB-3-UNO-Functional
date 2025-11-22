import * as memoryStore  from "./memoryStore" 
import * as game from "domain/src/model/Game"
import * as round from "domain/src/model/round"
import * as gameFactory from "domain/src/model/gameFactory"
import { Card, Colors } from "domain/src/model/Card"

type MemoryStore = memoryStore.MemoryStore
type Game = game.Game

export type ServerModel = {
    readonly memoryStore: MemoryStore
    readonly nextGame: number
}

export function creaateServerModel(store: MemoryStore): ServerModel {
    return {
        memoryStore: store,
        nextGame: 0
    }
}

export async function all_active_games(serverModel: ServerModel): Promise<[Game[], ServerModel]> {
    const games = await memoryStore.getAllGames(serverModel.memoryStore)
    const activeGames = games.filter((g) => g.currentRound !== undefined)
    return [activeGames, serverModel]
}

export async function all_pending_games(serverModel: ServerModel): Promise<[Game[], ServerModel]> {
    const games = await memoryStore.getAllGames(serverModel.memoryStore)
    const pendingGames = games.filter((g) => !g.currentRound)
    return [pendingGames, serverModel]
}

export async function getGame(gameId: number, serverModel: ServerModel): Promise<[Game, ServerModel]> {
    const game = await memoryStore.getGame(gameId, serverModel.memoryStore) //can it return undifined?
    return [game, serverModel]
}

export async function createGame(serverModel: ServerModel): Promise<[Game, ServerModel]> {
    const id = serverModel.nextGame + 1
    const game = gameFactory.newGame(id)
    const store = await memoryStore.saveGame(game, serverModel.memoryStore)
    return [game, {...serverModel, memoryStore: store, nextGame: id}]
}

export async function addPlayer(gameId: number, player: string, serverModel: ServerModel): Promise<[Game | null, ServerModel]> {
    const [desiredGame, newModel] = await getGame(gameId, serverModel)
    if(!desiredGame) {
        throw new Error("Game doesnt exist"); //idk what to do here
        return [null, newModel]
    }
    const nameTaken = desiredGame.players.some((p) => p.name === player)
    if(nameTaken) {
        throw new Error("Player already in game"); //idk what to do here
        return [null, newModel]
    }
    const newGame = game.addPlayer(player, desiredGame)
    const store = await memoryStore.saveGame(newGame, newModel.memoryStore)
    return [newGame, {...newModel, memoryStore: store}]
}

export async function removePlayer(gameId: number, player: number, serverModel: ServerModel): Promise<[Game | null, ServerModel]> {
    const [desiredGame, newModel] = await getGame(gameId, serverModel)
    if(!desiredGame) {
        throw new Error("Game doesnt exist"); //idk what to do here
        return [null, newModel]
    }
    const playerExists = desiredGame.players.some((p) => p.id === player)
    if(!playerExists) {
        return [desiredGame, newModel]
    }
    const newGame = game.removePlayer(player, desiredGame)
    if(newGame.players.length === 0){
        const store = await memoryStore.deleteGame(id, newModel.memoryStore)
        return [null, {...newModel, memoryStore: store}]
    }
    const store = await memoryStore.saveGame(newGame, newModel.memoryStore)
    return [newGame, {...newModel, memoryStore: store}]
}

export async function startRound(gameId: number, serverModel: ServerModel): Promise<[Game, ServerModel]> {
    const [desiredGame, newModel] = await getGame(gameId, serverModel)
    if(!desiredGame.players || desiredGame.players.length < 2){
        throw new Error("Cannot start a round with one or no players.") //idk  what to do here
    }
    const newGame = game.createRound(desiredGame)
    const store = await memoryStore.saveGame(newGame, newModel.memoryStore)
    return [newGame, {...newModel, memoryStore: store}]
}

export async function deleteGame(gameId: number, serverModel: ServerModel): Promise<[boolean, ServerModel]> {
    const [result, store] = await memoryStore.deleteGame(gameId, serverModel.memoryStore)
    return [result, {...serverModel, memoryStore: store}]
}

export async function play(opts: {gameId: number, card: Card, chosenColor?: string}, serverModel: ServerModel): Promise<[Game, ServerModel]> {
    const [desiredGame, newModel] = await getGame(opts.gameId, serverModel)
    const desiredRound = desiredGame.currentRound
    if(desiredRound) {
        const newRound = round.play({playedCard: opts.card, color: opts.chosenColor as Colors}, desiredRound)
        const updatedGame = {...desiredGame, round: newRound}
        const newGame = game.roundFinished(updatedGame)
        const store = await memoryStore.saveGame(newGame, newModel.memoryStore)
        return [newGame, {...newModel, memoryStore: store}]
    }
    return [desiredGame, newModel]
}

export async function challangeDrawFour(gameId: number, response: boolean, serverModel: ServerModel): Promise<[Game, boolean, ServerModel]> {
    const [desiredGame, newModel] = await getGame(gameId, serverModel)
    const desiredRound = desiredGame.currentRound
    if(desiredRound) {
        const [result, newRound] = round.challengeWildDrawFour(response, desiredRound)
        const newGame = {...desiredGame, round: newRound}
        const store = await memoryStore.saveGame(newGame, newModel.memoryStore)
        return [newGame, result, {...newModel, memoryStore: store}]
    }
    return [desiredGame, false, newModel]
}

export async function canPlay(gameId: number, card: Card, serverModel: ServerModel) : Promise<[boolean, ServerModel]> {
    const [desiredGame, newModel] = await getGame(gameId, serverModel)
    const desiredRound = desiredGame.currentRound
    if(desiredRound) {
        const result = round.canPlay(card, desiredRound)
        return [result, newModel]
    }
    return [false, newModel]
}

export async function drawCard(gameId: number, serverModel: ServerModel) : Promise<[Game, ServerModel]> {
    const [desiredGame, newModel] = await getGame(gameId, serverModel)
    const desiredRound = desiredGame.currentRound
    if(desiredRound) {
        const currentPlayer = desiredRound.currentPlayer
        const newRound = round.draw(1, currentPlayer, desiredRound) //not sure if fine bcs current player is number but draw requires playerName
        const newGame = {...desiredGame, round: newRound}
        const store = await memoryStore.saveGame(newGame, newModel.memoryStore)
        return [newGame, {...newModel, memoryStore: store}]
    }
    return [desiredGame, newModel]
}

export async function sayUno(gameId: number, playerId: number, serverModel: ServerModel): Promise<[Game, ServerModel]> {
    const [desiredGame, newModel] = await getGame(gameId, serverModel)
    const desiredRound = desiredGame.currentRound
    if(desiredRound) {
        const newRound = round.sayUno(playerId, desiredRound) //not sure if fine bcs current player is number but sayUno requires playerName
        const newGame = {...desiredGame, round: newRound}
        const store = await memoryStore.saveGame(newGame, newModel.memoryStore)
        return [newGame, {...newModel, memoryStore: store}]
    }
    return [desiredGame, newModel]
}

export async function accuseUno(gameId: number, accuser: number, accused: number, serverModel: ServerModel): Promise<[Game, ServerModel]> {
    const [desiredGame, newModel] = await getGame(gameId, serverModel)
    const desiredRound = desiredGame.currentRound
    if(desiredRound) {
        const newRound = round.catchUnoFailure(accuser, accused, desiredRound)// number vs PlayerNames
        const newGame = {...desiredGame, round: newRound}
        const store = await memoryStore.saveGame(newGame, newModel.memoryStore)
        return [newGame, {...newModel, memoryStore: store}]
    }
    return [desiredGame, newModel]
}

export async function changeWildCardColor(gameId: number, chosenColor: string, serverModel: ServerModel): Promise<[Game, ServerModel]> {
    const [desiredGame, newModel] = await getGame(gameId, serverModel)
    const desiredRound = desiredGame.currentRound
    if(desiredRound) {
        const newRound = round.setWildCard(chosenColor as Colors, desiredRound)
        const newGame = {...desiredGame, round: newRound}
        const store = await memoryStore.saveGame(newGame, newModel.memoryStore)
        return [newGame, {...newModel, memoryStore: store}]
    }
    return [desiredGame, newModel]
}