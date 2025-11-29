import * as api from '../model/api'


export default async (gameId: number, accuser: number, accused: number) => {
     await api.accuseUno(gameId, accuser, accused)
    
}