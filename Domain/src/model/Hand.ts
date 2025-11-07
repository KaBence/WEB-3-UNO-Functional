import * as _ from "lodash";
import type { Card, Cards } from './Card';


export type Hand = Cards;

export function addCardToHand(card: Card, hand: Hand): Hand {
    return _.concat(hand, card)
}

export function removeCardFromHand(card: Card, hand: Hand): [Card, Hand] {
    const indexCard = hand.indexOf(card);
    return [card, {
        ...hand.slice(0, indexCard),
        ...hand.slice(indexCard + 1)
    }
    ]
}

