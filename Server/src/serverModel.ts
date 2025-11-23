import * as game from "domain/src/model/Game"
import * as round from "domain/src/model/round"
import * as gameFactory from "domain/src/model/gameFactory"
import { Card, Colors } from "domain/src/model/Card"

type Game = game.Game

export function createGame(gameId: number): Game {
   return gameFactory.newGame(gameId)
}

export function addPlayer(oldGame: Game, player: string): Game | null {
    if(!oldGame) {
        throw new Error("Game doesnt exist"); //idk what to do here
        return null
    }
    const nameTaken = oldGame.players.some((p) => p.name === player)
    if(nameTaken) {
        throw new Error("Player already in game"); //idk what to do here
        return oldGame
    }
    return game.addPlayer(player, oldGame)
}

export function removePlayer(oldGame: Game, player: number): Game | null {
    if(!oldGame) {
        throw new Error("Game doesnt exist"); //idk what to do here
        return null
    }
    const playerExists = oldGame.players.some((p) => p.id === player)
    if(!playerExists) {
        return oldGame
    }
    const newGame = game.removePlayer(player, oldGame)
    if(newGame.players.length === 0){
        return null
    }
    return newGame
}

export function startRound(oldGame: Game): Game {
    if(!oldGame.players || oldGame.players.length < 2){
        throw new Error("Cannot start a round with one or no players.") //idk  what to do here
    }
    return game.createRound(oldGame)
}

export function play(oldGame: Game, card: Card, chosenColor?: string): Game {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const newRound = round.play({playedCard: card, color: chosenColor as Colors}, desiredRound)
        return {...oldGame, currentRound: newRound}
    }
    return oldGame
}

export function challangeDrawFour(oldGame: Game, response: boolean): [Game, boolean] {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const [result, newRound] = round.challengeWildDrawFour(response, desiredRound)
        return [{...oldGame, currentRound: newRound}, result]
    }
    return [oldGame, false]
}

export function canPlay(oldGame: Game, card: Card): boolean {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        return round.canPlay(card, desiredRound)
    }
    return false
}

export function drawCard(oldGame: Game): Game {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const currentPlayer = desiredRound.currentPlayer
        const newRound = round.draw(1, currentPlayer, desiredRound) //not sure if fine bcs current player is number but draw requires playerName
        return {...oldGame, currentRound: newRound}
    }
    return oldGame
}

export function sayUno(oldGame: Game, playerId: number): Game {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const newRound = round.sayUno(playerId, desiredRound) //not sure if fine bcs current player is number but sayUno requires playerName
        return {...oldGame, currentRound: newRound}
    }
    return oldGame
}

export function accuseUno(oldGame: Game, accuser: number, accused: number): Game {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const newRound = round.catchUnoFailure(accuser, accused, desiredRound)// number vs PlayerNames
        return {...oldGame, currentRound: newRound}
    }
    return oldGame
}

export function changeWildCardColor(oldGame: Game, chosenColor: string): Game {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const newRound = round.setWildCard(chosenColor as Colors, desiredRound)
        return {...oldGame, currentRound: newRound}
    }
    return oldGame
}