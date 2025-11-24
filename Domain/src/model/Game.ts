
import type { Round } from "./Round";
import * as RoundFactory from "./RoundFactory";
import * as deck from "./Deck"
import * as DeckFactory from "./DeckFactory";
import type { PlayerNames, PlayerRef } from "./Player";
import * as playerFactory from "./PlayerFactory"
import { Type } from "./Card";
import { getRoundWinner as roundHasWinner, } from "./Round";



export type Game = {
  readonly id: number;
  readonly players: PlayerRef[];
  readonly currentRound?: Round;
  readonly targetScore: number;
  readonly scores: Record<number, number>;
  readonly dealer: number;
  readonly roundHistory: [string, number][];
  readonly winner?: PlayerNames;
};

export function addPlayer(name: string, g: Game): Game {
  const nextId = g.players.length + 1;
  return {
    ...g,
    players: [...g.players, { playerName: nextId, name }],
    scores: { ...g.scores, [nextId]: 0 },
  };
}

export function removePlayer(playerId: PlayerNames, g: Game): Game {
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

  return { ...g, players, scores: rest as Record<PlayerNames, number>, currentRound, dealer };
}




export function selectDealerBy(g: Game): Game {
  let drawPile = DeckFactory.createNewDrawDeck();
  let playersWithCards = g.players.map((ref) => playerFactory.createPlayer(ref.playerName, ref.name))

  let bestPlayer = 0;
  let bestScore = 0;

  for (let idx = 0; idx < playersWithCards.length; idx++) {
    const [dealtCard, nextDeck] = deck.deal(drawPile);
    drawPile = nextDeck;
    switch (dealtCard!.Type) {
      case Type.Skip:
      case Type.Reverse:
      case Type.Draw:
      case Type.Wild:
      case Type.WildDrawFour:
      case Type.Numbered:
        if (dealtCard!.Points > bestScore) {
          bestPlayer = idx
        }
        break;
      case Type.Dummy:
      case Type.DummyDraw4:
        throw new Error("Problem during selectDealerBy in Game")
    }
  }

  return { ...g, dealer: bestPlayer }

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

function calculatePoints(round: Round): number {
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

  const wId = roundHasWinner(r).winner;
  const wName = g.players.filter(p => p.playerName !== wId)[0].name
  if (wId === undefined || !wName) return g;

  //here we are missing calculate points function
  const pts = calculatePoints(r);
  const scores = { ...g.scores, [wId]: (g.scores[wId] ?? 0) + pts };
  const roundHistory = [...g.roundHistory, [wName, pts] as [string, number]];

  const winner = (Object.entries(scores) as Array<[string, number]>).reduce<
    PlayerNames | undefined
  >(
    (currentWinner, [idStr, sc]) =>
      currentWinner !== undefined || sc < g.targetScore
        ? currentWinner
        : (Number(idStr) as PlayerNames),
    g.winner
  );

  return { ...g, scores, roundHistory, winner };
}