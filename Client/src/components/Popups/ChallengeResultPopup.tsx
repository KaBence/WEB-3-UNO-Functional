import { useSelector, useDispatch } from "react-redux";
import Popup from "./Popup";
import type { State, Dispatch } from "../../stores/store";
import { popup_slice } from "../../slices/popup_slice";

//import PlayerHand from "../components/PlayerHand"; // michaeala

const ChallengeResultPopup = () => {
  const dispatch = useDispatch<Dispatch>();
  const { showChallengeResult, challengeResult, challengeContext } = useSelector(
    (state: State) => state.popups
  );

  if (!challengeContext) return null;

  //const hand = challengeContext?.handBeforeDraw ?? [];
  //we should call <Playerhand with this hand

  return (
    <Popup
      visible={showChallengeResult}
      title={challengeResult ? "Challenge successful!" : "Challenge failed! Draw 6 cards!"}
      actions={[
        {
          label: "Ok",
          onClick: () => dispatch(popup_slice.actions.closeChallenge()),
        },
      ]}
    >
    </Popup>
  );
};

export default ChallengeResultPopup;
