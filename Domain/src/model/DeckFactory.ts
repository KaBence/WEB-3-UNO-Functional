import * as CardFactory from "./CardFactory";
import { Cards, Card , Type} from "./Card";
import { Deck, DeckTypes } from "./Deck";
import { standardShuffler } from "../utils/random_utils";
import * as _ from "lodash";

// Draw Deck

export function createNewDrawDeck(): Deck {
  let cards = [
    ...CardFactory.CreateNumberedCards(),
    ...CardFactory.CreateColoredSpecialCards(),
    ...CardFactory.CreateWildCards(),
  ]
  standardShuffler(cards)
  return {
    cards: cards,
    type: DeckTypes.Draw,
  };
}

export function createDrawDeck(existingCards: Cards): Deck {
  let cards = [...existingCards]

  standardShuffler(cards)
  return {
    cards: cards,
    type: DeckTypes.Draw,
  };
}

// Discard Deck

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

// Helpers

export function createNewDecks(discardDeck: Deck): [Deck, Deck] {
  let topCard = _.last(discardDeck.cards)
  let rest = _.initial(discardDeck.cards)

  let filteredRest = rest.filter(card => card.Type !== Type.Dummy && card.Type !== Type.DummyDraw4)

  console.assert(!topCard, "discard Deck is empty when creating new Decks")
  console.assert(rest.length == 0, "Draw Deck is empty when creating new Decks")

  let discard = createDiscardDeck(topCard)
  let draw = createDrawDeck(filteredRest)
  return [draw, discard]

}