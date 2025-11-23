import * as game from "domain/src/model/Game"
import * as round from "domain/src/model/round"
import * as gameFactory from "domain/src/model/gameFactory"
import { Card, Colors } from "domain/src/model/Card"

type Game = game.Game

export function createGame(gameId: number): Game {
   return gameFactory.newGame(gameId)
}

export function addPlayer(player: string, oldGame: Game): Game | undefined {
    if(!oldGame) {
        throw new Error("Game doesnt exist"); //idk what to do here
        return undefined
    }
    const nameTaken = oldGame.players.some((p) => p.name === player)
    if(nameTaken) {
        throw new Error("Player already in game"); //idk what to do here
        return oldGame
    }
    return game.addPlayer(player, oldGame)
}

export function removePlayer(player: number, oldGame: Game): Game | undefined {
    if(!oldGame) {
        throw new Error("Game doesnt exist"); //idk what to do here
        return undefined
    }
    const playerExists = oldGame.players.some((p) => p.id === player)
    if(!playerExists) {
        return oldGame
    }
    const newGame = game.removePlayer(player, oldGame)
    if(newGame.players.length === 0){
        return undefined
    }
    return newGame
}

export function startRound(oldGame: Game): Game {
    if(!oldGame.players || oldGame.players.length < 2){
        throw new Error("Cannot start a round with one or no players.") //idk  what to do here
    }
    return game.createRound(oldGame)
}

export function play(opts: {card: Card, chosenColor?: string}, oldGame: Game): Game {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const newRound = round.play({playedCard: opts.card, color: opts.chosenColor as Colors}, desiredRound)
        return {...oldGame, currentRound: newRound}
    }
    return oldGame
}

export function challangeDrawFour(response: boolean, oldGame: Game): [Game, boolean] {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const [result, newRound] = round.challengeWildDrawFour(response, desiredRound)
        return [{...oldGame, currentRound: newRound}, result]
    }
    return [oldGame, false]
}

export function canPlay(card: Card, oldGame: Game): boolean {
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

export function sayUno(playerId: number, oldGame: Game): Game {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const newRound = round.sayUno(playerId, desiredRound) //not sure if fine bcs current player is number but sayUno requires playerName
        return {...oldGame, currentRound: newRound}
    }
    return oldGame
}

export function accuseUno(accuser: number, accused: number, oldGame: Game): Game {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const newRound = round.catchUnoFailure(accuser, accused, desiredRound)// number vs PlayerNames
        return {...oldGame, currentRound: newRound}
    }
    return oldGame
}

export function changeWildCardColor( chosenColor: string, oldGame: Game): Game {
    const desiredRound = oldGame.currentRound
    if(desiredRound) {
        const newRound = round.setWildCard(chosenColor as Colors, desiredRound)
        return {...oldGame, currentRound: newRound}
    }
    return oldGame
}