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
  readonly statusMessage: string;
  readonly winner?: player.PlayerNames;
};

export function initializeRound(players: Player[], dealer: number): Round {
  let drawPile = deckFactory.createNewDrawDeck();

  // Work on clones to avoid mutating input
  let playersWithCards = _.cloneDeep(players);
  let remainingDeck = _.cloneDeep(drawPile);

  // Deal 7 cards to each player, updating the deck each time
  for (let i = 0; i < 7; i++) {
    for (let idx = 0; idx < playersWithCards.length; idx++) {
      const [cardToDeal, nextDeck] = deck.deal(remainingDeck);
      remainingDeck = nextDeck;
      if (cardToDeal) {
        const updatedPlayer = player.addCardToPlayerHand(cardToDeal, playersWithCards[idx]);
        playersWithCards[idx] = updatedPlayer;
      }
    }
  }

  // Flip the first discard card from the remaining draw deck
  const [firstDiscard, nextDrawPile] = deck.deal(remainingDeck);
  const discardPile = deckFactory.createDiscardDeck(firstDiscard);
  
  const initialState: Round = {
    players: playersWithCards,
    currentDirection: Direction.Clockwise,
    currentPlayer: ((dealer + 1) % players.length) + 1,
    drawPile: nextDrawPile,
    discardPile: discardPile,
    statusMessage: "A new round has begun!",
    winner: undefined,
  };

  return initialState;
};

export function getSpecificPlayer(player: player.PlayerNames, oldRound: Round): Player {
  return oldRound.players.find((p) => p.playerName === player)!
}

// Previously topcard was saved, but then we have to update topcard and the discardPile variable, getting it from the discardPile solves it. (Single Source of truth)
export function getTopCard(round:Round):Card{
  return deck.peek(round.discardPile)[0]!
}

export function getRoundWinner(oldRound: Round): Round {
  if(oldRound.players.some((p) => p.hand.length === 0)){
    const winner = oldRound.players.find((p) => p.hand.length === 0)!
    const statusMessage = winner.name + " Won the round!"
    return { ...oldRound, winner: winner.playerName, statusMessage: statusMessage }
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
    const [dealtCard, _, roundAfterDeal] = deal(playerId, currentRoundState)
    currentRoundState = playerAction(dealtCard, playerId, roundAfterDeal)
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

export function canPlay(cardId: number, oldRound: Round): boolean {
  const topCard = getTopCard(oldRound)
  const playedCard = getSpecificPlayer(oldRound.currentPlayer, oldRound ).hand[cardId]
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
          return topCard.CardNumber === playedCard.CardNumber || topCard.Color === playedCard.Color
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
    const playersHand = specificPlayer.hand
    if (playersHand.length === 2) {
      if (canPlay(0, oldRound) || canPlay(1, oldRound)) {
        const newPlayer = player.setUno(true, specificPlayer)
        const newPlayersArray = oldRound.players.map(p => p.playerName === newPlayer.playerName ? newPlayer : p)
        const message = specificPlayer.name + " called UNO!"
        return {...oldRound, players: newPlayersArray, statusMessage: message}
      }
      else {
        const updated = draw(4,playerId,oldRound)
        const message = specificPlayer.name + " called UNO and failed!"
        return {...updated, statusMessage: message}
      }
    }
    if (playersHand.length != 1) {
        const updated = draw(4,playerId,oldRound)
        const message = specificPlayer.name + " called UNO and failed!"
      return {...updated, statusMessage: message}
    }
    const newPlayer = player.setUno(true, specificPlayer)
    const newPlayersArray = oldRound.players.map(p => p.playerName === newPlayer.playerName ? newPlayer : p)
    const message = specificPlayer.name + " called UNO!"
    return {...oldRound, players: newPlayersArray, statusMessage: message}

}

function getNextPlayer(oldRound: Round): player.PlayerNames {
    if (oldRound.currentDirection === Direction.Clockwise) {
      const index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) + 1) % oldRound.players.length
      return oldRound.players[index].playerName
    }
    else {
      const index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) - 1 + oldRound.players.length) % oldRound.players.length
      return oldRound.players[index].playerName
    }
}

function getPreviousPlayer(oldRound: Round): player.PlayerNames {
    if (oldRound.currentDirection === Direction.Clockwise) {
      const index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) - 1  + oldRound.players.length) % oldRound.players.length
      return oldRound.players[index].playerName
    }
    else {
      const index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) + 1) % oldRound.players.length
      return oldRound.players[index].playerName
    }
}

  function couldPlayInsteadofDrawFour(oldRound: Round): boolean {
    const hand = getSpecificPlayer(getPreviousPlayer(oldRound),oldRound).hand

    //const topCard = getTopCard(oldRound) <- this is giving us dummy and we want one card before dummy
    const topCard = oldRound.discardPile.cards[oldRound.discardPile.cards.length-3] //aparently we are adding adding wild card and then dummy: sequence from the back [DUMMY -> WILD DRAW -> top card that we are intereted in]
    for (let i = 0; i < hand.length; i++) {
      const cardToCheck = hand[i];
      switch (cardToCheck.Type) {
        case card.Type.Reverse:
        case card.Type.Draw:
        case card.Type.Skip:
          switch (topCard!.Type) {
            case card.Type.Wild:
            case card.Type.WildDrawFour:
              break;
            case card.Type.Skip:
            case card.Type.Reverse:
            case card.Type.Draw:
              if(topCard!.Type === cardToCheck.Type || topCard!.Color === cardToCheck.Color){
                return true
              }
              break;
            case card.Type.Numbered:
            case card.Type.Dummy:
            case card.Type.DummyDraw4:
              if(topCard!.Color === cardToCheck.Color){
                return true;
              }
              break;
          }
        case card.Type.Wild:
        case card.Type.WildDrawFour:
          break;
        case card.Type.Numbered:
          switch (topCard!.Type) {
            case card.Type.Skip:
            case card.Type.Reverse:
            case card.Type.Draw:
            case card.Type.Dummy:
            case card.Type.DummyDraw4:
              if(topCard!.Color === cardToCheck.Color){
                return true;
              }
              break;
            case card.Type.Numbered:
              if(topCard!.CardNumber === cardToCheck.CardNumber || topCard!.Color === cardToCheck.Color){
                return true
              }
              break;
            case card.Type.Wild:
            case card.Type.WildDrawFour:
          }
        case card.Type.Dummy:
        case card.Type.DummyDraw4:
          break;
      }
    }
    return false
  }

export function challengeWildDrawFour(isChallenged: boolean, oldRound: Round): [boolean, Round] {

  if (!isChallenged) {
    const newRound = draw(4, oldRound.currentPlayer, oldRound)
    const message = getSpecificPlayer(newRound.currentPlayer, newRound).name + " did not challenge"
    return [false, { ...newRound, statusMessage: message, currentPlayer: getNextPlayer(newRound) }];
  }
  const flag = couldPlayInsteadofDrawFour(oldRound)
  if (flag) {
    const newRound = draw(4, getPreviousPlayer(oldRound), oldRound)
    const message = getSpecificPlayer(newRound.currentPlayer, newRound).name + " challenged successfully"
    return [true, { ...newRound, statusMessage: message }];
  }
  const newRound = draw(6, oldRound.currentPlayer, oldRound)
  const message = getSpecificPlayer(newRound.currentPlayer, newRound).name + " challenged but failed"
  return [false, { ...newRound, statusMessage: message, currentPlayer: getNextPlayer(newRound) }];
}

export function handleStartRound(oldRound: Round): Round { //we can ad Bence's helper functions from play
  const currentCard = getTopCard(oldRound)

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
export function deal(playerId: player.PlayerNames, oldRound: Round): [Card, player.PlayerNames, Round] {
  const [card, newDrawPile] = deck.deal(oldRound.drawPile)

  if (deck.size(newDrawPile) === 0) {
    const [shaflledDrawPile, shaffledDiscardPile] = deckFactory.createNewDecks(oldRound.discardPile)
    return [card!, playerId, { ...oldRound, drawPile: shaflledDrawPile, discardPile: shaffledDiscardPile }]
  }

  return [card!, playerId, { ...oldRound, drawPile: newDrawPile }]
}

export function playerAction(card: Card, playerId: player.PlayerNames, oldRound: Round): Round {
  const playerForThisTurn = getSpecificPlayer(playerId, oldRound)
  const playerUnoFalse = player.setUno(false, playerForThisTurn)
  const updatedPlayer = player.addCardToPlayerHand(card, playerUnoFalse)

  const newPlayersArray = oldRound.players.map(p => p.playerName === playerId ? updatedPlayer : p)

  return { ...oldRound, players: newPlayersArray }
}

export function playIfAllowed(opts: { cardId: number, color?: card.Colors }, round: Round) {
  const currentPlayer = getSpecificPlayer(round.currentPlayer, round)
  const [takenCard, newCurrentPlayer] = player.removeCardFromHand(opts.cardId, currentPlayer)

  if (takenCard == undefined) { // has to change
    console.log("I tried to take a card that doesn't exist, whoops")
    return round
  }

  const newPlayersArray = round.players.map(p => p.playerName === round.currentPlayer ? newCurrentPlayer : p)
  const updatedRound = { ...round, players: newPlayersArray }
  return canPlay(opts.cardId, round) ? play({ playedCard: takenCard, color: opts.color }, updatedRound) : round
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

export function addCardToDiscardPile(cardToAdd: Card, round: Round): Round {
  const discardPile = deck.addCard(cardToAdd, round.discardPile)
  return { ...round, discardPile, statusMessage: "Played: " + card.cardToString(cardToAdd) }
}

export function handleSpecialCards(opts: { playedCard: Card, color?: card.Colors }, round: Round): Round {
  switch (opts.playedCard.Type) {
    case card.Type.Skip:
      return skip(round)
    case card.Type.Reverse:
      return changeDirection(round)
    case card.Type.Draw:
      return draw(2, getNextPlayer(round), round)
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

  export function removePlayer(playerId: number, oldRound:Round): Round {
    const updatedPlayers = oldRound.players.filter(p => p.playerName !== playerId);
    return {...oldRound, players: updatedPlayers}
  }