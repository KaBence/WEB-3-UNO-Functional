import type { CSSProperties } from 'react'
import type { CardSpecs } from '../../model/game'
import UnoCard from './UnoCard'
import './PlayerHand.css'

type PlayerHandProps = {
  cards: CardSpecs[]
  onPlay: (index: number) => void
}

const PlayerHand = ({ cards, onPlay }: PlayerHandProps) => {
  const midpoint = (cards.length - 1) / 2

  return (
    <div className='player-hand'>
      {cards.map((card, index) => {
        const rotation = (index - midpoint) * 8
        const shift = Math.abs(index - midpoint) * 6

        const cardStyle = {
          '--rotation': `${rotation}deg`,
          '--shift': `${shift}px`,
          zIndex: index + 1
        } as CSSProperties

        return (
          <UnoCard
            key={`${card.Type}-${card.Color ?? ''}-${card.CardNumber ?? ''}-${index}`}
            card={card}
            className='hand-card'
            style={cardStyle}
            onClick={() => onPlay(index)}
          />
        )
      })}
    </div>
  )
}

export default PlayerHand
