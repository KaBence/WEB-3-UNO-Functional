import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CardSpecs } from "../model/game";
import { PlayerNames } from "domain/src/model/Player";

export interface ChallengeContext {
  challengedPlayer: PlayerNames;
  handBeforeDraw: CardSpecs[];
}

export interface PopupState {
  showChallenge: boolean;
  showChallengeResult: boolean;
  showColorChange: boolean;
  showPlay: boolean;
  challengeResult: boolean;
  colorSelected: string;
  challengeContext?: ChallengeContext;
  cardToPlay: number
}


const initialState: PopupState = {
  showChallenge: false,
  showChallengeResult: false,
  showColorChange: false,
  showPlay: false,
  challengeResult: false,
  colorSelected: "",
  challengeContext: undefined,
  cardToPlay: 0
};

const popupReducers = {
  openChallenge(state: PopupState) {
    return { ...state, showChallenge: true };
  },
  closeChallenge(state: PopupState) {
    return { ...state, showChallenge: false };
  },
  openChallengeResultSnapshot(
    state: PopupState,
    action: PayloadAction<{ result: boolean; challengedPlayerId: PlayerNames; handBeforeDraw: CardSpecs[] }>
  ) {
    return {
      ...state,
      showChallengeResult: true,
      challengeResult: action.payload.result,
      challengeContext: {
        challengedPlayer: action.payload.challengedPlayerId,
        handBeforeDraw: action.payload.handBeforeDraw,
      },
    };
  },
  setChallengeResult(state: PopupState, action: PayloadAction<boolean>) {
    return { ...state, challengeResult: action.payload };
  },
  closeChallengeResult(state: PopupState) {
    return { ...state, showChallengeResult: false, challengeContext: undefined };
  },
  openColorChange(state: PopupState, card: PayloadAction<number>) {
    return { ...state, showColorChange: true , cardToPlay: card.payload};
  },
  closeColorChange(state: PopupState) {
    return { ...state, showColorChange: false };
  },
  setColorSelected(state: PopupState, action: PayloadAction<string>) {
    return { ...state, colorSelected: action.payload };
  },
  openPlay(state: PopupState) {
    return { ...state, showPlay: true };
  },
  closePlay(state: PopupState) {
    return { ...state, showPlay: false };
  },
};

export const popup_slice = createSlice({
  name: "popup",
  initialState: initialState,
  reducers: popupReducers
});