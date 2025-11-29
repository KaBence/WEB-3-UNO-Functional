import * as api from '../model/api'

export default async () => {
    await api.getActiveGames();
    await api.getPendingGames();

}
