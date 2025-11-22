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
import type { CardSpecs, PlayerSpecs, RoundSpecs } from '../model/game'
import type { State, Dispatch as AppDispatch } from '../stores/store'

//Domain Enums
import { PlayerNames } from 'Domain/src/model/Player'
import { Direction } from 'Domain/src/model/round'
import { Colors, Type } from 'Domain/src/model/Card'

//Store and thunks should we have thunks here?
import type { Dispatch } from "../stores/store";
import DrawCardThunk from '../thunks/DrawCardThunk'
import PlayCardThunk from '../thunks/PlayCardThunk'
import CanPlayThunk from '../thunks/CanPlayThunk'
import UnoCallThunk from '../thunks/UnoCallThunk'

//Test purposes
import type { AnyAction } from "@reduxjs/toolkit";

const mockPlayers = [
  {
    name: "Alice",
    unoCalled: false,
    playerName: PlayerNames.player1,
    hand: [
      { type: Type.Numbered, color: Colors.Red, number: 5 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 },
      { type: Type.Numbered, color: Colors.Blue, number: 7 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 },
      { type: Type.Numbered, color: Colors.Green, number: 2 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 },
    ],
  },
  {
    name: "Bob",
    unoCalled: false,
    playerName: PlayerNames.player2,
    hand: [
      { type: Type.Numbered, color: Colors.Yellow, number: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 },
      { type: Type.Numbered, color: Colors.Red, number: 3 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 },
    ],
  },
];


const mockDispatch: Dispatch = ((action: AnyAction | any) => {
  console.log("dispatch called:", action);
  return action;
}) as Dispatch;

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
    if (player.playerName) {
      return round.players.find((p) => p.playerName === player.playerName) ?? undefined
    }
    return undefined
  }, [player, round])

  const myHand: CardSpecs[] = myPlayer?.hand ?? []
  const statusMessage = round?.statusMessage ?? 'Waiting for players...'
  const currentDirection = round?.currentDirection ?? Direction.Clockwise
  const topCard = round?.topCard ?? placeholderRound.topCard

  const isMyTurn = Boolean(game && round) && round!.currentPlayer === player.playerName

  const handleDraw = useCallback(() => {
    if (!game || !round || !myPlayer || !isMyTurn) return
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
    [game, round, myPlayer, dispatch, dispatch]
  )

  const handleUno = useCallback(() => {
    if (!game || !myPlayer) return
    dispatch(UnoCallThunk(game.id, myPlayer.playerName))
  }, [dispatch, game, myPlayer])

  const canCallUno = Boolean(game && myPlayer && myHand.length <= 2 && !myPlayer.unoCalled) //Didn't we say we can call UNO anytime?

  const boardRound = round ?? placeholderRound

  return (
    <div className='game-view'>
      <div className='game-board-area'>
        <div className='status-bar'>
          <StatusBar message={statusMessage} isYourTurn={true} arrowAngle={180} score={120} />
        </div>
        <div className='player-bar'>
          <PlayersBar players={mockPlayers} gameId={1} currentPlayerId={1} dispatch={mockDispatch} />
        </div>
        <section className='tabletop'>
          <div className='pile-section'>
            <DrawPile
              cardsLeft={boardRound.drawDeckSize}
              onDraw={handleDraw}
            />
            <span className='pile-label'>Draw pile</span>
          </div>

          <div className='table-info'>
            <div className='direction-pill'>Direction: {currentDirection}</div>
            <div className='deck-size'>Cards left: {boardRound.drawDeckSize}</div>
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
      <div>

      </div>
      <GameStatus
        game={game}
        myPlayerId={player.playerName ?? PlayerNames.player1}
      />
      <PlayPopup gameId={1} cardIndex={0} newCard={{ type: Type.Numbered, color: Colors.Red, number: 7 }} />
      <ChooseColorPopup gameId={1} cardIndex={1} />
      <ChallengePopup gameId={1} />
      <ChallengeResultPopup />
    </div>
  )
}

export default Game
