import { useMemo } from 'react'
import type { CSSProperties, MouseEventHandler } from 'react'
import { Type } from 'Domain/src/model/Card'
import type { CardSpecs } from '../../model/game'
import './UnoCard.css'

type UnoCardProps = {
  card: CardSpecs
  className?: string
  style?: CSSProperties
  onClick?: MouseEventHandler<HTMLDivElement>
}

const UnoCard = ({ card, className, style, onClick }: UnoCardProps) => {
  const isWild = useMemo(
    () => card.type === Type.Wild || card.type === Type.WildDrawFour,
    [card.type]
  )

  const isDummy = useMemo(
    () => card.type === Type.Dummy || card.type === Type.DummyDraw4,
    [card.type]
  )

  const showCorners = useMemo(
    () => card.type === Type.Numbered || card.type === Type.Draw,
    [card.type]
  )

  const mainLabel = useMemo(() => {
    switch (card.type) {
      case Type.Numbered:
        return (card.number ?? '').toString()
      case Type.Draw:
        return '+2'
      case Type.Skip:
        return 'SKIP'
      case Type.Reverse:
        return '⇄'
      default:
        return ''
    }
  }, [card.number, card.type])

  const cornerLabel = useMemo(() => {
    switch (card.type) {
      case Type.Numbered:
        return card.number?.toString() ?? ''
      case Type.Draw:
        return '+2'
      default:
        return ''
    }
  }, [card.number, card.type])

  const colorClass = useMemo(() => {
    if (isWild || isDummy) return 'card-black'
    const colorName = (card.color ?? 'BLACK').toLowerCase()
    return `card-${colorName}`
  }, [card.color, isDummy, isWild])

  const classNames = ['uno-card', colorClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} style={style} onClick={onClick}>
      {showCorners && cornerLabel && (
        <>
          <span className='corner top-left'>{cornerLabel}</span>
          <span className='corner bottom-right'>{cornerLabel}</span>
        </>
      )}

      {isWild && card.type === Type.WildDrawFour && (
        <>
          <span className='corner top-left'>+4</span>
          <span className='corner bottom-right'>+4</span>
        </>
      )}

      {card.type === Type.DummyDraw4 && (
        <>
          <span className='corner top-left'>+4</span>
          <span className='corner bottom-right'>+4</span>
        </>
      )}

      <div className='center-oval'>
        {mainLabel && <span className='center-text'>{mainLabel}</span>}

        {(isWild || isDummy) && (
          <div className='wild-symbol' aria-hidden='true'>
            <div className='wild-square red' />
            <div className='wild-square yellow' />
            <div className='wild-square green' />
            <div className='wild-square blue' />
          </div>
        )}
      </div>
    </div>
  )
}

export default UnoCard
