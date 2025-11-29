import * as api from '../model/api'


export default async (gameId: number, chosenColor: string) => {
    await api.changeWildCardColor(gameId, chosenColor)
  
}