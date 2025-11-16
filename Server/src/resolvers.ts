import { PubSub } from "graphql-subscriptions";
// import { GameAPI } from "./api";

export const create_Resolvers = () => {
  return {
    Query: {
      activeGames: async () => {
        // return await this.api.getActiveGames();
      },
      pendingGames: async () => {
        // return await this.api.getPendingGames();
      },
    },
    Mutation: {
      createGame: async () => {
        // return await this.api.createGame();
      },
      addPlayer: async (
        _: any,
        { gameId, playerName }: { gameId: number; playerName: string }
      ) => {
        // return this.api.addPlayer(gameId, playerName);
      },
      removePlayer: async (
        _: any,
        { gameId, playerId }: { gameId: number; playerId: number }
      ) => {
        // return this.api.removePlayer(gameId, playerId);
      },
      startRound: async (_: any, { gameId }: { gameId: string }) => {
        // return await this.api.startRound(parseInt(gameId));
      },
      playCard: async (
        _: any,
        { gameId, cardId, chosenColor }: { gameId: number; cardId: number; chosenColor: string }
      ) => {
        // return this.api.playCard(gameId, cardId, chosenColor);
      },
      drawCard: async (_: any, { gameId }: { gameId: string }) => {
        // return await this.api.drawCard(parseInt(gameId));
      },
      unoCall: async (_: any, { gameId, playerId }: { gameId: number; playerId: number }) => {
        // return await this.api.unoCall(gameId, playerId);
      },
      accuseUno: async (
        _: any,
        { gameId, accuser, accused }: { gameId: number; accuser: number; accused: number }
      ) => {
        // return this.api.accuseUno(gameId, accuser, accused);
      },
      challengeDraw4: async (_: any, { gameId, response }: { gameId: number; response: boolean }) => {
        // return this.api.challengeDraw4(gameId, response);
      },
      canPlay: async (_: any, { gameId, cardId }: { gameId: number, cardId: number }) => {
        // return this.api.canPlay(gameId,cardId)
      },
      changeWildCardColor: async (
        _: any,
        { gameId, chosenColor }: { gameId: number; chosenColor: string }
      ) => {
        // return this.api.changeWildCardColor(gameId, chosenColor);
      },
    },
    Subscription: {
      pendingGamesFeed: {
        // subscribe: () => this.pubsub.asyncIterableIterator(['pendingGamesFeed'])
      },

      activeGamesFeed: {
        // subscribe: () => this.pubsub.asyncIterableIterator(['activeGamesFeed'])
      }
    }
  }





}
