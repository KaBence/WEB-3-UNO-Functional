import type { CardSpecs } from '../../model/game'
import UnoCard from './UnoCard'
import './DiscardPile.css'

type DiscardPileProps = {
  topCard?: CardSpecs
}

const DiscardPile = ({ topCard }: DiscardPileProps) => {
  return (
    <div className='discard-pile'>
      {topCard ? (
        <div className='card-wrapper'>
          <UnoCard card={topCard} />
        </div>
      ) : (
        <span className='empty-text'>Empty</span>
      )}
    </div>
  )
}

export default DiscardPile
