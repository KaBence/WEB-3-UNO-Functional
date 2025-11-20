import * as api from "../model/api";
import { active_games_slice } from "../slices/active_games_slice";
import { popup_slice } from "../slices/popup_slice";
import type { Dispatch, GetState } from "../stores/store";

export const challengeTrue = (gameId: number) => 
  async (dispatch: Dispatch, getState: GetState) => {
    const game = getState().active_games.find(g => g.id === gameId);
    if (!game) return;

    const round = game.currentRound;
    const currIdx = round!.players.findIndex(p => p.playerName === round!.currentPlayer);
    const challengedIdx = (currIdx - 1 + round!.players.length) % round!.players.length;
    const challenged = round!.players[challengedIdx];

    const handSnapshot = challenged.hand.map(c => ({ ...c }));

    dispatch(
      popup_slice.actions.openChallengeResultSnapshot({
        result: false,
        challengedPlayerId: challenged.playerName,
        handBeforeDraw: handSnapshot,
      })
    );

    const result = await api.challengeDraw4(gameId, true);

    dispatch(popup_slice.actions.setChallengeResult(result));
    dispatch(active_games_slice.actions.upsert(result));
  };


export const challengeFalse = (gameId: number) =>
  async (dispatch: Dispatch) => {
    const updatedGame = await api.challengeDraw4(gameId, false);

    dispatch(popup_slice.actions.closeChallenge());
    dispatch(active_games_slice.actions.upsert(updatedGame));
  };


export const playCard = async (
  gameId: number,
  index: number,
  color: string | undefined,
  dispatch: Dispatch
) => {
  const updatedGame =
    color != undefined
      ? await api.play(gameId, index, color)
      : await api.play(gameId, index);

  dispatch(active_games_slice.actions.upsert(updatedGame));
};


export const drawCard = async (gameId: number, dispatch: Dispatch) => {
  const updatedGame = await api.play(gameId, -1);
  dispatch(active_games_slice.actions.upsert(updatedGame));
};


export const chooseColor = async (
  gameId: number,
  cardIndex: number,
  color: string,
  dispatch: Dispatch
) => {
  dispatch(popup_slice.actions.setColorSelected(color));

  const updatedGame = await api.play(gameId, cardIndex, color);

  dispatch(popup_slice.actions.closeColorChange());
  dispatch(active_games_slice.actions.upsert(updatedGame));
};
