import { useMemo } from 'react';
import type { CSSProperties, MouseEventHandler } from 'react';
import { Type } from 'Domain/src/model/Card';
import type { CardSpecs } from '../../model/game';
import './UnoCard.css';

type UnoCardProps = {
  card: CardSpecs;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

const UnoCard = ({ card, className, style, onClick }: UnoCardProps) => {
  // Normalize server payload keys (Type/Color/CardNumber) to local expectations
  const type = (card as CardSpecs).Type;
  const color =  (card as CardSpecs).Color;
  const number =  (card as CardSpecs).CardNumber;

  const isWild = useMemo(
    () => type === Type.Wild || type === Type.WildDrawFour,
    [type]
  );

  const isDummy = useMemo(
    () => type === Type.Dummy || type === Type.DummyDraw4,
    [type]
  );

  const showCorners = useMemo(
    () => type === Type.Numbered || type === Type.Draw,
    [type]
  );

  const mainLabel = useMemo(() => {
    switch (type) {
      case Type.Numbered:
        return (number ?? '').toString();
      case Type.Draw:
        return '+2';
      case Type.Skip:
        return 'SKIP';
      case Type.Reverse:
        return 'REV';
      default:
        return '';
    }
  }, [number, type]);

  const cornerLabel = useMemo(() => {
    switch (type) {
      case Type.Numbered:
        return number?.toString() ?? '';
      case Type.Draw:
        return '+2';
      default:
        return '';
    }
  }, [number, type]);

  const colorClass = useMemo(() => {
    if (isWild) return 'card-black';
    const colorName = (color ?? 'BLACK').toLowerCase();
    return `card-${colorName}`;
  }, [color, isWild]);

  const classNames = ['uno-card', colorClass, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} style={style} onClick={onClick}>
      {showCorners && cornerLabel && (
        <>
          <span className="corner top-left">{cornerLabel}</span>
          <span className="corner bottom-right">{cornerLabel}</span>
        </>
      )}

      {isWild && type === Type.WildDrawFour && (
        <>
          <span className="corner top-left">+4</span>
          <span className="corner bottom-right">+4</span>
        </>
      )}

      {type === Type.DummyDraw4 && (
        <>
          <span className="corner top-left">+4</span>
          <span className="corner bottom-right">+4</span>
        </>
      )}

      <div className="center-oval">
        {mainLabel && <span className="center-text">{mainLabel}</span>}

        {(isWild || isDummy) && (
          <div className="wild-symbol" aria-hidden="true">
            <div className="wild-square red" />
            <div className="wild-square yellow" />
            <div className="wild-square green" />
            <div className="wild-square blue" />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnoCard;
