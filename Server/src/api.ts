import type { Game } from "Domain/src/model/Game";
import { GameStore,ServerModel } from "./serverModel";

interface Broadcaster {
  gameAdded(game: Game): void;
  gameUpdated(game: Game): void;
  gameRemoved(gameId: number, from: "pending" | "active"): void;
}

export type GameAPI = {
  getPendingGames(): Promise<Game[]>;
  getActiveGames(): Promise<Game[]>;
  createGame(): Promise<Game>;
  addPlayer(gameId: number, playerName: string): Promise<Game>;
  removePlayer(gameId: number, playerId: number): Promise<Game | undefined>;
  startRound(gameId: number): Promise<Game>;
  playCard(gameId: number, cardId: number, chosenColor?: string): Promise<Game>;
  drawCard(gameId: number): Promise<Game>;
  unoCall(gameId: number, playerId: number): Promise<Game>;
  accuseUno(gameId: number, accuser: number, accused: number): Promise<Game>;
  challengeDraw4(gameId: number, response: boolean): Promise<boolean>;
  canPlay(gameId: number, cardId: number): Promise<boolean>;
  changeWildCardColor(gameId: number, chosenColor: string): Promise<Game>;
};

export function createGameAPI(broadcaster: Broadcaster, server: GameStore): GameAPI {
 

  async function getPendingGames(): Promise<Game[]> {
    return await server.all_pending_games();
  }

  async function getActiveGames(): Promise<Game[]> {
    return await server.all_active_games();
  }

  async function createGame(): Promise<Game> {
    const game = await server.createGame();
    broadcaster.gameAdded(game);
    return game;
  }

  async function addPlayer(gameId: number, playerName: string): Promise<Game> {
    const game = await server.addPlayer(gameId, playerName);
    broadcaster.gameUpdated(game);
    return game;
  }

  async function removePlayer(gameId: number, playerId: number): Promise<Game | undefined> {
    const before = await server.getGame(gameId);
    if (!before) return undefined;
    const wasPending = !before.currentRound;

    const updated = await server.removePlayer(gameId, playerId);
    if (updated === undefined) {
      broadcaster.gameRemoved(gameId, wasPending ? "pending" : "active");
      return undefined;
    }
    broadcaster.gameUpdated(updated);
    return updated;
  }

  async function startRound(gameId: number): Promise<Game> {
    const game = await server.startRound(gameId);
    broadcaster.gameAdded(game);
    broadcaster.gameRemoved(gameId, "pending");
    return game;
  }

  async function playCard(gameId: number, cardId: number, chosenColor?: string): Promise<Game> {
    const game = await server.play(gameId, cardId, chosenColor);
    broadcaster.gameUpdated(game);
    return game;
  }

  async function drawCard(gameId: number): Promise<Game> {
    const game = await server.drawCard(gameId);
    broadcaster.gameUpdated(game);
    return game;
  }

  async function unoCall(gameId: number, playerId: number): Promise<Game> {
    const game = await server.sayUno(gameId, playerId);
    broadcaster.gameUpdated(game);
    return game;
  }

  async function accuseUno(gameId: number, accuser: number, accused: number): Promise<Game> {
    const game = await server.accuseUno(gameId, accuser, accused);
    broadcaster.gameUpdated(game);
    return game;
  }

  async function challengeDraw4(gameId: number, response: boolean): Promise<boolean> {
    const { result, game } = await server.challangeDrawFour(gameId, response);
    broadcaster.gameUpdated(game);
    return result;
  }

  async function canPlay(gameId: number, cardId: number): Promise<boolean> {
    return await server.canPlay(gameId, cardId);
  }

  async function changeWildCardColor(gameId: number, chosenColor: string): Promise<Game> {
    const game = await server.changeWildCardColor(gameId, chosenColor);
    broadcaster.gameUpdated(game);
    return game;
  }

  return {
    getPendingGames,
    getActiveGames,
    createGame,
    addPlayer,
    removePlayer,
    startRound,
    playCard,
    drawCard,
    unoCall,
    accuseUno,
    challengeDraw4,
    canPlay,
    changeWildCardColor,
  };
}
