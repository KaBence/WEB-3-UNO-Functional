// gameFactory.ts — constructors & policies
import type { Game } from "./Game";
import { PlayerNames } from "./Player";

export function newGame(id: number, targetScore = 500): Game {
  return {
    id,
    players: [],
    currentRound: undefined,
    targetScore,
    scores: Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [i + 1 as PlayerNames, 0])
    ) as Record<PlayerNames, number>,
    dealer: -1,
    roundHistory: [],
    winner: undefined,
  };
}


