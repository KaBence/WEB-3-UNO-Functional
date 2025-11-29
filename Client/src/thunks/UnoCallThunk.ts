import * as api from '../model/api'


const UnoCallThunk =
  (gameId: number, playerId: number) => async () => {
    try {
     await api.sayUno(gameId, playerId)

    } catch (error) {
      console.error('Failed to call UNO', error)
      throw error
    }
  }

export default UnoCallThunk
