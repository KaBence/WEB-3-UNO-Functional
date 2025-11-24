import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { State, Dispatch as AppDispatch } from "../stores/store";
import type { GameSpecs } from "../model/game";
import { addPlayerThunk } from "../thunks/AddPlayerThunk";
import { removePlayerThunk } from "../thunks/RemovePlayerThunk";
import { startRoundThunk } from "../thunks/StartRoundThunk";
import { createGameThunk } from "../thunks/CreateGameThunk";
import "./Lobby.css";

const Lobby: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();


  const playerName = useSelector((s: State) => s.player.player) ?? "Player";


  const pendingGames = useSelector((s: State) => s.pending_games ?? []) as GameSpecs[];

  const activeGames = useSelector((s: State) => s.active_games ?? []) as GameSpecs[];

  const [joinedGameId, setJoinedGameId] = useState<number | undefined>(undefined);
  const [hasCreatedGame, setHasCreatedGame] = useState<boolean>(false);

  
  const nameFirstLetter = playerName?.[0] ?? "P";

  const visibleGames = useMemo(
    () => (pendingGames ?? []).filter((g) => !g.currentRound),
    [pendingGames]
  );

  const myPendingGame = useMemo(
    () => visibleGames.find((g) => g.players?.some((p) => p.name === playerName)),
    [visibleGames, playerName]
  );

  const myActiveGame = useMemo(
    () => activeGames.find((g) => g.players?.some((p) => p.name === playerName)),
    [activeGames, playerName]
  );

  useEffect(() => {
    if (myPendingGame) {
      setJoinedGameId(myPendingGame.id);
    } else if (myActiveGame) {
      setJoinedGameId(myActiveGame.id);
    } else {
      setJoinedGameId(undefined);
    }
  }, [myPendingGame, myActiveGame]);


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

  const joinGame = useCallback(
    async (gameId: number) => {
     
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

     
      if (getPlayerCount(gameId) >= 10) {
        window.alert("This game is full (10 players).");
        return;
      }

      try {
        await dispatch(addPlayerThunk(gameId, playerName));
        setJoinedGameId(gameId);
      } catch (err) {
        console.error("Failed to join game", err);
        window.alert("Failed to join game.");
      }
    },
    [dispatch, joinedGameId, hasCreatedGame, getPlayerCount, playerName]
  );

  const leaveGame = useCallback(
    async (gameId: number) => {
      const game = getPendingGame(gameId);
      if (!game) {
        console.error(`Could not find game ${gameId} to leave.`);
        return;
      }

      const me = game.players?.find((p) => p.name === playerName);
      const playerId = me?.playerName;
      if (playerId === undefined) {
        console.error(`Could not find player ${playerName} in game ${gameId}.`);
        return;
      }

      try {
        await dispatch(removePlayerThunk(gameId, Number(playerId)));
        setJoinedGameId(undefined);
        setHasCreatedGame(false);
        console.log("Left game", gameId);
      } catch (err) {
        console.error("Failed to leave game", err);
      }
    },
    [dispatch, getPendingGame, playerName]
  );

  const createGame = useCallback(async () => {
    if (joinedGameId !== undefined) {
      window.alert("You are already in a game. Leave it before creating a new one.");
      console.log("Blocked create: already in game", joinedGameId);
      return;
    }

    try {
      const newGame = await dispatch(createGameThunk());
      if (!newGame) return;
      const gameId = newGame.id;
      await joinGame(gameId);
      setHasCreatedGame(true);
      setJoinedGameId(gameId);
      console.log("Created game", gameId);
    } catch (err) {
      console.error("Failed to create game", err);
      window.alert("Failed to create a new game.");
    }
  }, [dispatch, joinGame, joinedGameId]);

  const startGame = useCallback(
    async (gameId: number) => {
      const count = getPlayerCount(gameId);
      if (count < 2) {
        window.alert("You need at least two players to start the game");
        console.log("Blocked start: players =", count);
        return;
      }
      try {
        //TODO  here it crashes
        await dispatch(startRoundThunk(gameId));
        navigate(`/game/${gameId}`);
        console.log("Starting game", gameId);
      } catch (err) {
        console.error("Failed to start game", err);
        window.alert("Failed to start the game.");
      }
    },
    [dispatch, getPlayerCount, navigate]
  );

  // === Effect: watch pending game for player's game id; if game becomes active navigate to /Game?id=...
  useEffect(() => {
    if (myActiveGame) {
      navigate(`/game/${myActiveGame.id}`);
    }
  }, [myActiveGame, navigate]);

  return (
    <div className="lobby-wrapper">
      <div className="lobby-card">
        <div className="lobby-topbar">
          <div className="avatar small">{nameFirstLetter}</div>
          <div className="who">
            <div className="label">You are {playerName}</div>
            <div className="status">Online</div>
          </div>
        </div>

        <div className="lobby-grid">
          <aside className="lobby-profile">
            <div className="avatar large">{nameFirstLetter}</div>
            <div className="name">{playerName}</div>
            <div className="status pill">Online</div>
          </aside>

          <section className="lobby-games">
            <div className="games-header">
              <h3>Games</h3>
              <span className="games-subtitle">Join or create a lobby to start playing.</span>
            </div>
            <ul className="lobby-game-list">
              {visibleGames.map((g) => (
                <li className="lobby-game-item" key={g.id}>
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

        <div className="lobby-actions">
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
