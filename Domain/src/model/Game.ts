
import type { Round } from "./round";
import * as RoundFactory from "./RoundFactory";
import * as DeckFactory from "./DeckFactory";
import type { PlayerId, PlayerRef } from "./Player";
import * as playerFactory from "./PlayerFactory"
import { flow } from "lodash";
import { Card, Type } from "./Card";
import { Deck, deal, shuffle, DeckTypes } from "./deck";
import {
  initializeRound as roundStart,

  getRoundWinner as roundHasWinner,

} from "./round";



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
    players: [...g.players, { playerName: nextId, name }],
    scores: { ...g.scores, [nextId]: 0 },
  };
}

export function removePlayer(playerId: PlayerId, g: Game): Game {
  const players = g.players.filter(p => p.playerName !== playerId);
  if (players.length === g.players.length) return g;
  const { [playerId]: _drop, ...rest } = g.scores;
  const currentRound = g.currentRound //? roundRemovePlayer(g.currentRound, playerId) : undefined;

  const dealer =
    players.length === 0
      ? -1
      : g.dealer >= players.length
        ? players.length - 1
        : g.dealer;

  return { ...g, players, scores: rest as Record<PlayerId, number>, currentRound, dealer };
}




export function selectDealerBy(g: Game): Game {
  const { dealer } = g.players.reduce(
    (state, _player, index) => {
      const [card, nextDeck] = deal(state.deck);
      switch (card!.Type) {
        case Type.Skip:
        case Type.Reverse:
        case Type.Draw:
        case Type.Wild:
        case Type.WildDrawFour:
        case Type.Numbered:
          return card!.Points > state.bestScore
            ? { deck: nextDeck, bestScore: card!.Points, dealer: index }
            : { ...state, deck: nextDeck };
        case Type.Dummy:
        case Type.DummyDraw4:
          return { ...state, deck: nextDeck };
      }
    },
    {
      deck: DeckFactory.createNewDrawDeck(),
      bestScore: -Infinity,
      dealer: 0,
    }
  );

  return { ...g, dealer };
}



//advance dealer to next player
export function nextDealer(g: Game): Game {
  if (g.players.length === 0) return g;
  const dealer = g.dealer === -1 ? 0 : (g.dealer + 1) % g.players.length;
  return { ...g, dealer };
}

const chooseDealer = (g: Game): Game =>
  g.dealer === -1 ? selectDealerBy(g) : nextDealer(g);



export function createRound(g: Game): Game {
  if (g.players.length === 0) return g;

  //  decide dealer on the Game
  const withDealer = chooseDealer(g);
  const fullPlayers = g.players.map((ref) => playerFactory.createPlayer(ref.playerName, ref.name))

  //  start a round based on players + dealer
  const round = RoundFactory.createNewRound(fullPlayers, withDealer.dealer);

  return {
    ...withDealer,
    currentRound: round,
  };
}
export function calculatePoints(round: Round): number {

  const totalPoints = round.players.reduce((sum, player) => {
    const handPoints = player.hand?.reduce((pts, card) => {
      switch (card!.Type) {
        case Type.Skip:
        case Type.Reverse:
        case Type.Draw:
        case Type.Wild:
        case Type.WildDrawFour:
        case Type.Numbered:
          return pts + card!.Points;
        case Type.Dummy:
        case Type.DummyDraw4:
          return pts;
      }
    }, 0) ?? 0;
    return sum + handPoints;
  }, 0);
  return totalPoints;
}

export function roundFinished(g: Game): Game {
  const r = g.currentRound;
  if (!r || !roundHasWinner(r)) return g;

  const wId = roundHasWinner(r).winner?.playerName;
  const wName = roundHasWinner(r).winner?.name;
  if (wId === undefined || !wName) return g;

  //here we are missing calculate points function
  const pts = calculatePoints(r);
  const scores = { ...g.scores, [wId]: (g.scores[wId] ?? 0) + pts };
  const roundHistory = [...g.roundHistory, [wName, pts] as [string, number]];

  const winner = (Object.entries(scores) as Array<[string, number]>).reduce<
    PlayerId | undefined
  >(
    (currentWinner, [idStr, sc]) =>
      currentWinner !== undefined || sc < g.targetScore
        ? currentWinner
        : (Number(idStr) as PlayerId),
    g.winner
  );

  return { ...g, scores, roundHistory, winner };
}