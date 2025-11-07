import { Player, PlayerNames } from './Player';
import { Hand } from './Hand';

// create a New Player
export function createPlayer(
    id: PlayerNames,
    name: string,
): Player {
    return {
        id,
        name,
        hand: [],
        unoCalled: false,
    };
}
