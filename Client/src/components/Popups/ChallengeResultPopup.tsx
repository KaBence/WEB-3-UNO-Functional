import { useSelector, useDispatch } from "react-redux";
import Popup from "./Popup";
import type { State, Dispatch } from "../../stores/store";
import { popup_slice } from "../../slices/popup_slice";
import UnoCard from '../game/UnoCard'


const cardStyle = (index: number, total: number) => {
  const angle = (index - (total - 1) / 2) * 8
  const shift = Math.abs(index - (total - 1) / 2) * 6
  return {
    transform: `rotate(${angle}deg) translateY(${shift}px)`,
    zIndex: index
  } as const
}

const ChallengeResultPopup = () => {
  const dispatch = useDispatch<Dispatch>();
  const { showChallengeResult, challengeResult, challengeContext } = useSelector(
    (state: State) => state.popups
  );

  if (!challengeContext) return undefined;


  return (
    <Popup
      visible={showChallengeResult}
      title={challengeResult ? "Challenge successful!" : "Challenge failed! Draw 6 cards!"}
      actions={[
        {
          label: "Ok",
          onClick: () => dispatch(popup_slice.actions.closeChallengeResult()),
        },
      ]}
    >
    <div className='player-hand'>
      {challengeContext.handBeforeDraw.map((card, index) => (
        <UnoCard
          key={`${card.Type}-${card.Color ?? ''}-${card.CardNumber ?? ''}-${index}`}
          card={card}
          className='hand-card'
          style={cardStyle(index, challengeContext.handBeforeDraw.length)}
        />
      ))}
    </div>
    </Popup>
  );
};

export default ChallengeResultPopup;
