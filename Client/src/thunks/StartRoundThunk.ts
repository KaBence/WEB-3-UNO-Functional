import * as api from '../model/api'

export const startRoundThunk = (gameId: number) => async () => {
  try {
     await api.startRound(gameId)
 
  } catch (error) {
    console.error("Failed to start round:", error)
  }
}
