import { useSelector, useDispatch } from "react-redux";
import Popup from "./Popup";
import type { State, Dispatch } from "../../stores/store";
import { playCard, drawCard } from "../../thunks/PopupThunk";
import type { CardSpecs } from "../../model/game";
import UnoCard from "../game/UnoCard";

interface PlayPopupProps {
  gameId: number;
  cardIndex: number;
  newCard: CardSpecs;
}

const PlayPopup = ({ gameId, cardIndex, newCard }: PlayPopupProps) => {
  const dispatch = useDispatch<Dispatch>();
  const { showPlay, colorSelected } = useSelector((state: State) => state.popups);

  return (
    <div>
      <Popup
          visible={showPlay}
          title="Do you want to play?"
          actions={[
            {
              label: "Play",
              onClick: async () => {
                await playCard(gameId, cardIndex, colorSelected, dispatch); //what about dispatch here?
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
        <UnoCard card={newCard}></UnoCard>
      </Popup>
    </div>
  );
};

export default PlayPopup;
