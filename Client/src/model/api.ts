import { ApolloClient, gql, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client/core";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { subscriptionsRxJS } from "./rxjs";
import type { ActiveGamesFeed, PendingGamesFeed } from "./game";

const wsLink = new GraphQLWsLink(createClient({
    url: 'ws://localhost:1337/graphql',
}))

const httpLink = new HttpLink({
    uri: 'http://localhost:1337/graphql'
})

const splitLink = ApolloLink.split(
    ({ query }) => {
        const definition = getMainDefinition(query)
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        )
    },
    wsLink,
    httpLink,
)

const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache()
})

export async function ActiveGamesRXJS() {
    const subscriptionQuery = gql`
    subscription activeGamesFeed {
      activeGamesFeed {
        action
        game {
          currentRound {
            currentDirection
            currentPlayer
            drawDeckSize
            players {
              hand {
                Color
                CardNumber
                Type
              }
              name
              playerName
              unoCalled
            }
            statusMessage
            topCard {
              Color
              CardNumber
              Type
            }
            winner
          }
          dealer
          id
          players {
            name
            playerName
          }
          roundHistory
          scores
          winner
        }
        gameId
      }
    }
    `
    return subscriptionsRxJS<ActiveGamesFeed>(apolloClient, subscriptionQuery)
}

export async function PendingGamesRXJS() {
    const subscriptionQuery = gql`
    subscription pendingGamesFeed {
      pendingGamesFeed {
        action
        game {
          currentRound {
            currentDirection
            currentPlayer
            drawDeckSize
            players {
              hand {
                Color
                CardNumber
                Type
              }
              name
              playerName
              unoCalled
            }
            statusMessage
            topCard {
              Color
              CardNumber
              Type
            }
            winner
          }
          dealer
          id
          players {
            name
            playerName
          }
          roundHistory
          scores
          winner
        }
        gameId
      }
    }    
    `
    return subscriptionsRxJS<PendingGamesFeed>(apolloClient, subscriptionQuery)
}

export async function getPendingGames() {
    const query = gql`
        query PendingGames {
          pendingGames {
            currentRound {
              currentDirection
              currentPlayer
              drawDeckSize
              players {
                hand {
                  Color
                  CardNumber
                  Type
                }
                name
                playerName
                unoCalled
              }
              statusMessage
              topCard {
                Color
                CardNumber
                Type
              }
              winner
            }
            dealer
            id
            players {
              name
              playerName
            }
            roundHistory
            scores
            winner
          }
        }
  `;
    try {
        const { data } = await apolloClient.query({ query, fetchPolicy: "network-only", });
        return data.pendingGames;
    } catch (error: any) {
        console.error("Failed to get pending games:", error);
        throw error;
    }
}

export async function getActiveGames() {
    const query = gql`
    query ActiveGames {
      activeGames {
        currentRound {
          currentDirection
          currentPlayer
          drawDeckSize
          players {
            hand {
              Color
              CardNumber
              Type
            }
            name
            playerName
            unoCalled
          }
          statusMessage
          topCard {
            Color
            CardNumber
            Type
          }
          winner
        }
        dealer
        id
        players {
          name
          playerName
        }
        roundHistory
        scores
        winner
      }
    }
  `;
    try {
        const { data } = await apolloClient.query({ query, fetchPolicy: "network-only", });
        return data.activeGames;
    } catch (error: any) {
        console.error("Failed to get active games:", error);
        throw error;
    }
}

export async function createGame() {
    const mutation = gql`
    mutation createGame {
      createGame {
        winner
        scores
        roundHistory
        players {
          playerName
          name
        }
        id
        dealer
        currentRound {
          winner
          statusMessage
          drawDeckSize
          currentPlayer
          topCard {
            Type
            CardNumber
            Color
          }
          players {
            unoCalled
            playerName
            name
            hand {
              Type
              CardNumber
              Color
            }
          }
          currentDirection
        }
      }
    }
  `;
    try {
        const { data } = await apolloClient.mutate({ mutation, fetchPolicy: "network-only", });
        return data.createGame;
    } catch (error: any) {
        console.error("Failed to create game:", error);
        throw error;
    }
}

export async function joinGame(gameId: number, playerName: string) {
    const mutation = gql`
    mutation AddPlayer($gameId: Int!, $playerName: String!) {
      addPlayer(gameId: $gameId, playerName: $playerName) {
       winner
        scores
        roundHistory
        players {
          playerName
          name
        }
        id
        dealer
        currentRound {
          winner
          statusMessage
          drawDeckSize
          currentPlayer
          topCard {
            Type
            CardNumber
            Color
          }
          players {
            unoCalled
            playerName
            name
            hand {
              Type
              CardNumber
              Color
            }
          }
          currentDirection
        }  
      }
    }
    `;
    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId, playerName }, fetchPolicy: "network-only", });
        return data.addPlayer;
    } catch (error: any) {
        console.error("Failed to Join a Game:", error);
        throw error;
    }
}

export async function removePlayer(gameId: number, playerId: number) {
    const mutation = gql`
    mutation RemovePlayer($gameId: Int!, $playerId: Int!) {
      removePlayer(gameId: $gameId, playerId: $playerId) {
        winner
        scores
        roundHistory
        players {
          playerName
          name
        }
        id
        dealer
        currentRound {
          winner
          statusMessage
          drawDeckSize
          currentPlayer
          topCard {
            Type
            CardNumber
            Color
          }
          players {
            unoCalled
            playerName
            name
            hand {
              Type
              CardNumber
              Color
            }
          }
          currentDirection
        }  
      }
    }
  `;

    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId, playerId }, fetchPolicy: "network-only", });
        return data.removePlayer;
    } catch (error: any) {
        console.error("Failed to Remove a player:", error);
        throw error;
    }
}

export async function startRound(gameId: number) {
    const mutation = gql`
    mutation StartRound($gameId: Int!) {
      startRound(gameId: $gameId) {
        winner
        scores
        roundHistory
        players {
          playerName
          name
        }
        id
        dealer
        currentRound {
          winner
          statusMessage
          drawDeckSize
          currentPlayer
          topCard {
            Type
            CardNumber
            Color
          }
          players {
            unoCalled
            playerName
            name
            hand {
              Type
              CardNumber
              Color
            }
          }
          currentDirection
        }  
      }
    }
  `;

    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId }, fetchPolicy: "network-only", });
        return data.startRound;
    } catch (error: any) {
        console.error("Failed to Start Round:", error);
        throw error;
    }
}

export async function changeWildCardColor(gameId: number, chosenColor: string) {
    const mutation = gql`
    mutation ChangeWildCardColor($gameId: Int!, $chosenColor: String!) {
      changeWildCardColor(gameId: $gameId, chosenColor: $chosenColor) {
       winner
        scores
        roundHistory
        players {
          playerName
          name
        }
        id
        dealer
        currentRound {
          winner
          statusMessage
          drawDeckSize
          currentPlayer
          topCard {
            Type
            CardNumber
            Color
          }
          players {
            unoCalled
            playerName
            name
            hand {
              Type
              CardNumber
              Color
            }
          }
          currentDirection
        }    
      }
    }
`
    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId, chosenColor }, fetchPolicy: "network-only", });
        return data.changeWildCardColor;
    } catch (error: any) {
        console.error("Failed to change Wild Card Color:", error);
        throw error;
    }
}

export async function drawCard(gameId: number) {
    const mutation = gql`
    mutation DrawCard($gameId: Int!) {
      drawCard(gameId: $gameId) {
        winner
        scores
        roundHistory
        players {
          playerName
          name
        }
        id
        dealer
        currentRound {
          winner
          statusMessage
          drawDeckSize
          currentPlayer
          topCard {
            Type
            CardNumber
            Color
          }
          players {
            unoCalled
            playerName
            name
            hand {
              Type
              CardNumber
              Color
            }
          }
          currentDirection
        }  
      }
    }    
`
    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId }, fetchPolicy: "network-only", });
        return data.drawCard;
    } catch (error: any) {
        console.error("Failed to Start Round:", error);
        throw error;
    }
}

export async function play(gameId: number, cardId: number, chosenColor?: string) {
    const mutation = gql`
    mutation PlayCard($gameId: Int!, $cardId: Int!, $chosenColor: String) {
      playCard(gameId: $gameId, cardId: $cardId, chosenColor: $chosenColor) {
        winner
        scores
        roundHistory
        players {
          playerName
          name
        }
        id
        dealer
        currentRound {
          winner
          statusMessage
          drawDeckSize
          currentPlayer
          topCard {
            Type
            CardNumber
            Color
          }
          players {
            unoCalled
            playerName
            name
            hand {
              Type
              CardNumber
              Color
            }
          }
          currentDirection
        }
      }
    }
  `;
    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId, cardId, chosenColor }, fetchPolicy: "network-only", });

        return data.playCard;
    } catch (error: any) {
        console.error("Failed to play:", error);
        throw error;
    }
}

export async function canPlay(gameId: number, cardId: number) {
    const mutation = gql`
        mutation CanPlay($gameId: Int!, $cardId: Int!) {
          canPlay(gameId: $gameId, cardId: $cardId)
        }
  `;
    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId, cardId }, fetchPolicy: "network-only", });
        return data.canPlay;
    } catch (error: any) {
        console.error("Failed when checking if can play:", error);
        throw error;
    }
}

export async function sayUno(gameId: number, playerId: number) {
    const mutation = gql`
    mutation UnoCall($gameId: Int!, $playerId: Int!) {
      unoCall(gameId: $gameId, playerId: $playerId) {
        winner
        scores
        roundHistory
        players {
          playerName
          name
        }
        id
        dealer
        currentRound {
          winner
          statusMessage
          drawDeckSize
          currentPlayer
          topCard {
            Type
            CardNumber
            Color
          }
          players {
            unoCalled
            playerName
            name
            hand {
              Type
              CardNumber
              Color
            }
          }
          currentDirection
        }    
      }
    }
`
    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId, playerId }, fetchPolicy: "network-only", });
        return data.unoCall;
    } catch (error: any) {
        console.error("Failed to Say UNO:", error);
        throw error;
    }
}

export async function accuseUno(gameId: number, accuser: number, accused: number) {
    const mutation = gql`
    mutation AccuseUno($gameId: Int!, $accuser: Int!, $accused: Int!) {
      accuseUno(gameId: $gameId, accuser: $accuser, accused: $accused) {
        winner
        scores
        roundHistory
        players {
          playerName
          name
        }
        id
        dealer
        currentRound {
          winner
          statusMessage
          drawDeckSize
          currentPlayer
          topCard {
            Type
            CardNumber
            Color
          }
          players {
            unoCalled
            playerName
            name
            hand {
              Type
              CardNumber
              Color
            }
          }
          currentDirection
        }    
      }
    }
  `
    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId, accuser, accused }, fetchPolicy: "network-only", });
        return data.accuseUno;
    } catch (error: any) {
        console.error("Failed to accuse UNO:", error);
        throw error;
    }
}

export async function challengeDraw4(gameId: number, response: boolean) {
    const mutation = gql`
  mutation ChallengeDraw4($gameId: Int!, $response: Boolean!) {
    challengeDraw4(gameId: $gameId, response: $response)
  }
  `;
    try {
        const { data } = await apolloClient.mutate({ mutation, variables: { gameId, response }, fetchPolicy: "network-only", });
        return data.challengeDraw4;
    } catch (error: any) {
        console.error("Failed to execute challenge draw 4:", error);
        throw error;
    }
}
