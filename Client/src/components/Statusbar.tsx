import "./Statusbar.css"

export default function StatusBar({ message, isYourTurn, score }: { message: string, isYourTurn: boolean, score: number }) {
    return (
        <div className="status-bar">
            {message && <div className="message">{message}</div>}
            <div className={`turn-indicator ${isYourTurn ? "active" : ""}`}>
                {isYourTurn ? "Your Turn" : "Someone's turn"}
            </div>
            <div className="score">Your Score: {score}</div>
        </div>
    );
}
