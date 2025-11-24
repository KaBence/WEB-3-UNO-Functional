import * as _ from 'lodash';
import type { Card, Cards } from './Card';

export type PlayerRef = { 
    readonly playerName: PlayerNames; 
    readonly name: string; 
};

export enum PlayerNames {
    player1 = 1,
    player2 = 2,
    player3 = 3,
    player4 = 4,
    player5 = 5,
    player6 = 6,
    player7 = 7,
    player8 = 8,
    player9 = 9,
    player10 = 10
}

export type Player = PlayerRef & {
    readonly hand: Cards;
    readonly unoCalled: boolean;
};


export function setUno(unoSet: boolean, player: Player): Player {
    return { ...player, unoCalled: unoSet }
}

//Hand part
export function addCardToPlayerHand(card: Card, player: Player): Player {
    return {
        ...player,
        hand: _.concat(player.hand, card)
    }
}

export function removeCardFromHand(cardId: number, player: Player): [Card, Player] {
    const card = player.hand[cardId];
    const newHand: Cards = [
        ...player.hand.slice(0, cardId),
        ...player.hand.slice(cardId + 1)
    ];

    const updatedPlayer: Player = {
        ...player,
        hand: newHand
    };

    return [card, updatedPlayer];
}



