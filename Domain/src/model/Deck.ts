import { standardShuffler } from "../utils/random_utils";
import { Card, Cards } from "./Card";
import * as _ from "lodash";

// Types

export type Deck = DiscardDeck | DrawDeck;

type BaseDeck = {
    readonly cards: Cards;
};

type DiscardDeck = BaseDeck & {
    readonly type: DeckTypes.Discard;
};

type DrawDeck = BaseDeck & {
    readonly type: DeckTypes.Draw;
};

// Functions

export function addCard(card: Card, deck: Deck): Deck {
    const newCards = _.concat(deck.cards, card)
    return { ...deck, cards: newCards }
}

export function shuffle(deck: Deck): Deck {
    let cards = [...deck.cards];
    standardShuffler(cards);
    return { ...deck, cards: cards };
}

export function size(deck: Deck): number {
    return deck.cards.length;
}

export function deal(deck: Deck): [Card | undefined, Deck] {
    if (size(deck) === 0) {
        return [undefined, deck];
    }
    const topCard = _.first(deck.cards)
    const rest = _.tail(deck.cards)
    return [topCard, { ...deck, cards: rest }]
}

export function peek(deck: Deck): [Card | undefined, Deck] {
    if (size(deck) === 0) {
        return [undefined, deck];
    }
    const topCard = _.last(deck.cards)
    return [topCard, deck]
}

// Enums

export enum DeckTypes {
    Discard,
    Draw,
}
