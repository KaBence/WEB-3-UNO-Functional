import "./Statusbar.css"

export default function StatusBar({ message, isYourTurn }: { message: string, isYourTurn: boolean }) {
    return (
        <div className="status-bar">
            {message && <div className="message">{message}</div>}
            <div className={`turn-indicator ${isYourTurn ? "active" : ""}`}>
                {isYourTurn ? "Your Turn" : "Someone's turn"}
            </div>
        </div>
    );
}
