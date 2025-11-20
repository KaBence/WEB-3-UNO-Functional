import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Popup from "./Popup";
import type { State, Dispatch } from "../../stores/store";
import { challengeTrue, challengeFalse } from "../../thunks/PopupThunk";

interface ChallengePopupProps {
  gameId: number;
}

const ChallengePopup: React.FC<ChallengePopupProps> = ({ gameId }) => {
  const dispatch = useDispatch<Dispatch>();
  const { showChallenge } = useSelector((state: State) => state.popups);

  return (
    <Popup
      visible={showChallenge}
      title="Do you want to challenge the player?"
      actions={[
        {
          label: "Yes",
          onClick: () => {
            dispatch(challengeTrue(gameId));
          },
        },
        {
          label: "No",
          onClick: () => {
            dispatch(challengeFalse(gameId));
          },
        },
      ]}
    />
  );
};

export default ChallengePopup;
