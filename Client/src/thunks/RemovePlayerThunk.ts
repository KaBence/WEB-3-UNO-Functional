import * as api from '../model/api'

// Removal is propagated via server subscription; no local state mutation needed here.
export const removePlayerThunk = (gameId: number, playerId: number) => async () => {
  try {
   await api.removePlayer(gameId, playerId)
    
  } catch (error) {
    console.error("Failed to request player removal:", error)
  }
}
