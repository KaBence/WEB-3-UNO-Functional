import * as _ from 'lodash';
import type {Hand} from './Hand';

export type PlayerId = number;
export type PlayerRef = { id: PlayerId; name: string };

export enum PlayerNames {
    player1 = 1,
    player2 =2,
    player3 =3,
    player4 =4,
    player5 =5,
    player6 =6,
    player7 =7,
    player8 =8,
    player9 =9,
    player10=10
}

export type Player = {
    readonly id: PlayerNames;
    readonly name: string;
    readonly hand: Hand;
    readonly unoCalled: boolean;
};


export function setUno(unoSet: boolean, player: Player): Player{
    return {...player, unoCalled: unoSet}
}





