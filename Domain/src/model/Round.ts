import * as _ from "lodash";

import * as card from "./Card"
import * as cardFactory from "./CardFactory"
import * as deck from "./Deck";
import * as player from "./Player";
import { Hand } from "./Hand";

export enum Direction {
  Clockwise = "clockwise",
  CounterClockwise = "counterclockwise",
}

type Deck = deck.Deck;
type Player = player.Player;
type Card = card.Card;
type CardType = card.Type;

type Round =  {
  readonly players: Player[];
  readonly currentDirection: Direction;
  readonly currentPlayer: number;
  readonly drawPile: Deck;
  readonly discardPile: Deck;
  readonly topCard: Card;
  readonly statusMessage: string;
  readonly winner?: Player;
};

function createNewRound(players: Player[], dealer: number): Round {
  let drawPile = deck.createNewDrawPile();

  let playersWithCards = _.cloneDeep(players);
  let remainingDeck = _.cloneDeep(drawPile);

  for (let i = 0; i < 7; i++) {
    playersWithCards.forEach((p) => {
      const cardToDeal = deck.deal(remainingDeck);

      if (cardToDeal) {
        player.addCard(p, cardToDeal); // Mutates the cloned player that is adding the card to players hand
      }
    });
  }

  drawPile = remainingDeck;

  const topCard = deck.deal(drawPile);
  const discardPile = [topCard];

  const initialState: Round = {
    players: playersWithCards,
    currentDirection: Direction.Clockwise,
    currentPlayer: (dealer + 1) % players.length,
    drawPile: drawPile,
    discardPile: discardPile,
    topCard: topCard,
    statusMessage: "A new round has begun!",
    winner: undefined,
  };

  return initialState;
};


function updateDrawPile(newDrawPile: Deck, oldRound: Round): Round {
  return {...oldRound, drawPile: newDrawPile}
}

function updateDiscardPile(newDiscardPile: Deck, oldRound: Round): Round {
  return {...oldRound, discardPile: newDiscardPile}
}

function getSpecificPlayer(player: player.PlayerNames, oldRound: Round): Player {
  return oldRound.players.find((p) => p.playerName === player)
}

function getPlayerHand(player: player.PlayerNames, oldRound: Round): Hand | undefined {
  return getSpecificPlayer(oldRound,player)?.hand
}

function updateCurrentDirection(direction: Direction, oldRound: Round): Round {
  return {...oldRound, currentDirection: direction}
}

function getPlayersCard(player: player.PlayerNames, card: number, oldRound: Round): Card | undefined {
  return getPlayerHand(oldRound,player)?.cards[card]
}

function getRoundWinner(oldRound: Round): Round {
  if(oldRound.players.some((p) => p.hand.size === 0)){
    const winner = oldRound.players.find((p) => p.hand.size === 0)
    const statusMessage = winner.name + " Won the round!"
    return {...oldRound, winner: winner, statusMessage: statusMessage}
  }
  return oldRound
}

function getDrawDeckSize(oldRound: Round): number {
  return deck.size(oldRound.drawPile)
}

function draw(noCards: number, playerId: player.PlayerNames, oldRound: Round): Round { //try to make it with _flow() to work on the same newst shit all the time
  let currentRoundState = oldRound;
  
  const playerInfo = getSpecificPlayer(oldRound, playerId);
  if (!playerInfo) {
    console.error("Cannot draw card for player who does not exist.");
    return oldRound; // Return original state if player not found
  }
  
  for (let i = 0; i < noCards; i++) {
    const dealFlow = _.flow([deal,playerAction]) // just pass all of the small helper functions and _ is dealing with it
    currentRoundState = dealFlow(playerId, currentRoundState)
  }

  const finalState = {...currentRoundState, statusMessage: `${playerInfo.getName()} drew ${noCards} card(s).`}
  
  return finalState;
};

function catchUnoFailure(accuser: player.PlayerNames, accused: player.PlayerNames, oldRound: Round): Round {
  const accusedPlayer = getSpecificPlayer(accused, oldRound)
  let message = getSpecificPlayer(accuser, oldRound).name + " accused " + getSpecificPlayer(accused, oldRound).name
  let updated = oldRound
  if (!accusedPlayer.hasUno && accusedPlayer.hand.cards.length === 1) {
    updated = draw(4, accused, oldRound)
    message += " rightfully!"
  }
  else {
    updated = draw(6, accuser, oldRound)
    message += " wrongly"
  }

  return {...updated, statusMessage: message}
}

function canPlay(playedCard: Card, oldRound: Round): boolean {
  const topCard = oldRound.topCard
    switch (playedCard.Type) {
      case card.Type.Reverse:
      case card.Type.Draw:
      case card.Type.Skip:
        switch (topCard.Type){
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
        switch (topCard.Type){
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

//Helper Functions
//Draw
function deal(playerId:player.PlayerNames, oldRound: Round): [Card, player.PlayerNames, Round] {
  let card, newDrawPile = deck.deal(oldRound.drawPile)
  let newDiscardPile = undefined

  if(deck.size(newDrawPile) === 0) {
    const [shaflledDrawPile, shaffledDiscardPile] = deck.createNewDecks(oldRound.discardPile)
    newDiscardPile = shaffledDiscardPile
    newDrawPile = shaflledDrawPile
  }

  if(!newDiscardPile) {
    newDiscardPile = oldRound.discardPile
  }

  return [card, playerId, {...oldRound, drawPile: newDrawPile, discardPile: newDiscardPile}]
}

function playerAction(card: Card, playerId: player.PlayerNames, oldRound: Round): Round {
  let playerForThisTurn = getSpecificPlayer(oldRound, playerId)

  const playerActionFlow = _.flow([setUnoFalse, addCardToPlayersHand])
  playerForThisTurn = playerActionFlow(card,playerForThisTurn)

  const newPlayersArray = oldRound.players.map(p => p.id === playerId ? playerForThisTurn : p)

  return {...oldRound, players: newPlayersArray}
}

function setUnoFalse(card: Card, oldPlayer: Player): [Card, Player] {
  return [card, player.setUno(false, oldPlayer)]
}

function addCardToPlayersHand(card: Card, oldPlayer: Player): Player {
  return player.addCard(card, oldPlayer)
}

export function playIfAllowed(opts: { cardId: number, color?: card.Colors }, round: Round) {
  const playedCard = getPlayersCard(round.currentPlayer, opts.cardId, round)! // has to remove the card
  if (playedCard == undefined) { // has to change
    console.log("I tried to take a card that doesn't exist, whoops")
    return round
  }
  let color = opts.color
  return canPlay(playedCard, round) ? play({ playedCard, color }, round) : round
}

function play(opts: { playedCard: Card, color?: card.Colors }, round: Round): Round {
  const newRound = addCardToDiscardPile(opts.playedCard, round)
  const handledSpecialCards = handleSpecialCards(opts,newRound)
  return _.flow([skip, getRoundWinner])(handledSpecialCards)
}

function skip(round: Round): Round {
  return { ...round, currentPlayer: getNextPlayer(round) }
}

function changeDirection(round: Round): Round {
  const currentDirection = round.currentDirection === Direction.Clockwise ? Direction.CounterClockwise : Direction.Clockwise
  const roundAfterSkip = round.players.length == 2 ? skip(round) : round
  return { ...roundAfterSkip, currentDirection }
}

function addCardToDiscardPile(card: Card, round: Round): Round {
  const discardPile = deck.addCard(card, round.discardPile)
  return { ...round, discardPile, statusMessage: "Played: " + card.cardToString(card) }
}

function handleSpecialCards(opts: { playedCard: Card, color?: card.Colors }, round: Round): Round {
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