import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CardSpecs } from "../model/game";
import { PlayerNames } from "domain/src/model/Player";

export type Popups = "Play" | "ColorChange" | "Challenge" | "ChallengeResult";

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
}

// Test mocks
import { Type, Colors } from "domain/src/model/Card";
const mockCard: CardSpecs = { type: Type.Numbered, number: 7, color: Colors.Blue };
const mock: ChallengeContext = { challengedPlayer: PlayerNames.player1, handBeforeDraw: [mockCard] };

const initialState: PopupState = {
  showChallenge: false,
  showChallengeResult: false,
  showColorChange: false,
  showPlay: false,
  challengeResult: false,
  colorSelected: "",
  challengeContext: undefined,
};

const popupReducers = {
  openChallenge(_state: PopupState) {
    return { ..._state, showChallenge: true };
  },
  closeChallenge(_state: PopupState) {
    return { ..._state, showChallenge: false };
  },
  openChallengeResultSnapshot(
    _state: PopupState,
    action: PayloadAction<{ result: boolean; challengedPlayerId: PlayerNames; handBeforeDraw: CardSpecs[] }>
  ) {
    return {
      ..._state,
      showChallengeResult: true,
      challengeResult: action.payload.result,
      challengeContext: {
        challengedPlayer: action.payload.challengedPlayerId,
        handBeforeDraw: action.payload.handBeforeDraw,
      },
    };
  },
  setChallengeResult(_state: PopupState, action: PayloadAction<boolean>) {
    return { ..._state, challengeResult: action.payload };
  },
  closeChallengeResult(_state: PopupState) {
    return { ..._state, showChallengeResult: false, challengeContext: undefined };
  },
  openColorChange(_state: PopupState) {
    return { ..._state, showColorChange: true };
  },
  closeColorChange(_state: PopupState) {
    return { ..._state, showColorChange: false };
  },
  setColorSelected(_state: PopupState, action: PayloadAction<string>) {
    return { ..._state, colorSelected: action.payload };
  },
  openPlay(_state: PopupState) {
    return { ..._state, showPlay: true };
  },
  closePlay(_state: PopupState) {
    return { ..._state, showPlay: false };
  },
};

export const popup_slice = createSlice({
  name: "popup",
  initialState: initialState,
  reducers: popupReducers
});