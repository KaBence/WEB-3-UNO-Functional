import type { Game } from "Domain/src/model/Game";
import { ServerModel, GameStore } from "./serverModel";

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

export function createGameAPI(broadcaster: Broadcaster, store: GameStore): GameAPI {
 
    

    
  async function getPendingGames(): Promise<Game[]> {
    return await ServerModel.all_pending_games();
  }

  async function getActiveGames(): Promise<Game[]> {
    return await ServerModel.all_active_games();

  }

  async function createGame(): Promise<Game> {
    const id  = getPendingGames.length + getActiveGames.length + 3; //very interesting mathematics 
    const game =  ServerModel.createGame(id);
    const created = await store.add_pending(game);
    broadcaster.gameAdded(game);
    return created;
  }

  async function update(gameId: number, processor: (game: Game) => Game | Promise<Game>): Promise<Game> {
    const current =  ServerModel.getGame(gameId);
    if (!current) throw new Error(`Game ${gameId} not found`);
    const next = await processor(current);
    await store.update(gameId, () => next);
    return next;
  }

  async function addPlayer(  gameId: number, playerName: string): Promise<Game | undefined> {
    const updated = await update(gameId, (g) => ServerModel.addPlayer(playerName ,g));
    broadcaster.gameUpdated(updated);
    return updated;
  }

  async function removePlayer(gameId: number, playerId: number): Promise<Game | undefined> {
    const before = await ServerModel.getGame(gameId);
    if (!before) return undefined;
    const wasPending = !before.currentRound;

    const next = await ServerModel.removePlayer( playerId, before);
    if (next === undefined) {
      await store.delete(gameId);
      broadcaster.gameRemoved(gameId, wasPending ? "pending" : "active");
      return undefined;
    }
    await store.update(gameId, () => next);
    broadcaster.gameUpdated(next);
    return next;
  }

  async function startRound(gameId: number): Promise<Game> {
    const updated = await update(gameId, (g) => ServerModel.startRound(g));
    broadcaster.gameAdded(updated);
    broadcaster.gameRemoved(gameId, "pending");
    return updated;
  }

  async function playCard(gameId: number, cardId: number, chosenColor?: string): Promise<Game> {
    const updated = await update(gameId, (g) => ServerModel.play( cardId, chosenColor, g));
    broadcaster.gameUpdated(updated);
    return updated;
  }

  async function drawCard(gameId: number): Promise<Game> {
    const updated = await update(gameId, (g) => ServerModel.drawCard(g));
    broadcaster.gameUpdated(updated);
    return updated;
  }

  async function unoCall(gameId: number, playerId: number): Promise<Game> {
    const updated = await update(gameId, (g) => ServerModel.sayUno( playerId, g));
    broadcaster.gameUpdated(updated);
    return updated;
  }

  async function accuseUno(gameId: number, accuser: number, accused: number): Promise<Game> {
    const updated = await update(gameId, (g) => ServerModel.accuseUno( accuser, accused, g));
    broadcaster.gameUpdated(updated);
    return updated;
  }

  async function challengeDraw4(gameId: number, response: boolean): Promise<boolean> {
    const current = await ServerModel.getGame(gameId);
    if (!current) return false;
    const { result, game } = await ServerModel.challangeDrawFour( response, current);
    await store.update(gameId, () => game);
    broadcaster.gameUpdated(game);
    return result;
  }

  async function canPlay(gameId: number, cardId: number): Promise<boolean> {
    const current = await ServerModel.getGame(gameId);
    if (!current) return false;
    return await ServerModel.canPlay( cardId, current);
  }

  async function changeWildCardColor(gameId: number, chosenColor: string): Promise<Game> {
    const updated = await update(gameId, (g) => ServerModel.changeWildCardColor(g, chosenColor));
    broadcaster.gameUpdated(updated);
    return updated;
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
