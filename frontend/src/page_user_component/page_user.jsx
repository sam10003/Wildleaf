import './page_user.css'
import User_Trash_Info from '../user_trash_info_component/user_trash_info';
import User_Personal_Info from '../user_personal_info_component/user_personal_info';
import Button from '../button_component/button';
import { useState } from 'react';

import back_icon from "../assets/arrow-left.svg"

function Page_User(props) {

    const [ currentPage, setCurrentPage ] = useState("trash");

    return (
        <>
            <div id='user_page_container'>
                <Button onClick={() => {props.changeCurrentPage("map")}} img={back_icon}/>
                <div id='buttons_container'>
                    <button id='trash_info_button' 
                            style={currentPage === "trash" ? 
                                ({"background-color":"var(--light-green)", "color":"black"}) : 
                                ({"background-color":"var(--dark-green)", "color":"white"})}
                            onClick={() => {setCurrentPage("trash")}}>
                        Trash Cleaning
                    </button>
                    <button id='personal_info_button'
                            style={currentPage === "personal" ? 
                                ({"background-color":"var(--light-green)", "color":"black"}) : 
                                ({"background-color":"var(--dark-green)", "color":"white"})}
                            onClick={() => {setCurrentPage("personal")}}>
                        Personal Info
                    </button>
                </div>
                <div id='info_content'>
                    {currentPage === "trash" && <User_Trash_Info user={props.user}/>}
                    {currentPage === "personal" && <User_Personal_Info user={props.user}/>}
                </div>
            </div>
        </>
    )
}

export default Page_User