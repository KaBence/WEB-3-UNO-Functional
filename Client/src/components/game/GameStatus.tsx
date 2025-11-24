import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GameSpecs } from '../../model/game'
import type { PlayerNames } from 'Domain/src/model/Player'
import './GameStatus.css'

type GameStatusProps = {
  game?: GameSpecs
  myPlayerId: PlayerNames
  isMyTurn?: boolean
  onPlayAgain?: () => void
  onEndGame?: () => void
  onTimeUp?: () => void
}

const TIMER_LENGTH = 20
const CRITICAL_THRESHOLD = 8

const GameStatus = ({
  game,
  myPlayerId,
  isMyTurn: isMyTurnProp,
  onPlayAgain,
  onEndGame,
  onTimeUp
}: GameStatusProps) => {
  const [timer, setTimer] = useState(TIMER_LENGTH)
  const [isCritical, setIsCritical] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const firedForTurnRef = useRef(false)
  const isMyTurnRef = useRef(false)
  const roundGoingRef = useRef(false)

  const round = game?.currentRound
  const roundWinnerId = round?.winner
  const roundEnded = Boolean(roundWinnerId)
  const roundGoing = Boolean(round && !roundWinnerId)
  const gameWinnerId = game?.winner ?? null
  const showPlayAgainAfterGame = Boolean(gameWinnerId)
  const currentPlayerId = round?.currentPlayer
  const isMyTurn = typeof isMyTurnProp === 'boolean'
    ? isMyTurnProp && roundGoing
    : currentPlayerId === myPlayerId && roundGoing

  useEffect(() => {
    isMyTurnRef.current = isMyTurn
  }, [isMyTurn])

  useEffect(() => {
    roundGoingRef.current = roundGoing
  }, [roundGoing])

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const resetTimerToFull = useCallback(() => {
    clearTick()
    firedForTurnRef.current = false
    setTimer(TIMER_LENGTH)
    setIsCritical(false)
  }, [clearTick])

  const startOrResumeTimer = useCallback(() => {
    if (intervalRef.current !== null) return

    intervalRef.current = window.setInterval(() => {
      setTimer((prev) => {
        const next = prev - 1
        if (next <= CRITICAL_THRESHOLD) setIsCritical(true)

        if (next <= 0) {
          clearTick()
          if (
            !firedForTurnRef.current &&
            roundGoingRef.current &&
            isMyTurnRef.current
          ) {
            firedForTurnRef.current = true
            onTimeUp?.()
          }
          return 0
        }

        return next
      })
    }, 1000)
  }, [clearTick, onTimeUp])

  useEffect(() => {
    if (!roundGoing || !isMyTurn) {
      resetTimerToFull()
      return
    }

    startOrResumeTimer()
  }, [isMyTurn, roundGoing, resetTimerToFull, startOrResumeTimer])

  useEffect(() => {
    return () => clearTick()
  }, [clearTick])

  useEffect(() => {
    setTimer(TIMER_LENGTH)
    setIsCritical(false)
    firedForTurnRef.current = false
    if (isMyTurn && roundGoing) startOrResumeTimer()
  }, [currentPlayerId, isMyTurn, roundGoing, startOrResumeTimer])

  const roundWinnerName = useMemo(() => {
    if (!roundWinnerId || !round?.players) return null
    const player = round.players.find((p) => p.playerName === roundWinnerId)
    return player?.name ?? `Player ${roundWinnerId}`
  }, [round?.players, roundWinnerId])

  const gameWinnerName = useMemo(() => {
    if (!gameWinnerId || !game?.players) return null
    const player = game.players.find((p) => p.playerName === gameWinnerId)
    return player?.name ?? `Player ${gameWinnerId}`
  }, [game?.players, gameWinnerId])

  const sortedPlayers = useMemo(() => {
    if (!game?.scores || !game?.players) return []
    return Object.entries(game.scores)
      .map(([playerId, score]) => {
        const idNumber = Number(playerId) as PlayerNames
        const player = game.players.find((p) => p.playerName === idNumber)
        return {
          name: player?.name ?? `Player ${playerId}`,
          score: Number(score) ?? 0
        }
      })
      .sort((a, b) => b.score - a.score)
  }, [game?.players, game?.scores])


  return (game &&
    <div className='gamestatus'>
      <div className={`timer ${isCritical ? 'critical' : ''}`}>
        Time Left: {timer}s
      </div>

      <div className='empty' />

      <div className='Rounds'>
        <h1>Round History</h1>
        <div className='round-List'>
          {game.roundHistory.map(([winner, points], index) => (
            <div
              key={`${winner}-${index}`}
              className={`player ${
                index === game.roundHistory.length - 1 ? 'current' : ''
              }`}
            >
              <span className='rank'>Round {index + 1}:</span>
              <span className='name'>{winner}</span>
              <span className='score'>{points} Points</span>
            </div>
          ))}
        </div>
      </div>

      <div className='empty' />
      <h1>Scoreboard</h1>
      <div className='player-list'>
        {sortedPlayers.map((player, index) => (
          <div key={`${player.name}-${index}`} className='player'>
            <span className='rank'>{index + 1}</span>
            <span className='name'>{player.name}</span>
            <span className='score'>{player.score}</span>
          </div>
        ))}
      </div>

      {roundEnded && !showPlayAgainAfterGame && (
        <div className='winner-section'>
          <div className='winner-banner'>
            🏆 Round Winner: {roundWinnerName} 🏆
          </div>
          <button className='play-again' onClick={onPlayAgain}>
            Start New Round
          </button>
        </div>
      )}

      {showPlayAgainAfterGame && (
        <button className='play-again-final' onClick={onEndGame}>
          {gameWinnerName} won! Play Again
        </button>
      )}
    </div>
  )
}

export default GameStatus
