import { PubSub } from "graphql-subscriptions";
import { GameAPI } from "./api";

export const create_Resolvers = (pubsub: PubSub, api: GameAPI) => {
  return {
    Query: {
      activeGames: async () => {
        return await api.getActiveGames();
      },
      pendingGames: async () => {
        return await api.getPendingGames();
      },
    },
    Mutation: {
      createGame: async () => {
        return await api.createGame();
      },
      addPlayer: async (
        _: any,
        { gameId, playerName }: { gameId: number; playerName: string }
      ) => {
        return await api.addPlayer(gameId, playerName);
      },
      removePlayer: async (
        _: any,
        { gameId, playerId }: { gameId: number; playerId: number }
      ) => {
        return await api.removePlayer(gameId, playerId);
      },
      startRound: async (_: any, { gameId }: { gameId: string }) => {
        return await api.startRound(parseInt(gameId));
      },
      playCard: async (
        _: any,
        { gameId, cardId, chosenColor }: { gameId: number; cardId: number; chosenColor: string }
      ) => {
        return await api.playCard(gameId, cardId, chosenColor);
      },
      drawCard: async (_: any, { gameId }: { gameId: string }) => {
        return await api.drawCard(parseInt(gameId));
      },
      unoCall: async (_: any, { gameId, playerId }: { gameId: number; playerId: number }) => {
        return await api.unoCall(gameId, playerId);
      },
      accuseUno: async (
        _: any,
        { gameId, accuser, accused }: { gameId: number; accuser: number; accused: number }
      ) => {
        return await api.accuseUno(gameId, accuser, accused);
      },
      challengeDraw4: async (_: any, { gameId, response }: { gameId: number; response: boolean }) => {
        return await api.challengeDraw4(gameId, response);
      },
      canPlay: async (_: any, { gameId, cardId }: { gameId: number, cardId: number }) => {
        return await api.canPlay(gameId, cardId)
      },
      changeWildCardColor: async (
        _: any,
        { gameId, chosenColor }: { gameId: number; chosenColor: string }
      ) => {
        return await api.changeWildCardColor(gameId, chosenColor);
      },
    },
    Subscription: {
      pendingGamesFeed: {
        subscribe: () => pubsub.asyncIterableIterator(['pendingGamesFeed'])
      },

      activeGamesFeed: {
        subscribe: () => pubsub.asyncIterableIterator(['activeGamesFeed'])
      }
    }
  }
}
