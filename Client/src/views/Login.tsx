import { useCallback, useState, type KeyboardEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { Dispatch } from '../stores/store';
import { player_slice } from '../slices/player_slice';
import './Login.css';

const Login = () => {
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name');
      return;
    }
    dispatch(player_slice.actions.login(trimmed));
    navigate('/lobby');
  }, [dispatch, name, navigate]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className="login-root">
      <div className="login-card" role="main">
        <img
          src="/assets/uno-logo.png"
          alt="UNO logo"
          className="login-logo"
        />

        <h2 className="login-title">Let's play UNO!</h2>
        <p className="login-subtitle">Pick a name and jump into the lobby.</p>

        <div className="login-form">
          <label className="login-label" htmlFor="player-name-input">
            Player name
          </label>
          <input
            aria-label="Player name"
            placeholder="Enter name"
            id="player-name-input"
            onKeyDown={onKey}
            className="login-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
          />
          {error && <div className="login-error" role="alert">{error}</div>}

          <button
            type="button"
            onClick={submit}
            className="login-button"
          >
            Create Player
          </button>

          <p className="helper">You can change your name later from the lobby.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
