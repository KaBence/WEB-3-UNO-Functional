import { Game } from "domain/src/model/Game";

export type StoreError = { type: 'Not Found', key: any } | { type: 'DB Error', error: any };
const not_found = (key: any): StoreError => ({ type: "Not Found", key });

export interface GameStore {
  getGame(id: number): Promise<Game>;
  getAllGames(): Promise<Game[]>;
  saveGame(game: Game): Promise<Game>;
  deleteGame(id: number): Promise<boolean>;
}


export class MemoryStore implements GameStore {
  private games = new Map<number, Game>();


  async getGame(id: number): Promise<Game> {
    const game = this.games.get(id);
    if (!game) throw not_found(id);
    return game;
  }


  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }


  async saveGame(game: Game): Promise<Game> {
    this.games.set(game.id, game);
    return game;
  }


  async deleteGame(id: number): Promise<boolean> {
    return this.games.delete(id);
  }
}
