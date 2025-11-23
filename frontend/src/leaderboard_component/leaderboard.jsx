import './leaderboard.css'
import Podium from '../podium_component/podium'

function Leaderboard(props) {

    return (
        <>
            <div id='leaderboard_container'>
                <h1>Trash Leaderboard</h1>
                <Podium/>
                <div id='users_container'>
                    <h3>User1</h3>
                </div>
            </div>
        </>
    )
}

export default Leaderboard