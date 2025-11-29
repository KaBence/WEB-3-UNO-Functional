import * as api from '../model/api'


export default async (gameId: number, response: boolean) => {
   await api.challengeDraw4(gameId, response)
  
}