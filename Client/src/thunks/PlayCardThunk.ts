
import * as api from '../model/api'


type PlayCardArgs = {
  gameId: number
  cardId: number
  chosenColor?: string
}

const PlayCardThunk =
  ({ gameId, cardId, chosenColor }: PlayCardArgs) =>
  async () => {
    try {
    await api.play(gameId, cardId, chosenColor)
 
    } catch (error) {
      console.error('Failed to play card', error)
      throw error
    }
  }

export default PlayCardThunk
