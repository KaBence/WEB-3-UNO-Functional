import * as _ from "lodash";

import * as card from "./Card"
import * as CardFactory from "./CardFactory"
import * as deck from "./Deck";
import * as player from "./Player";
import * as hand from "./Hand";

export enum Direction {
  Clockwise = "clockwise",
  CounterClockwise = "counterclockwise",
}

type Deck = deck.Deck;
type Player = player.Player;
type Card = card.Card;
type Hand = hand.Hand;

export type Round =  {
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

function updateCurrentDirection(oldRound: Round): Round {
  const newDirection = oldRound.currentDirection === Direction.Clockwise ? Direction.CounterClockwise : Direction.Clockwise;
  return {...oldRound, currentDirection: newDirection}
}

function getPlayersCard(player: player.PlayerNames, card: number, oldRound: Round): Card | undefined {
  return getPlayerHand(oldRound,player)?.cards[card]
}

function roundHasEnded(oldRound: Round): boolean {
  return oldRound.players.some((p) => p.hand.size === 0)
}

function getRoundWinner(oldRound: Round): Player | undefined {
  const hasWinner = roundHasEnded(oldRound)
  if(hasWinner){
    const winner = oldRound.players.find((p) => p.hand.size === 0)
    const statusMessage = winner.name + " Won the round!"
    return {...oldRound, winner: winner, statusMessage: statusMessage}
  }
  return undefined
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

function canPlay(cardId: number, oldRound: Round): boolean {
  const card = getPlayerHand(oldRound.currentPlayer, oldRound).cards[cardId];
    switch (card.Type) {
      case card.Type.Reverse:
      case card.Type.Draw:
      case card.Type.Skip:
        if (oldRound.topCard.Type === card.Type || oldRound.topCard.Color === card.Color) {
          return true;
        }
        return false;

      case card.Type.Wild:
      case card.Type.WildDrawFour:
        return true;

      case card.Type.Numbered:
        if (oldRound.topCard.CardNumber === card.CardNumber || oldRound.topCard.Color === card.Color){
            return true;
        }
        return false;

      case card.Type.Dummy:
      case card.Type.DummyDraw4:
        return false
      default:
        return false
    }
}

function sayUno(playerId: player.PlayerNames, oldRound: Round): Round {
    const specificPlayer = getSpecificPlayer(playerId, oldRound)
    const playersHand = getPlayerHand(playerId, oldRound)
    let updated = undefined
    let message = ""
    if (playersHand.length === 2) {
      if (canPlay(0, oldRound) || canPlay(1, oldRound)) {
        player.setUno(true, specificPlayer)
        message = specificPlayer.name + " called UNO!"
      }
      else {
        updated = draw(4,playerId,oldRound)
        message = specificPlayer.name + " called UNO and failed!"
      }
      if (!updated) {
        updated = oldRound
      }
      return {...updated, statusMessage: message}
    }
    if (playersHand.length != 1) {
        updated = draw(4,playerId,oldRound)
        message = specificPlayer.name + " called UNO and failed!"
      return {...updated, statusMessage: message}
    }
    player.setUno(true, specificPlayer)
    message = specificPlayer.name + " called UNO!"
    return {...oldRound, statusMessage: message}

}

function getNextPlayer(oldRound: Round): player.PlayerNames {
    let index = 0;
    if (oldRound.currentDirection === Direction.Clockwise)
      index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) + 1) % oldRound.players.length
    else
      index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) - 1 + oldRound.players.length) % oldRound.players.length
    return oldRound.players[index].playerName
}

function getPreviousPlayer(oldRound: Round): player.PlayerNames {
    let index = 0;
    if (oldRound.currentDirection === Direction.Clockwise)
      index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) - 1  + oldRound.players.length) % oldRound.players.length
    else
      index = (oldRound.players.findIndex((p) => p.playerName === oldRound.currentPlayer) + 1) % oldRound.players.length
    return oldRound.players[index].playerName
}

  function couldPlayInsteadofDrawFour(oldRound: Round): boolean {
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

  function challengeWildDrawFour(isChallenged: boolean, oldRound: Round): [boolean, Round] {
    let newRound = undefined
    let message = ""

    if (!isChallenged) {
      newRound = draw(4, oldRound.currentPlayer, oldRound)
      message = getSpecificPlayer(newRound.currentPlayer, newRound).name + " did not challenge"
      return [false, {...newRound, statusMessage: message, currentPlayer: getNextPlayer(newRound)}];
    }

    if (!couldPlayInsteadofDrawFour(oldRound)){
      newRound = draw(4, getPreviousPlayer(oldRound), oldRound)
      message = getSpecificPlayer(newRound.currentPlayer, newRound).name + " challenged successfully"
      return [true, {...newRound, statusMessage: message}];
    }
    newRound = draw(6, oldRound.currentPlayer, oldRound)
    message = getSpecificPlayer(newRound.currentPlayer, newRound).name + " challenged but failed"
    return [false, {...newRound, statusMessage: message, currentPlayer: getNextPlayer(newRound)}];
  }

  export function handleStartRound(oldRound: Round): Round {
    const currentCard = oldRound.topCard

    switch (currentCard.Type) {
      case card.Type.Skip:
        return {...oldRound, currentPlayer: getNextPlayer(oldRound)}
      case card.Type.Reverse:
        const reverseRound = updateCurrentDirection(oldRound)
        return {...reverseRound, currentPlayer: getNextPlayer(reverseRound)} //we dont need to cal next player 2 since we are passing updated round
      case card.Type.Draw:
        const drawRound = draw(2, oldRound.currentPlayer, oldRound)
        return {...drawRound, currentPlayer: getNextPlayer(drawRound)}
      case card.Type.WildDrawFour:
        const wildDrawPile = _.flow([deck.addCard, deck.shaffle])
        const tempDrawPile = wildDrawPile(currentCard, oldRound.drawPile)
        const [newTopCard, newDrawPile] = deck.deal(tempDrawPile)
        const newDiscardPile = deck.addCard(newTopCard, oldRound.discardPile)
        
        const updatedRound = {...oldRound, topCard:newTopCard, discardPile: newDiscardPile, drawPile: newDrawPile}
        return handleStartRound(updatedRound)
      default:
        return oldRound;
    }
  }

  function setWildCard(color: card.Color, oldRound: Round): Round {
    const newDiscardPile = deck.addCard(CardFactory.CreateDummyCard(color),oldRound.discardPile)
    return {...oldRound, discardPile: newDiscardPile}
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