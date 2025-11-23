import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "@/stores/store"; // adjust path to your store types
import * as api from "@/model/api"; // adjust import path to your api module
import "./Lobby.css";

/**
 * Types - adjust if your domain model differs
 */
type PlayerInGame = {
  playerName: string; // unique id for player in the game
  name: string; // display name
};

type Game = {
  id: number;
  players?: PlayerInGame[];
};

const Lobby: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // ==== SELECTORS / STORE (adjust keys to match your redux slices) ====
  // Player name & playerGameId (which game the player is "in")
  const playerName = useSelector((s: RootState) => s.player.player) ?? "Player";
  const playerGameId = useSelector((s: RootState) => s.player.playerGameId) as number | undefined;

  // Pending games (list of lobby games)
  const pendingGames = useSelector((s: RootState) => (s.pending_games ? s.pending_games : [])) as Game[];

  // Active / ongoing games (used to navigate if a game becomes active)
  const activeGames = useSelector((s: RootState) => (s.active_games ? s.active_games : [])) as Game[];

  // ==== LOCAL UI STATE ====
  const [joinedGameId, setJoinedGameId] = useState<number | undefined>(undefined);
  const [hasCreatedGame, setHasCreatedGame] = useState<boolean>(false);

  // first letter avatar
  const nameFirstLetter = playerName?.[0] ?? "P";

  // visibleGames corresponds to Vue's computed visibleGames = pendingGamesStore.games
  const visibleGames = pendingGames ?? [];

  // helper to get a game by id from pendingGames, or undefined
  const getPendingGame = useCallback(
    (id?: number) => visibleGames.find((g) => g.id === id),
    [visibleGames]
  );

  const getPlayerCount = useCallback(
    (gameId: number) => {
      const game = getPendingGame(gameId);
      return game?.players?.length ?? 0;
    },
    [getPendingGame]
  );

  // ===== Handlers =====
  const joinGame = useCallback(
    async (gameId: number) => {
      // local guards
      if (joinedGameId === gameId) {
        setJoinedGameId(undefined);
        return;
      }
      if (joinedGameId !== undefined) {
        window.alert("Already in a game. Leave current game first.");
        console.log("Already in a game. Leave current game first.");
        return;
      }
      if (hasCreatedGame) {
        window.alert("You created a game. Leave it first.");
        console.log("You created a game. Leave it first.");
        return;
      }

      // capacity guard
      if (getPlayerCount(gameId) >= 10) {
        window.alert("This game is full (10 players).");
        return;
      }

      try {
        await api.joinGame(gameId, playerName);
        // if you have a redux action to refresh the player or games, dispatch it here:
        // dispatch(fetchPendingGamesThunk()) or similar
        console.log("Joining game", gameId);
        setJoinedGameId(gameId);
      } catch (err) {
        console.error("Failed to join game", err);
        window.alert("Failed to join game.");
      }
    },
    [joinedGameId, hasCreatedGame, getPlayerCount, playerName]
  );

  const leaveGame = useCallback(
    async (gameId: number) => {
      const game = getPendingGame(gameId);
      if (!game) {
        console.error(`Could not find game ${gameId} to leave.`);
        return;
      }

      const me = game.players?.find((p) => p.name === playerName);
      if (!me) {
        console.error(`Could not find player ${playerName} in game ${gameId}.`);
        return;
      }

      const myPlayerId = me.playerName;
      try {
        await api.removePlayer(gameId, myPlayerId);
        // optionally dispatch store updates here
        setJoinedGameId(undefined);
        setHasCreatedGame(false);
        // optionally reset player game id in store
        console.log("Left game", gameId);
      } catch (err) {
        console.error("Failed to leave game", err);
      }
    },
    [getPendingGame, playerName]
  );

  const createGame = useCallback(async () => {
    if (joinedGameId !== undefined) {
      window.alert("You are already in a game. Leave it before creating a new one.");
      console.log("Blocked create: already in game", joinedGameId);
      return;
    }

    try {
      const newGame = await api.createGame();
      const gameId = newGame.id;
      // join the newly created game
      await joinGame(gameId);
      setHasCreatedGame(true);
      setJoinedGameId(gameId);
      console.log("Created game", gameId);
    } catch (err) {
      console.error("Failed to create game", err);
      window.alert("Failed to create a new game.");
    }
  }, [joinedGameId, joinGame]);

  const startGame = useCallback(
    async (gameId: number) => {
      const count = getPlayerCount(gameId);
      if (count < 2) {
        window.alert("You need at least two players to start the game");
        console.log("Blocked start: players =", count);
        return;
      }
      try {
        await api.startRound(gameId);
        // optionally refresh game lists / navigate to game view if the API activates the game
        console.log("Starting game", gameId);
      } catch (err) {
        console.error("Failed to start game", err);
        window.alert("Failed to start the game.");
      }
    },
    [getPlayerCount]
  );

  // === Effect: watch pending game for player's game id; if game becomes active navigate to /Game?id=...
  useEffect(() => {
    // If the playerGameId is set and the pending game is gone, check activeGames and navigate
    if (playerGameId !== undefined) {
      const pending = getPendingGame(playerGameId);
      if (!pending) {
        // look for an active game with this id
        const active = activeGames.find((g) => g.id === playerGameId);
        if (active) {
          navigate(`/Game?id=${playerGameId}`);
        } else {
          // if neither pending nor active, keep them in lobby (or navigate explicitly)
          navigate("/lobby", { replace: true });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerGameId, visibleGames, activeGames]);

  // visibleGames memo (optional)
  const gamesList = useMemo(() => visibleGames, [visibleGames]);

  return (
    <div className="lobby-wrapper">
      <div className="card">
        <div className="topbar">
          <div className="avatar small">{nameFirstLetter}</div>
          <div className="who">
            <div className="label">You are {playerName}</div>
            <div className="status">Online</div>
          </div>
        </div>

        <div className="grid">
          <aside className="profile">
            <div className="avatar large">{nameFirstLetter}</div>
            <div className="name">{playerName}</div>
            <div className="status pill">Online</div>
          </aside>

          <section className="games">
            <h3>
              <b>Games</b>
            </h3>
            <ul className="game-list">
              {gamesList.map((g) => (
                <li className="game-item" key={g.id}>
                  <div className="meta">
                    <div className="title">Game {g.id}</div>
                    <div className="sub">
                      {(!g.players || g.players.length === 0) && <span>No players yet</span>}
                      {g.players && g.players.length > 0 && (
                        <>
                          {g.players.map((p) => (
                            <span className="player-chip" key={p.playerName}>
                              {p.name}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="buttons-holder">
                    {joinedGameId !== g.id && (
                      <button
                        className="btn-join"
                        type="button"
                        onClick={() => joinGame(g.id)}
                      >
                        Join
                      </button>
                    )}

                    {joinedGameId === g.id && (
                      <button className="btn-leave" type="button" onClick={() => leaveGame(g.id)}>
                        Leave
                      </button>
                    )}

                    {joinedGameId === g.id && (
                      <button
                        className="btn-start-game"
                        type="button"
                        onClick={() => startGame(g.id)}
                      >
                        Start Game
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="actions">
          <button
            className="btn-create"
            type="button"
            onClick={createGame}
            disabled={joinedGameId !== undefined}
            // show the button only if hasn't created a game yet (mirrors v-if="hasCreatedGame == false")
            style={{ display: hasCreatedGame ? "none" : undefined }}
          >
            Create New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
