import type { CardSpecs } from '../../model/game'
import UnoCard from './UnoCard'
import './PlayerHand.css'

type PlayerHandProps = {
  cards: CardSpecs[]
  onPlay: (index: number) => void
}

const cardStyle = (index: number, total: number) => {
  const angle = (index - (total - 1) / 2) * 8
  const shift = Math.abs(index - (total - 1) / 2) * 6
  return {
    transform: `rotate(${angle}deg) translateY(${shift}px)`,
    zIndex: index
  } as const
}

const PlayerHand = ({ cards, onPlay }: PlayerHandProps) => {
  return (
    <div className='player-hand'>
      {cards.map((card, index) => (
        <UnoCard
          key={`${card.type}-${card.color ?? ''}-${card.number ?? ''}-${index}`}
          card={card}
          className='hand-card'
          style={cardStyle(index, cards.length)}
          onClick={() => onPlay(index)}
        />
      ))}
    </div>
  )
}

export default PlayerHand
