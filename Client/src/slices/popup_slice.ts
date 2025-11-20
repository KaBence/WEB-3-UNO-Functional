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

//Test purposes
import { Type, Colors } from "domain/src/model/Card";
const mockCard: CardSpecs = {type: Type.Numbered, number: 7, color: Colors.Blue}
const mock: ChallengeContext = {challengedPlayer: PlayerNames.player1, handBeforeDraw: [mockCard]}

const initialState: PopupState = {
  showChallenge: false, 
  showChallengeResult: true,
  showColorChange: false,
  showPlay: false,
  challengeResult: true,
  colorSelected: "",
  challengeContext: mock,
};

export const popup_slice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    openChallenge(state) {
      state.showChallenge = true;
    },
    closeChallenge(state) {
      state.showChallenge = false;
    },
    openChallengeResultSnapshot(
      state,
      action: PayloadAction<{ result: boolean; challengedPlayerId: PlayerNames; handBeforeDraw: CardSpecs[] }>
    ) {
      state.showChallengeResult = true;
      state.challengeResult = action.payload.result;
      state.challengeContext = {
        challengedPlayer: action.payload.challengedPlayerId,
        handBeforeDraw: action.payload.handBeforeDraw,
      };
    },
    setChallengeResult(state, action: PayloadAction<boolean>) {
      state.challengeResult = action.payload;
    },
    closeChallengeResult(state) {
      state.showChallengeResult = false;
      state.challengeContext = undefined;
    },
    openColorChange(state) {
      state.showColorChange = true;
    },
    closeColorChange(state) {
      state.showColorChange = false;
    },
    setColorSelected(state, action: PayloadAction<string>) {
      state.colorSelected = action.payload;
    },
    openPlay(state) {
      state.showPlay = true;
    },
    closePlay(state) {
      state.showPlay = false;
    },
  },
});

export const {
  openChallenge,
  closeChallenge,
  openChallengeResultSnapshot,
  setChallengeResult,
  closeChallengeResult,
  openColorChange,
  closeColorChange,
  setColorSelected,
  openPlay,
  closePlay,
} = popup_slice.actions;