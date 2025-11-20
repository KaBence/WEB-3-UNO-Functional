import { useState, type KeyboardEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { Dispatch, State } from '../stores/store'
import { setPlayer } from '../stores/playerSlice'
import './login.css'

const Login = () => {
  const dispatch = useDispatch<Dispatch>()
  const navigate = useNavigate()
  const existingPlayer = useSelector((s: State) => s.player.player) //check for existing player in state

  const [playerName, setPlayerName] = useState<string>(existingPlayer ?? '')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const trimmed = playerName.trim()
    if (!trimmed) {
      setError('Please enter a name')
      return
    }
    dispatch(setPlayer(trimmed))
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
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value)
              if (error) setError(null)
            }}
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
