import StatusBar from "../components/Statusbar"

export default function Game(){
    return <StatusBar message="Test" isYourTurn={true} arrowAngle={180} score={120}/>
}