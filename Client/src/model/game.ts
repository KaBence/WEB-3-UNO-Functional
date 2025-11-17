import type { Colors, Type, CardNumber } from "Domain/src/model/Card"
import type { PlayerNames } from "Domain/src/model/Player"
import type { Direction } from "Domain/src/model/round"

export type PlayerSpecs = Readonly<{
    name: string
    unoCalled: Boolean
    hand: CardSpecs[]
    playerName: PlayerNames
}>

export type PlayerRefSpecs = Readonly<{
    name: string
    playerName: PlayerNames
}>

export type GameSpecs = Readonly<{
    id: number
    players: PlayerSpecs[]
    currentRound?: RoundSpecs
    scores: Record<PlayerNames, Number>
    dealer: number
    winner?: PlayerNames | undefined;
    roundHistory?: [string, number][]
}>

export type RoundSpecs = Readonly<{
    players: PlayerSpecs[]
    drawDeckSize: number
    topCard: CardSpecs
    currentDirection: Direction
    winner: PlayerNames
    currentPlayer: PlayerNames
    statusMessage: string
}>

export type CardSpecs = Readonly<{
    type: Type
    color: Colors
    number: CardNumber
}>

export type GamesFeed = Readonly<{
    action: string,
    Game: GameSpecs,
    gameID: number
}>
