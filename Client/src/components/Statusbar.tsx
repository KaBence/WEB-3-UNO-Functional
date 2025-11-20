import "./Statusbar.css"

export default function StatusBar({ message, arrowAngle, isYourTurn, score }: { message: string, arrowAngle: number, isYourTurn: boolean, score: number }) {
    return (
        <div className="status-bar">
            {message && <div className="message">{message}</div>}
            <div>
                <img
                    src="/arrow.ico"
                    alt="arrow"
                    className="arrow"
                    style={{ transform: `rotate(${arrowAngle}deg)` }}
                />
            </div>
            <div className={`turn-indicator ${isYourTurn ? "active" : ""}`}>
                {isYourTurn ? "Your Turn" : "Someone's turn"}
            </div>
            <div className="score">Your Score: {score}</div>
        </div>
    );
}
