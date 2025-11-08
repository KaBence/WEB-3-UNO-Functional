import { CardNumber, Colors, allColors, Type, Card, Cards, numberValues } from "./Card";

// Create a Single Card

export function CreateNumberedCard(number: CardNumber, color: Colors): Card {
  return { CardNumber: number, Color: color, Type: Type.Numbered, Points: number };
}

export function CreateSpecialColoredCard(type: Type.Skip | Type.Reverse | Type.Draw, color: Colors): Card {
  return { Type: type, Color: color, Points: 20 };
}

export function CreateWildCard(type: Type.Wild | Type.WildDrawFour): Card {
  return { Type: type, Points: 50 };
}

export function CreateDummyCard(color: Colors): Card {
  return { Type: Type.Dummy ,Color: color }
}

export function CreateDummy4Card(color: Colors): Card {
  return { Type: Type.DummyDraw4, Color: color }
}

// Create batches of Cards for Deck initilization

export function CreateNumberedCards(): Cards {
  const cards: Cards = [];
  for (let color of allColors) {
    for (let number of numberValues) {
      if (number !== 0) {
        cards.push(CreateNumberedCard(number, color));
      }
      cards.push(CreateNumberedCard(number, color));
    }
  }
  return cards;
}

export function CreateColoredSpecialCards(): Cards {
  const cards: Cards = [];
  const specialTypes = [Type.Skip, Type.Reverse, Type.Draw] as const;

  for (let color of allColors) {
    for (let type of specialTypes) {
      cards.push(CreateSpecialColoredCard(type, color));
      cards.push(CreateSpecialColoredCard(type, color));
    }
  }
  return cards;
}

export function CreateWildCards(): Cards {
  const cards: Cards = [];
  const wildTypes = [Type.Wild, Type.WildDrawFour] as const;
  for (let type of wildTypes) {
    cards.push(CreateWildCard(type));
    cards.push(CreateWildCard(type));
    cards.push(CreateWildCard(type));
    cards.push(CreateWildCard(type));
  }
  return cards;
}