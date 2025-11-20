import { useSelector, useDispatch } from "react-redux";
import Popup from "./Popup";
import type { State, Dispatch } from "../../stores/store";
import { playCard } from "../../thunks/PopupThunk";
import { Colors } from "domain/src/model/Card";

interface ChooseColorPopupProps {
  gameId: number;
  cardIndex: number;
}

const ChooseColorPopup = ({ gameId, cardIndex }:ChooseColorPopupProps) => {
  const dispatch = useDispatch<Dispatch>();
  const { showColorChange } = useSelector((state: State) => state.popups);

  const handleChooseColor = async (color: Colors) => {
    await playCard(gameId, cardIndex, color.toString(), dispatch);
  };

  return (
    <Popup
      visible={showColorChange}
      title="Choose a color:"
      footer={
        <div className="color-grid">
          <button className="red" onClick={() => handleChooseColor(Colors.Red)}>Red</button>
          <button className="blue" onClick={() => handleChooseColor(Colors.Blue)}>Blue</button>
          <button className="yellow" onClick={() => handleChooseColor(Colors.Yellow)}>Yellow</button>
          <button className="green" onClick={() => handleChooseColor(Colors.Green)}>Green</button>
        </div>
      }
    />
  );
};

export default ChooseColorPopup;
