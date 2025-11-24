import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { promises as fs } from "fs";
import { WebSocketServer } from "ws";
import cors from "cors";

import { standardRandomizer } from "domain/src/utils/random_utils";
import { MemoryStore } from "./memoryStore";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useServer } from "graphql-ws/use/ws";
import { PubSub } from "graphql-subscriptions";
import { createGameAPI } from "./api";
import { create_Resolvers, toGraphQLGame } from "./resolvers";
import { Game } from "Domain/src/model/Game";

async function startServer(store: MemoryStore) {
  const pubsub: PubSub = new PubSub()
  const PENDING_GAMES_FEED = "pendingGamesFeed";
  const ACTIVE_GAMES_FEED = "activeGamesFeed";
  const broadcaster = {

    gameAdded(game: Game) {
      const topic = game.currentRound ? ACTIVE_GAMES_FEED : PENDING_GAMES_FEED;
      const graphqlGame = toGraphQLGame(game)
      pubsub.publish(topic, {
        [topic]: {
          action: 'ADDED',
          gameId: game.id,
          game: graphqlGame
        }
      });
    },

    gameUpdated(game: Game) {
      const topic = game.currentRound ? ACTIVE_GAMES_FEED : PENDING_GAMES_FEED;
      const graphqlGame = toGraphQLGame(game)
      pubsub.publish(topic, {
        [topic]: {
          action: 'UPDATED',
          gameId: game.id,
          game: graphqlGame
        }
      });
    },

    gameRemoved(gameId: number, from: 'pending' | 'active') {
      const topic = from === 'pending' ? PENDING_GAMES_FEED : ACTIVE_GAMES_FEED;
      pubsub.publish(topic, {
        [topic]: {
          action: 'REMOVED',
          gameId: gameId,
          game: null // The game object is null, as required
        }
      });
    }
  };

  const api = createGameAPI(broadcaster, store)

  try {
    const content = await fs.readFile("./UNO.sdl", "utf8");
    const typeDefs = `#graphql
        ${content}`;
    const resolvers = create_Resolvers(pubsub, api);
    const app = express();
    app.use("/graphql", bodyParser.json());

    app.use(
      cors({
        origin: /:\/\/localhost:/,
        methods: ["GET", "POST", "OPTIONS"],
      })
    );
    app.use("/graphql", (_, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      next();
    });

    const httpServer = http.createServer(app);

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const wsServer = new WebSocketServer({
      server: httpServer,
      path: "/graphql",
    });

    const subscriptionServer = useServer({ schema }, wsServer);

    const server = new ApolloServer({
      schema,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              drainServer: async () => subscriptionServer.dispose(),
            };
          },
        },
      ],
    });
    await server.start();
    app.use("/graphql", expressMiddleware(server));

    httpServer.listen({ port: 1337 }, () =>
      console.log(`GraphQL server ready on http://localhost:1337/graphql`)
    );
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

function configAndStart() {
  startServer(new MemoryStore());
}

configAndStart();
