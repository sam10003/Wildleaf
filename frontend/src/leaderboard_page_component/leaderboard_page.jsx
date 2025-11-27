import './leaderboard_page.css'
import Leaderboard from '../leaderboard_component/leaderboard'
import Button from '../button_component/button'

import back_icon from "../assets/arrow-left.svg"
import user_icon from "../assets/person-fill.svg"

function Leaderboard_Page(props) {

    return (
        <>
            <div id='leaderboard_page_container'>
                <Button onClick={() => {props.changeCurrentPage("map")}} img={back_icon}/>
                <Button onClick={() => {console.log("click on user")}} img={user_icon} text="Login"/>
                <Leaderboard/>
                <div id='leaves_left'></div>
                <div id='leaves_right'></div>
            </div>
        </>
    )
}

export default Leaderboard_Page