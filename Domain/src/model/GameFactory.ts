// gameFactory.ts — constructors & policies
import type { Game } from "./Game";

export function newGame(id: number, targetScore = 500): Game {
  return {
    id,
    players: [],
    currentRound: undefined,
    targetScore,
    scores: {},
    dealer: -1,
    roundHistory: [],
    winner: undefined,
  };
}


