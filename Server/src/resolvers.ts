import { PubSub } from "graphql-subscriptions";
import { GameAPI } from "./api";
import { Game } from "Domain/src/model/Game";
import * as Round from "domain/src/model/Round"

type Round = Round.Round

export function toGraphQLRound(round?:Round){
  if(!round) return undefined
  return {
    players: round.players,
    currentDirection: round.currentDirection,
    currentPlayer: round.currentPlayer,
    drawDeckSize: round.drawPile.cards.length,
    topCard: Round.getTopCard(round),
    statusMessage: round.statusMessage,
    winner: round.winner
  }
}

export function toGraphQLGame(Game:Game){
 return{
    id: Game.id,
    players: Game.players,
    currentRound: toGraphQLRound(Game.currentRound),
    scores: Game.scores,
    dealer: Game.dealer,
    roundHistory: Game.roundHistory,
    winner: Game.winner
 }
}

export const create_Resolvers = (pubsub: PubSub, api: GameAPI) => {
  return {
    Query: {
      activeGames: async () => {
        return (await api.getActiveGames()).map(g => toGraphQLGame(g));
      },
      pendingGames: async () => {
        return (await api.getPendingGames()).map(g => toGraphQLGame(g));
      },
    },
    Mutation: {
      createGame: async () => {
        return toGraphQLGame(await api.createGame());
      },
      addPlayer: async (
        _: any,
        { gameId, playerName }: { gameId: number; playerName: string }
      ) => {
        return toGraphQLGame(await api.addPlayer(gameId, playerName));
      },
      removePlayer: async (
        _: any,
        { gameId, playerId }: { gameId: number; playerId: number }
      ) => {
        const game = await api.removePlayer(gameId, playerId);
        if (game)
          return toGraphQLGame(game)
        return undefined
      },
      startRound: async (_: any, { gameId }: { gameId: string }) => {
        return toGraphQLGame(await api.startRound(parseInt(gameId)));
      },
      playCard: async (
        _: any,
        { gameId, cardId, chosenColor }: { gameId: number; cardId: number; chosenColor: string }
      ) => {
        return toGraphQLGame(await api.playCard(gameId, cardId, chosenColor));
      },
      drawCard: async (_: any, { gameId }: { gameId: string }) => {
        return toGraphQLGame(await api.drawCard(parseInt(gameId)));
      },
      unoCall: async (_: any, { gameId, playerId }: { gameId: number; playerId: number }) => {
        return toGraphQLGame(await api.unoCall(gameId, playerId));
      },
      accuseUno: async (
        _: any,
        { gameId, accuser, accused }: { gameId: number; accuser: number; accused: number }
      ) => {
        return toGraphQLGame(await api.accuseUno(gameId, accuser, accused));
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
        return toGraphQLGame(await api.changeWildCardColor(gameId, chosenColor));
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
