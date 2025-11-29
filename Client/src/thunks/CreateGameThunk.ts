import * as api from '../model/api'


export const createGameThunk = () => async () => {
  try {
    const newGame = await api.createGame()
  
    return newGame
  } catch (error) {
    console.error("Failed to create game:", error)
    throw error
  }
}
