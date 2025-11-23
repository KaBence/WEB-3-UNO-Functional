import { useState, type KeyboardEvent } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { Dispatch } from '../stores/store'
import {player_slice} from '../slices/player_slice'
import './login.css'

const Login = () => {
  const dispatch = useDispatch<Dispatch>()
  const navigate = useNavigate()

 
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const inputElement = document.getElementById('player-name-input') as HTMLInputElement ;
    const currentName = inputElement?.value || ''
    const trimmed = currentName.trim()
    if (!trimmed) {
      setError('Please enter a name')
      return
    }
    dispatch(player_slice.actions.login(trimmed))
    navigate(`/lobby?player=${trimmed}`)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="login-root">
      <div className="login-card" role="main">
        <img
          src="/assets/uno-logo.png"
          alt="UNO logo"
          className="login-logo"
        />

        <h2 className="login-title">Let's play UNO!</h2>

        <div className="login-form">
          <input
            aria-label="Player name"
            placeholder="Enter name"
            id="player-name-input" 
            onKeyDown={onKey}
            className="login-input"
          />
          {error && <div className="login-error" role="alert">{error}</div>}

          <button
            type="button"
            onClick={submit}
            className="login-button"
          >
            Create Player
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login