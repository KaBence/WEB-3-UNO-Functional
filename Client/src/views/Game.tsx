import './Game.css'

//React stuff
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

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
import { Type } from 'Domain/src/model/Card'

//Thunks
import DrawCardThunk from '../thunks/DrawCardThunk'
import PlayCardThunk from '../thunks/PlayCardThunk'
import CanPlayThunk from '../thunks/CanPlayThunk'
import UnoCallThunk from '../thunks/UnoCallThunk'
import { startRoundThunk } from '../thunks/StartRoundThunk'
import { removePlayerThunk } from '../thunks/RemovePlayerThunk'
import * as PopupThunk from "../thunks/PopupThunk"

const Game = () => {
  const { id } = useParams<{ id?: string }>()
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()
  const activeGames = useSelector((state: State) => state.active_games)
  const player = useSelector((state: State) => state.player)
  const popup = useSelector((state: State) => state.popups)

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

  const drawWithPopup = async () => {
    dispatch(DrawCardThunk(game!.id))

    const result = await dispatch(CanPlayThunk(game?.id!, myHand.length-1))
    console.log(result)
    if(result) {
      PopupThunk.openPopup({popup: "Play"}, dispatch)
    }
    else {
      dispatch(PlayCardThunk({gameId: game?.id!, cardId: -1}))
    }
  }

  const handleDraw = useCallback(() => {
    if (!game || !round || !myPlayer) {
      return
    }
    if (!isMyTurn) {
      return
    }
    dispatch(DrawCardThunk(game.id))
  }, [dispatch, game, round, myPlayer, isMyTurn])

  const playWithPopup = ((gameId: number, cardId: number) => {
    const playedCard = myHand[cardId]
    if(playedCard.Type == Type.Wild || playedCard.Type == Type.WildDrawFour) {
      PopupThunk.openPopup({popup: "ChooseColor", card: cardId}, dispatch)
    }
    else {
        dispatch(PlayCardThunk({ gameId, cardId}))
    }
  })

  const handlePlay = useCallback(
    async (cardIndex: number) => {
      if (!game || !round || !myPlayer) {
        throw new Error('Unable to play card: game, round, or player info missing')
      }
      if (!isMyTurn) {
        throw new Error('Not your turn')
      }

      try {
        playWithPopup(game.id,cardIndex)
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

    function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>(value);
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const handleTimeUp = useCallback(() => {
    if (!game || !round || !myPlayer) return
    if (!isMyTurn) return
    dispatch(DrawCardThunk(game.id))
  }, [dispatch, game, round, myPlayer, isMyTurn])

  const handleStartNewRound = useCallback(() => {
    if (!game || !round?.winner) return
    dispatch(startRoundThunk(game.id))
  }, [dispatch, game, round])

  const handleEndGame = useCallback(async () => {
    if (!game) return
    const players = game.players ?? []
    for (const p of players) {
      await dispatch(removePlayerThunk(game.id, Number(p.playerName)))
    }
    navigate('/lobby')
  }, [dispatch, game, navigate])

  const prevTopCard = usePrevious(round?.topCard);

  useEffect(() => {
    if (!numericId) return
    // If the game has been removed from active list, or this player is no longer in the round, return to lobby
    if (!game) {
      navigate('/lobby')
      return
    }

        if (!prevTopCard && round?.topCard) {
      return;
    }

    if (prevTopCard && round?.topCard) {
      const justPlayed = prevTopCard.Type !== round.topCard.Type ||
                        prevTopCard.Color !== round.topCard.Color ||
                        prevTopCard.CardNumber !== round.topCard.CardNumber;

      if (justPlayed && round.topCard.Type === Type.DummyDraw4 && round.currentPlayer === myPlayer?.playerName) {
        PopupThunk.openPopup({ popup: "Challenge" }, dispatch);
      }
    }
   
  }, [activeGames.length, game, round, myPlayer, navigate, numericId])

  return (
    <div className='game-view'>
      <div className='game-board-area'>
        <div className='status-bar'>
          <StatusBar message={statusMessage} isYourTurn={isMyTurn}/>
        </div>
        <div className='player-bar'>
          <PlayersBar
            players={round?.players ?? []}
            gameId={game?.id ?? 0}
            myPlayerId={player.playerName ?? undefined}
            currentTurnId={round?.currentPlayer ?? undefined}
        
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
          isMyTurn={isMyTurn}
          onTimeUp={handleTimeUp}
          onPlayAgain={handleStartNewRound}
          onEndGame={handleEndGame}
        />
      </aside>

      <PlayPopup gameId={game?.id!} cardIndex={-1} newCard={myHand[myHand.length-1]} />
      <ChooseColorPopup gameId={game?.id!} cardIndex={popup.cardToPlay}/>
      <ChallengePopup gameId={game?.id!} />
      <ChallengeResultPopup />
    </div>
  )
}

export default Game
