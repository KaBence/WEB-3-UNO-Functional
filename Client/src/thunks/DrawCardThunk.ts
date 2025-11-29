
import * as api from '../model/api'


const DrawCardThunk = (gameId: number) => async () => {
  try {
 await api.drawCard(gameId)
  
  } catch (error) {
    console.error('Failed to draw card', error)
    throw error
  }
}

export default DrawCardThunk
