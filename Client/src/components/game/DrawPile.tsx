import './DrawPile.css'

type DrawPileProps = {
  cardsLeft: number
  onDraw: () => void
}

const DrawPile = ({ cardsLeft, onDraw }: DrawPileProps) => {
  return (
    <div
      className='draw-pile'
      onClick={cardsLeft > 0 ? onDraw : undefined}
      role='button'
    >
      {cardsLeft > 0 ? (
        <div className='card-back'>
          <div className='uno-oval' />
          <div className='uno-text'>UNO</div>
          <span className='count'>{cardsLeft}</span>
        </div>
      ) : (
        <div className='empty-text'>Empty</div>
      )}
    </div>
  )
}

export default DrawPile
