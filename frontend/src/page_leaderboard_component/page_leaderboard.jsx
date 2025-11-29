import './page_leaderboard.css'
import Leaderboard from '../leaderboard_component/leaderboard'
import Button from '../button_component/button'

import back_icon from "../assets/arrow-left.svg"
import user_icon from "../assets/person-fill.svg"

function Page_Leaderboard(props) {

    return (
        <>
            <div id='leaderboard_page_container'>
                <Button onClick={() => {props.changeCurrentPage("map")}} img={back_icon}/>
                <Button img={user_icon} text="Login"
                        onClick={props.user ? (() => {props.changeCurrentPage("user")}) : (() => {props.displayUserPopup()})}/>
                <Leaderboard/>
                <div id='leaves_left'></div>
                <div id='leaves_right'></div>
            </div>
        </>
    )
}

export default Page_Leaderboard