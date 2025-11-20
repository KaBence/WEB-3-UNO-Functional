import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import DrawPile from '../components/game/DrawPile'
import DiscardPile from '../components/game/DiscardPile'
import PlayerHand from '../components/game/PlayerHand'
import UnoButton from '../components/game/UnoButton'
import GameStatus from '../components/game/GameStatus'
import type { CardSpecs, PlayerSpecs, RoundSpecs } from '../model/game'
import type { State, Dispatch as AppDispatch } from '../stores/store'
import { PlayerNames } from 'Domain/src/model/Player'
import { Direction } from 'Domain/src/model/round'
import { Colors, Type } from 'Domain/src/model/Card'
import DrawCardThunk from '../thunks/DrawCardThunk'
import PlayCardThunk from '../thunks/PlayCardThunk'
import CanPlayThunk from '../thunks/CanPlayThunk'
import UnoCallThunk from '../thunks/UnoCallThunk'
import './Game.css'

const fallbackHand: CardSpecs[] = []

const placeholderRound: RoundSpecs = {
  players: [] as PlayerSpecs[],
  drawDeckSize: 0,
  topCard: {
    type: Type.Numbered,
    color: Colors.Green,
    number: 0
  },
  currentDirection: Direction.Clockwise,
  winner: PlayerNames.player1,
  currentPlayer: PlayerNames.player1,
  statusMessage: 'Waiting for a game...'
}

const Game = () => {
  const { id } = useParams<{ id?: string }>()
  const dispatch: AppDispatch = useDispatch()
  const activeGames = useSelector((state: State) => state.active_games)
  const playerName = useSelector((state: State) => state.player.player)

  const numericId = id ? Number(id) : undefined
  const game = useMemo(() => {
    if (numericId !== undefined && Number.isFinite(numericId)) {
      return activeGames.find((g) => g.id === numericId)
    }
    return activeGames[0]
  }, [activeGames, numericId])

  const round = game?.currentRound

  const myPlayer = useMemo(() => {
    if (!round || round.players.length === 0) return undefined
    if (playerName) {
      return round.players.find((p) => p.name === playerName) ?? round.players[0]
    }
    return round.players[0]
  }, [playerName, round])

  const myHand: CardSpecs[] = myPlayer?.hand ?? fallbackHand
  const statusMessage = round?.statusMessage ?? 'Waiting for players...'
  const currentDirection = round?.currentDirection ?? Direction.Clockwise
  const drawDeckSize = round?.drawDeckSize ?? 0
  const topCard = round?.topCard ?? placeholderRound.topCard

  const canDraw =
    Boolean(game && round && myPlayer) &&
    round!.currentPlayer === myPlayer!.playerName



  const handleDraw = useCallback(() => {
    if (!game || !round || !myPlayer || !canDraw) return
    dispatch(DrawCardThunk(game.id))
  }, [dispatch, game, round, myPlayer, canDraw])

  const handlePlay = useCallback(
    async (cardIndex: number) => {
      if (!game || !round || !myPlayer) {
        alert('Unable to play: missing game, round, or player.');
        return
      }

      if (round.currentPlayer !== myPlayer.playerName) {
        return
      }

      try {
        const playable = await dispatch(CanPlayThunk(game.id, cardIndex))
        if (!playable) return
        dispatch(
          PlayCardThunk({
            gameId: game.id,
            cardId: cardIndex
          })
        )
      } catch (error) {
        console.error('Unable to play card', error)
      }
    },
    [game, round, myPlayer, dispatch, dispatch]
  )

  const handleUno = useCallback(() => {
    if (!game || !myPlayer) return
    dispatch(UnoCallThunk(game.id, myPlayer.playerName))
  }, [dispatch, game, myPlayer])

  const canCallUno = Boolean(game && myPlayer && myHand.length <= 2 && !myPlayer.unoCalled)

  const boardRound = round ?? placeholderRound

  return (
    <div className='game-view'>
      <div className='game-board-area'>
        <div className='status-bar'>
          <span className='status-label'>Status:</span>
          <span>{statusMessage}</span>
        </div>

        <section className='tabletop'>
          <div className='pile-section'>
            <DrawPile
              cardsLeft={boardRound.drawDeckSize}
              onDraw={canDraw ? handleDraw : undefined}
            />
            <span className='pile-label'>Draw pile</span>
          </div>

          <div className='table-info'>
            <div className='direction-pill'>Direction: {currentDirection}</div>
            <div className='deck-size'>Cards left: {drawDeckSize}</div>
          </div>

          <div className='pile-section'>
            <DiscardPile topCard={topCard} />
            <span className='pile-label'>Discard pile</span>
          </div>
        </section>

        <section className='hand-area'>
          <div className='hand-header'>
            <h2>Your Hand</h2>
            <span className='cards-count'>{myHand.length} cards</span>
          </div>
          <PlayerHand cards={myHand} onPlay={handlePlay} />
          <div className='uno-button-wrapper'>
            <UnoButton onClick={handleUno} disabled={!canCallUno}>
              Call UNO
            </UnoButton>
          </div>
        </section>
      </div>

      <GameStatus
        game={game}
        myPlayerId={myPlayer?.playerName ?? PlayerNames.player1}
      />
    </div>
  )
}

export default Game
