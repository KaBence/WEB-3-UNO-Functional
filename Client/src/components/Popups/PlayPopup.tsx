import { useSelector, useDispatch } from "react-redux";
import Popup from "./Popup";
import type { State, Dispatch } from "../../stores/store";
import { playCard, drawCard } from "../../thunks/PopupThunk";
import type { CardSpecs } from "../../model/game";
//import Card from "../components/Card"; //waiting for michaela

interface PlayPopupProps {
  gameId: number;
  cardIndex: number;
  card: CardSpecs;
}

const PlayPopup = ({ gameId, cardIndex }: PlayPopupProps) => {
  const dispatch = useDispatch<Dispatch>();
  const { showPlay, colorSelected } = useSelector((state: State) => state.popups);

  return (
    <Popup
      visible={showPlay}
      title="Do you want to play?"
      actions={[
        {
          label: "Play",
          onClick: async () => {
            await playCard(gameId, cardIndex, colorSelected, dispatch);
          },
        },
        {
          label: "Draw",
          onClick: async () => {
            await drawCard(gameId, dispatch);
          },
        },
      ]}
    >
    </Popup>
  );
};

export default PlayPopup;
