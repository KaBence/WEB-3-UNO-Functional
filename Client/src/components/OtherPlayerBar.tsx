import "./OtherPLayerBar.css"

import accuseUnoThunk from "../thunks/AccuseUNOThunk";
import type { Dispatch } from "../stores/store";
import type { PlayerSpecs } from "../model/game";
import type { PlayerNames } from "domain/src/model/Player";

export default function PlayersBar({
  players,
  gameId,
  currentPlayerId,
  dispatch,
}: {
  players: PlayerSpecs[];
  gameId: number;
  currentPlayerId: number;
  dispatch: Dispatch;
}) {
  const onAccuseUno = (accusedPlayerId: PlayerNames) => {
    accuseUnoThunk(gameId, currentPlayerId, accusedPlayerId, dispatch);
  };

  return (
    <div className="players-bar">
      {players.map((player) => (
        <div key={player.playerName} className="player-column">
          <div className="player-name">{player.name}</div>

          <div className="player-hand">
            {player.hand.map((_, index) => {
              const len = player.hand.length;
              return (
                <div
                  key={index}
                  className="card back"
                  style={{
                    transform: `rotate(${index * 5 - len * 2.5}deg)
                                translateX(${index * 12 - (len * 12) / 2}px)`,
                  }}
                />
              );
            })}
          </div>

          <div className="call-uno">
            <button onClick={() => onAccuseUno(player.playerName)}>
              UNO Accuse!
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
