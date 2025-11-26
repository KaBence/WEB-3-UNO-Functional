import * as api from '../model/api'

const CanPlayThunk = (gameId: number, cardId: number) => async (): Promise<boolean> => {
  try {
    return await api.canPlay(gameId, cardId)
  } catch (error) {
    console.error('Failed to verify playability', error)
    throw error
  }
}

export default CanPlayThunk
