import {Round, initializeRound, handleStartRound} from './round'
import {Player} from './Player'

export function createNewRound(players: Player[], dealer: number): Round {
    const initialRound = initializeRound(players,dealer)
    return handleStartRound(initialRound)
}