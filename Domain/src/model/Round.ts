import * as _ from "lodash";

import * as card from "./Card"
import * as cardFactory from "./CardFactory"
import * as deckFactory from "./DeckFactory"
import * as deck from "./Deck";
import * as player from "./Player";

export enum Direction {
  Clockwise = "clockwise",
  CounterClockwise = "counterclockwise",
}

type Deck = deck.Deck;
type Player = player.Player;
type Card = card.Card;

export type Round = {
  readonly players: Player[];
  readonly currentDirection: Direction;
  readonly currentPlayer: number;
  readonly drawPile: Deck;
  readonly discardPile: Deck;
  readonly topCard: Card;
  readonly statusMessage: string;
  readonly winner?: Player;
};

export function initializeRound(players: Player[], dealer: number): Round {
  let drawPile = deckFactory.createNewDrawDeck();

  let playersWithCards = _.cloneDeep(players);
  let remainingDeck = _.cloneDeep(drawPile);
  let newPlayers: Player[] = []

  for (let i = 0; i < 7; i++) {
    playersWithCards.forEach((p) => {
      const cardToDeal = deck.deal(remainingDeck);

      if (cardToDeal) {
        newPlayers.push(player.addCardToPlayerHand(cardToDeal[0]!,p))  // Mutates the cloned player that is adding the card to players hand
      }
    });
  }

  drawPile = remainingDeck;
  const discardPile = deckFactory.createDiscardDeck(deck.deal(drawPile)[0])

  const initialState: Round = {
    players: playersWithCards,
    currentDirection: Direction.Clockwise,
    currentPlayer: (dealer + 1) % players.length,
    drawPile: drawPile,
    discardPile: discardPile,
    topCard: deck.peek(discardPile)[0]!,
    statusMessage: "A new round has begun!",
    winner: undefined,
  };

  return initialState;
};

export function getSpecificPlayer(player: player.PlayerNames, oldRound: Round): Player {
  return oldRound.players.find((p) => p.id === player)!
}

function getPlayerHand(player: player.PlayerNames, oldRound: Round): Hand | undefined {
  return getSpecificPlayer(oldRound,player)?.hand
}


function getPlayersCard(player: player.PlayerNames, card: number, oldRound: Round): Card | undefined {
  return getPlayerHand(oldRound,player)?.cards[card]
}

function getRoundWinner(oldRound: Round): Round {
  if(oldRound.players.some((p) => p.hand.length === 0)){
    const winner = oldRound.players.find((p) => p.hand.length === 0)!
    const statusMessage = winner.name + " Won the round!"
    return { ...oldRound, winner: winner, statusMessage: statusMessage }
  }
  return oldRound
}


export function draw(noCards: number, playerId: player.PlayerNames, oldRound: Round): Round { //try to make it with _flow() to work on the same newst shit all the time
  let currentRoundState = oldRound;
  
  const playerInfo = getSpecificPlayer(playerId, oldRound);
  if (!playerInfo) {
    console.error("Cannot draw card for player who does not exist.");
    return oldRound; // Return original state if player not found
  }

  for (let i = 0; i < noCards; i++) {
    const dealFlow = _.flow([deal, playerAction]) // just pass all of the small helper functions and _ is dealing with it
    currentRoundState = dealFlow(playerId, currentRoundState)
  }

  const finalState = {...currentRoundState, statusMessage: `${playerInfo.name} drew ${noCards} card(s).`}
  
  return finalState;
};

export function catchUnoFailure(accuser: player.PlayerNames, accused: player.PlayerNames, oldRound: Round): Round {
  const accusedPlayer = getSpecificPlayer(accused, oldRound)
  const message = getSpecificPlayer(accuser, oldRound).name + " accused " + getSpecificPlayer(accused, oldRound).name

  if (!accusedPlayer.unoCalled && accusedPlayer.hand.length === 1) {
    const updated = draw(4, accused, oldRound)
    const newMessage = message + " rightfully!"
    return { ...updated, statusMessage: newMessage }
  }
  else {
    const updated = draw(6, accuser, oldRound)
    const newMessage = message + " wrongly"
    return { ...updated, statusMessage: newMessage }
  }
}

export function canPlay(playedCard: Card, oldRound: Round): boolean {
  const topCard = oldRound.topCard
  switch (playedCard.Type) {
    case card.Type.Reverse:
    case card.Type.Draw:
    case card.Type.Skip:
      switch (topCard.Type) {
        case card.Type.Wild:
        case card.Type.WildDrawFour:
          return false;
        case card.Type.Skip:
        case card.Type.Reverse:
        case card.Type.Draw:
          return topCard.Type === playedCard.Type || topCard.Color === playedCard.Color
        case card.Type.Numbered:
        case card.Type.Dummy:
        case card.Type.DummyDraw4:
          return topCard.Color === playedCard.Color
      }
    case card.Type.Wild:
    case card.Type.WildDrawFour:
      return true;
    case card.Type.Numbered:
      switch (topCard.Type) {
        case card.Type.Skip:
        case card.Type.Reverse:
        case card.Type.Draw:
        case card.Type.Dummy:
        case card.Type.DummyDraw4:
          return topCard.Color === playedCard.Color
        case card.Type.Numbered:
          return topCard.CardNumber === playedCard.CardNumber || topCard.Color === topCard.Color
        case card.Type.Wild:
        case card.Type.WildDrawFour:
      }
    case card.Type.Dummy:
    case card.Type.DummyDraw4:
      return false
  }
}

export function sayUno(playerId: player.PlayerNames, oldRound: Round): Round {
  const specificPlayer = getSpecificPlayer(playerId, oldRound)
  const playersHand = getPlayerHand(playerId, oldRound)
  if (playersHand.length === 2) {
    if (canPlay(0, oldRound) || canPlay(1, oldRound)) {
      const newPlayer = player.setUno(true, specificPlayer)
      const newPlayersArray = oldRound.players.map(p => p.id === newPlayer.id)
      const message = specificPlayer.name + " called UNO!"
      return { ...oldRound, players: newPlayersArray, statusMessage: message }
    }
    else {
      const updated = draw(4, playerId, oldRound)
      const message = specificPlayer.name + " called UNO and failed!"
      return { ...updated, statusMessage: message }
    }
  }
  if (playersHand.length != 1) {
    const updated = draw(4, playerId, oldRound)
    const message = specificPlayer.name + " called UNO and failed!"
    return { ...updated, statusMessage: message }
  }
  const newPlayer = player.setUno(true, specificPlayer)
  const newPlayersArray = oldRound.players.map(p => p.id === newPlayer.id)
  const message = specificPlayer.name + " called UNO!"
  return { ...oldRound, players: newPlayer, statusMessage: message }

}

export function getNextPlayer(oldRound: Round): player.PlayerNames {
  if (oldRound.currentDirection === Direction.Clockwise) {
    const index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) + 1) % oldRound.players.length
    return oldRound.players[index].playerName
  }
  else {
    const index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) - 1 + oldRound.players.length) % oldRound.players.length
    return oldRound.players[index].playerName
  }
}

export function getPreviousPlayer(oldRound: Round): player.PlayerNames {
  if (oldRound.currentDirection === Direction.Clockwise) {
    const index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) - 1 + oldRound.players.length) % oldRound.players.length
    return oldRound.players[index].playerName
  }
  else {
    const index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) + 1) % oldRound.players.length
    return oldRound.players[index].playerName
  }
}

export function couldPlayInsteadofDrawFour(oldRound: Round): boolean {
  const hand = getPlayerHand(getPreviousPlayer(oldRound), oldRound).cards

  for (let i = 0; i < hand.length; i++) {
    switch (hand[i].Type) {
      case card.Type.Reverse:
      case card.Type.Draw:
      case card.Type.Skip:
        if (oldRound.topCard.Type === hand[i].Type || oldRound.topCard.Color === hand[i].Color) {
          return true;
        }
        break;
      case card.Type.Numbered:
        if (oldRound.topCard.CardNumber === hand[i].CardNumber || oldRound.topCard.Color === hand[i].Color) {
          return true;
        }
      case card.Type.Wild:
      case card.Type.WildDrawFour:
      case card.Type.Dummy:
      case card.Type.DummyDraw4:
        break;
    }
  }
  return false;
}

export function challengeWildDrawFour(isChallenged: boolean, oldRound: Round): [boolean, Round] {

  if (!isChallenged) {
    const newRound = draw(4, oldRound.currentPlayer, oldRound)
    const message = getSpecificPlayer(newRound.currentPlayer, newRound).name + " did not challenge"
    return [false, { ...newRound, statusMessage: message, currentPlayer: getNextPlayer(newRound) }];
  }

  if (!couldPlayInsteadofDrawFour(oldRound)) {
    const newRound = draw(4, getPreviousPlayer(oldRound), oldRound)
    const message = getSpecificPlayer(newRound.currentPlayer, newRound).name + " challenged successfully"
    return [true, { ...newRound, statusMessage: message }];
  }
  const newRound = draw(6, oldRound.currentPlayer, oldRound)
  const message = getSpecificPlayer(newRound.currentPlayer, newRound).name + " challenged but failed"
  return [false, { ...newRound, statusMessage: message, currentPlayer: getNextPlayer(newRound) }];
}

export function handleStartRound(oldRound: Round): Round { //we can ad Bence's helper functions from play
  const currentCard = oldRound.topCard

  switch (currentCard.Type) {
    case card.Type.Skip:
      return { ...oldRound, currentPlayer: getNextPlayer(oldRound) }
    case card.Type.Reverse:
      const reverseRound = changeDirection(oldRound)
      return { ...reverseRound, currentPlayer: getNextPlayer(reverseRound) } //we dont need to cal next player 2 since we are passing updated round
    case card.Type.Draw:
      const drawRound = draw(2, oldRound.currentPlayer, oldRound)
      return { ...drawRound, currentPlayer: getNextPlayer(drawRound) }
    case card.Type.WildDrawFour:
      const wildDrawPile = _.flow([deck.addCard, deck.shuffle])
      const tempDrawPile = wildDrawPile(currentCard, oldRound.drawPile)
      const [newTopCard, newDrawPile] = deck.deal(tempDrawPile)

      if (!newTopCard) {
        return oldRound;
      }

      const newDiscardPile = deck.addCard(newTopCard, oldRound.discardPile)

      const updatedRound = { ...oldRound, topCard: newTopCard, discardPile: newDiscardPile, drawPile: newDrawPile }
      return handleStartRound(updatedRound)
    default:
      return oldRound;
  }
}

export function setWildCard(color: card.Colors, oldRound: Round): Round {
  const newDiscardPile = deck.addCard(cardFactory.CreateDummyCard(color), oldRound.discardPile)
  return { ...oldRound, discardPile: newDiscardPile }
}

//Helper Functions
//Draw
export function deal(playerId: player.PlayerNames, oldRound: Round): [Card | undefined, player.PlayerNames, Round] {
  const [card, newDrawPile] = deck.deal(oldRound.drawPile)

  if (deck.size(newDrawPile) === 0) {
    const [shaflledDrawPile, shaffledDiscardPile] = deckFactory.createNewDecks(oldRound.discardPile)
    return [card, playerId, { ...oldRound, drawPile: shaflledDrawPile, discardPile: shaffledDiscardPile }]
  }

  return [card, playerId, { ...oldRound, drawPile: newDrawPile }]
}

export function playerAction(card: Card, playerId: player.PlayerNames, oldRound: Round): Round {
  const playerForThisTurn = getSpecificPlayer(playerId, oldRound)
  const playerUnoFalse = player.setUno(false, playerForThisTurn)
  const updatedPlayer = player.addCardToPlayerHand(card, playerUnoFalse)

  const newPlayersArray = oldRound.players.map(p => p.id === playerId ? updatedPlayer : p)

  return { ...oldRound, players: newPlayersArray }
}

export function playIfAllowed(opts: { cardId: number, color?: card.Colors }, round: Round) {
  const playedCard = getPlayersCard(round.currentPlayer, opts.cardId, round)! // has to remove the card
  if (playedCard == undefined) { // has to change
    console.log("I tried to take a card that doesn't exist, whoops")
    return round
  }
  const color = opts.color
  return canPlay(playedCard, round) ? play({ playedCard, color }, round) : round
}

export function play(opts: { playedCard: Card, color?: card.Colors }, round: Round): Round {
  const newRound = addCardToDiscardPile(opts.playedCard, round)
  const handledSpecialCards = handleSpecialCards(opts, newRound)
  return _.flow([skip, getRoundWinner])(handledSpecialCards)
}

export function skip(round: Round): Round {
  return { ...round, currentPlayer: getNextPlayer(round) }
}

export function changeDirection(round: Round): Round {
  const currentDirection = round.currentDirection === Direction.Clockwise ? Direction.CounterClockwise : Direction.Clockwise
  const roundAfterSkip = round.players.length == 2 ? skip(round) : round
  return { ...roundAfterSkip, currentDirection }
}

export function addCardToDiscardPile(card: Card, round: Round): Round {
  const discardPile = deck.addCard(card, round.discardPile)
  return { ...round, discardPile, statusMessage: "Played: " + card.cardToString(card) }
}

export function handleSpecialCards(opts: { playedCard: Card, color?: card.Colors }, round: Round): Round {
  switch (opts.playedCard.Type) {
    case card.Type.Skip:
      return skip(round)
    case card.Type.Reverse:
      return changeDirection(round)
    case card.Type.Draw:
      return draw(2, round.currentPlayer, round)
    case card.Type.Wild:
      return addCardToDiscardPile(cardFactory.CreateDummyCard(opts.color!), round)
    case card.Type.WildDrawFour:
      return addCardToDiscardPile(cardFactory.CreateDummy4Card(opts.color!), round)
    case card.Type.Numbered:
    case card.Type.Dummy:
    case card.Type.DummyDraw4:
      return round;
  }
}