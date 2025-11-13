
import type { Round } from "./Round";
import * as RoundFactory from "./RoundFactory";
import * as DeckFactory from "./DeckFactory";
import type { PlayerId, PlayerRef } from "./Player";
import { flow } from "lodash";
import { Card } from "./Card";
import { Deck, deal, shuffle, DeckTypes } from "./Deck";
import {
  start as roundStart,
  removePlayer as roundRemovePlayer,
  hasWinner as roundHasWinner,
  winnerId as roundWinnerId,
  winnerName as roundWinnerName,
  pointsForWinner as roundPointsForWinner,
} from "./Round";



export type Game = {
  readonly id: number;
  readonly players: PlayerRef[];
  readonly currentRound?: Round;
  readonly targetScore: number;
  readonly scores: Record<PlayerId, number>;
  readonly dealer: number;
  readonly roundHistory: [string, number][];
  readonly winner?: PlayerId;
};

export function addPlayer(name: string, g: Game): Game {
  const nextId = g.players.length + 1;
  return {
    ...g,
    players: [...g.players, { id: nextId, name }],
    scores: { ...g.scores, [nextId]: 0 },
  };
}

export function removePlayer(playerId: PlayerId, g: Game): Game {
  const players = g.players.filter(p => p.id !== playerId);
  if (players.length === g.players.length) return g;
  const { [playerId]: _drop, ...rest } = g.scores;
  const currentRound = g.currentRound ? roundRemovePlayer(g.currentRound, playerId) : undefined;

  let dealer = g.dealer;
  if (players.length === 0) dealer = -1;
  else if (dealer >= players.length) dealer = players.length - 1;

  return { ...g, players, scores: rest as Record<PlayerId, number>, currentRound, dealer };
}




export function selectDealerBy(g: Game): Game {
  //if (g.players.length === 0) return { ...g, dealer: -1 };
  let deck = DeckFactory.createNewDrawDeck();
  let best = -Infinity;
  let bestIdx = 0;


 
  for (let i = 0; i < g.players.length; i++) {
    const [card, nextDeck] = deal(deck); 
    deck = nextDeck;

    // each card has points
    const score = card ? Card.Points : -Infinity;
    if (score > best) {
      best = score;
      bestIdx = i;
    }
  }

  return { ...g, dealer: bestIdx };
}



//advance dealer to next player
export function nextDealer(g: Game): Game {
  if (g.players.length === 0) return g;
  const dealer = g.dealer === -1 ? 0 : (g.dealer + 1) % g.players.length;
  return { ...g, dealer };
}

const chooseDealer = (g: Game): Game =>
  g.dealer === -1 ? selectDealerBy( g) : nextDealer(g);


const startRound = (players: PlayerRef[], dealer: PlayerId ): Round => RoundFactory.createRound(players, dealer);

export function createRound(g: Game): Game {
  if (g.players.length === 0) return g;

  //  decide dealer on the Game
  const withDealer = chooseDealer(g);

  //  start a round based on players + dealer
  const round = startRound(withDealer.players, withDealer.dealer);

  return {
    ...withDealer,
    currentRound: round,
  };
}


export function roundFinished(g: Game): Game {
  const r = g.currentRound;
  if (!r || !roundHasWinner(r)) return g;

  const wId = roundWinnerId(r);
  const wName = roundWinnerName(r);
  if (wId === undefined || !wName) return g;

  const pts = roundPointsForWinner(r);
  const scores = { ...g.scores, [wId]: (g.scores[wId] ?? 0) + pts };
  const roundHistory = [...g.roundHistory, [wName, pts] as [string, number]];

  let winner = g.winner;
  for (const [idStr, sc] of Object.entries(scores) as Array<[string, number]>) {
    if (sc >= g.targetScore) {
      winner = Number(idStr) as PlayerId;
      break;
    }
  }

  return { ...g, scores, roundHistory, winner };
}