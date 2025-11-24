import {Round, initializeRound, handleStartRound} from './Round'
import {Player} from './Player'

export function createNewRound(players: Player[], dealer: number): Round {
    const initialRound = initializeRound(players,dealer)
    return handleStartRound(initialRound)
}