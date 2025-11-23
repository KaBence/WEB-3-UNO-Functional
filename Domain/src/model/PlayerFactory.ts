import { Player, PlayerNames } from './Player';

// create a New Player
export function createPlayer(
    id: PlayerNames,
    name: string,
): Player {
    return {
        playerName: id,
        name,
        hand: [],
        unoCalled: false,
    };
}
