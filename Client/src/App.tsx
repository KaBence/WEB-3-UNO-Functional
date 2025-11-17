import { useDispatch } from 'react-redux'
import './App.css'
import router from './router'
import { RouterProvider } from 'react-router-dom'
import { type Dispatch } from './stores/store'
import { useEffect } from 'react'
import InitThunk from './thunks/InitThunk'
import GetActiveGamesThunk from './thunks/GetActiveGamesThunk'
import GetPendingGamesThunk from './thunks/GetPendingGamesThunk'

function App() {
  const dispatch: Dispatch = useDispatch()
  useEffect(() => {
    dispatch(InitThunk)
    dispatch(GetActiveGamesThunk)
    dispatch(LiveUpdateOngoing)
  }, [])

  return (
    <div id='app'>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
