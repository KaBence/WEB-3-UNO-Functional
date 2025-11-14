import { createBrowserRouter } from 'react-router-dom'
import Lobby from '../views/Lobby'
import Login from '../views/Login'
import Game from '../views/Game'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login/>
  }, 
  {
    path: '/lobby',
    element: <Lobby/>
  }, 
  {
    path: '/game/:id',
    element: <Game/>,
  }, 
])

export default router
