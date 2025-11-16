import './leaderboard.css'
import user_logo from "../assets/person-fill.svg"
import Podium from '../podium_component/podium'
import Button from '../button_component/button'

function Leaderboard(props) {

    return (
        <>
            <div id='leaderboard_container'>
                <Button onClick={() => {console.log("click on user")}} img={user_logo} text="Login"/>
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