import "./Popups.css";

import type { ReactNode } from "react";

interface Action {
  label: string;
  onClick: () => void;
}

interface PopupProps {
  visible: boolean;
  title?: string;
  actions?: Action[];
  children?: ReactNode;
  footer?: ReactNode;
}

const Popup = ({ visible, title, actions, children, footer }: PopupProps) => {
  if (!visible) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        {title && (
          <header>
            <h2>{title}</h2>
          </header>
        )}

        <main className="popup-content">
          {children}
        </main>

        {actions && actions.length ? (
          <footer>
            {actions.map((action, i) => (
              <button key={i} onClick={action.onClick}>
                {action.label}
              </button>
            ))}
          </footer>
        ) : (
          footer && <footer>{footer}</footer>
        )}
      </div>
    </div>
  );
};

export default Popup;