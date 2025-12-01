import './page_map.css'
import Map from '../map_component/map'
import Map_Result from '../map_result_component/map_result'
import Button from '../button_component/button';
import Trash_Popup from '../trash_popup_component/trash_popup';
import { useState } from 'react';

import login_icon from '../assets/person-fill.svg'
import settings_icon from '../assets/gear-fill.svg'
import trash_icon from '../assets/trash-fill.svg'
import leaderboard_icon from '../assets/trophy-fill.svg'

function Page_Map(props) {

    const [ displayedResults, setDisplayedResults ] = useState("");
    const [ addTrash, setAddTrash ] = useState(false);

    const selectRegion = (regionName) => {
        setDisplayedResults(regionName)
    }

    return (
        <>
            {addTrash && props.accessToken && <Trash_Popup user={props.user} 
                                                           accessToken={props.accessToken} 
                                                           onClickClose={() => setAddTrash(false)}/>}
            <div id='top_buttons_container'>
                <Button img={login_icon} text="Login" 
                        onClick={props.user ? (() => {props.changeCurrentPage("user")}) : (() => {console.log("not login")})}/>
                <Button img={settings_icon} text="Settings"/>
            </div>
            {displayedResults != "" && <Map_Result region={displayedResults} onClose={() => setDisplayedResults("")}/>}
            <div id='bottom_buttons_container' style={displayedResults != "" ? {"left":"51vh"} : {"left":"1vh"}}>
                <Button img={trash_icon} 
                        onClick={() => {setAddTrash(true)}}/>
                <Button img={leaderboard_icon} onClick={() => { props.changeCurrentPage("leaderboard") }}/>
            </div>
            <Map selectRegion={selectRegion}/>
        </>
    )
}

export default Page_Map