import type { ButtonHTMLAttributes } from 'react'
import './UnoButton.css'

type UnoButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

const UnoButton = ({ children, ...rest }: UnoButtonProps) => {
  return (
    <button className='uno-btn' {...rest}>
      {children ?? 'UNO!'}
    </button>
  )
}

export default UnoButton
