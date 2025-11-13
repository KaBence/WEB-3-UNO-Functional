// Card Types

export type Card = NumberedCard | SpecialColoredCard | WildCard | DummyCard;
export type Cards = Card[]

type NumberedCard = {
  readonly CardNumber: CardNumber;
  readonly Color: Colors;
  readonly Type: Type.Numbered;
  readonly Points:number;
};

type SpecialColoredCard = {
  readonly Type: Type.Skip | Type.Reverse | Type.Draw;
  readonly Color: Colors;
  readonly Points:number;
};

type WildCard = {
  readonly Type: Type.Wild | Type.WildDrawFour;
  readonly Points:number;
};

type DummyCard = {
  readonly Type: Type.Dummy | Type.DummyDraw4;
  readonly Color: Colors;
};

//Checks

export function hasColor(card: Card, color: Colors): boolean {
  return "Color" in card && card.Color === color;
}

export function hasNumber(card: Card, number: CardNumber): boolean {
  return card.Type === Type.Numbered && card.CardNumber === number;
}

export function cardToString(card: Card): string {
  switch (card.Type) {
    case Type.Draw:
      return card.Color + " Draw two"
    case Type.Skip:
      return card.Color + " Skip"
    case Type.Reverse:
      return card.Color + " Reverse"
    case Type.Wild:
      return " Wild Card"
    case Type.WildDrawFour:
      return " Wild Draw four"
    case Type.Numbered:
      return card.Color + " " + card.CardNumber
    case Type.Dummy:
      return "Wild Card"
    case Type.DummyDraw4:
      return "Wild Draw 4"
  }
}

//Enums

export enum Colors {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
  Yellow = "YELLOW",
}

export const allColors = [
  Colors.Red,
  Colors.Green,
  Colors.Blue,
  Colors.Yellow,
] as const;

export enum Type {
  Skip = "SKIP",
  Reverse = "REVERSE",
  Draw = "DRAW",
  Wild = "WILD",
  WildDrawFour = "WILD DRAW",
  Numbered = "NUMBERED",
  Dummy = "DUMMY",
  DummyDraw4 = "DUMMY4"
}

export const numberValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type CardNumber = (typeof numberValues)[number];
