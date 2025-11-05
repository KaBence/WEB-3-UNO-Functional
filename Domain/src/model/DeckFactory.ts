import * as CardFactory from "./CardFactory";
import { Cards, Card } from "./Card";
import { Deck, DeckTypes } from "./deck";
import { standardShuffler } from "../utils/random_utils";
import * as _ from "lodash";

export function createDrawDeck(existingCards?: Cards): Deck {
  let cards = []
  if (existingCards) {
    cards = [...existingCards]
  }
  else {
    cards = [
      ...CardFactory.CreateNumberedCards(),
      ...CardFactory.CreateColoredSpecialCards(),
      ...CardFactory.CreateWildCards(),
    ]
  }

  standardShuffler(cards)
  return {
    cards: cards,
    type: DeckTypes.Draw,
  };
}

export function createDiscardDeck(card?: Card): Deck {
  if (!card) {
    return {
      cards: [],
      type: DeckTypes.Discard,
    };
  }
  
  return {
    cards: [card],
    type: DeckTypes.Discard,
  };
}

export function createNewDecks(discardDeck: Deck): [Deck, Deck] {
  let topCard = _.last(discardDeck.cards)!
  let rest = _.initial(discardDeck.cards)

  let discard = createDiscardDeck(topCard)
  let draw = createDrawDeck(rest)
  return [draw, discard]

}