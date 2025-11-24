import './Game.css'

//React stuff
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

//Components
import StatusBar from "../components/Statusbar"
import PlayersBar from "../components/OtherPlayerBar"
import PlayPopup from "../components/Popups/PlayPopup";
import ChooseColorPopup from "../components/Popups/ChooseColorPopup";
import ChallengePopup from "../components/Popups/ChallengePopup";
import ChallengeResultPopup from "../components/Popups/ChallengeResultPopup";
import DrawPile from '../components/game/DrawPile'
import DiscardPile from '../components/game/DiscardPile'
import PlayerHand from '../components/game/PlayerHand'
import UnoButton from '../components/game/UnoButton'
import GameStatus from '../components/game/GameStatus'

//Specs
import type { CardSpecs} from '../model/game'
import type { State, Dispatch as AppDispatch } from '../stores/store'

//Domain Enums
import { PlayerNames } from 'Domain/src/model/Player'
import { Direction } from 'Domain/src/model/round'
import { Colors, Type } from 'Domain/src/model/Card'

//Store and thunks should we have thunks here?
import DrawCardThunk from '../thunks/DrawCardThunk'
import PlayCardThunk from '../thunks/PlayCardThunk'
import CanPlayThunk from '../thunks/CanPlayThunk'
import UnoCallThunk from '../thunks/UnoCallThunk'

const Game = () => {
  const { id } = useParams<{ id?: string }>()
  const dispatch: AppDispatch = useDispatch()
  const activeGames = useSelector((state: State) => state.active_games)
  const player = useSelector((state: State) => state.player)

  const numericId = id ? Number(id) : undefined
  const game = useMemo(() => {
    if (numericId !== undefined && Number.isFinite(numericId)) {
      return activeGames.find((g) => g.id === numericId)
    }
  }, [activeGames, numericId])

  const round = game?.currentRound

  const myPlayer = useMemo(() => {
    if (!round || round.players.length === 0) return undefined
    if (!player.playerName) return undefined
    return round.players.find((p) => p.playerName === player.playerName)
  }, [player, round])

  const myHand: CardSpecs[] = myPlayer?.hand ?? []
  const statusMessage = round?.statusMessage ?? 'Waiting for players...'
  const currentDirection = round?.currentDirection ?? Direction.Clockwise
  const topCard = round?.topCard

  const isMyTurn = Boolean(round && myPlayer) && round?.currentPlayer === myPlayer?.playerName

  const handleDraw = useCallback(() => {
    if (!game || !round || !myPlayer) {
   
      return
    }
    if (!isMyTurn) {
     
      return
    }
    dispatch(DrawCardThunk(game.id))
  }, [dispatch, game, round, myPlayer, isMyTurn])

  const handlePlay = useCallback(
    async (cardIndex: number) => {
      if (!game || !round || !myPlayer) {
        throw new Error('Unable to play card: game, round, or player info missing')
      }
      if (!isMyTurn) {
        throw new Error('Not your turn')
      }

      try {
        const playable = await dispatch(CanPlayThunk(game.id, cardIndex))
        if (!playable) {
          throw new Error('Card is not playable')
        }
        dispatch(PlayCardThunk({ gameId: game.id, cardId: cardIndex }))
      } catch (error) {
        console.error('Unable to play card', error)
      }
    },
    [game, round, myPlayer, dispatch, isMyTurn]
  )

  const handleUno = useCallback(() => {
    if (!game || !myPlayer) return
    dispatch(UnoCallThunk(game.id, myPlayer.playerName))
  }, [dispatch, game, myPlayer])

  return (
    <div className='game-view'>
      <div className='game-board-area'>
        <div className='status-bar'>
          <StatusBar message={statusMessage} isYourTurn={true} arrowAngle={180} score={120} />
        </div>
        <div className='player-bar'>
          <PlayersBar
            players={round?.players ?? []}
            gameId={game?.id ?? 0}
            currentPlayerId={player.playerName ?? PlayerNames.player1}
        
          />
        </div>
        <section className='tabletop'>
          <div className='pile-section'>
            <DrawPile
              cardsLeft={round?.drawDeckSize ?? 0}
              onDraw={handleDraw}
            />
            <span className='pile-label'>Draw pile</span>
          </div>

          <div className='table-info'>
            <div className='direction-pill'>Direction: {currentDirection}</div>
            <div className='deck-size'>Cards left: {round?.drawDeckSize ?? 0}</div>
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
        </section>

        <div className='uno-button-wrapper'>
          <UnoButton onClick={handleUno}>
            Call UNO
          </UnoButton>
        </div>
      </div>

      <aside className='side-panel'>
        <GameStatus
          game={game}
          myPlayerId={player.playerName ?? PlayerNames.player1}
        />
      </aside>

      <PlayPopup gameId={1} cardIndex={0} newCard={{ Type: Type.Numbered, Color: Colors.Red, CardNumber: 7 }} />
      <ChooseColorPopup gameId={1} cardIndex={1} />
      <ChallengePopup gameId={1} />
      <ChallengeResultPopup />
    </div>
  )
}

export default Game
