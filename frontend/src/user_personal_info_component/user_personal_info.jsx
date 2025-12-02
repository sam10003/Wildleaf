import './user_personal_info.css'
import Button from '../button_component/button'
import Delete_Popup from './delete_popup_component/delete_popup';

import { useState } from 'react'

function User_Personal_Info(props) {

    const [ displayDelete, setDisplayDelete ] = useState(false);

    return (
        <>
            <div id='user_personal_info_container'>
                <h2>Email : </h2>
                <p>{props.user.email}</p>
                <h2>Name : </h2>
                <p>{props.user.name}</p>
                <Button text="Delete Account" onClick={() => {setDisplayDelete(true)}}/>
            </div>
            {displayDelete && <Delete_Popup onClickClose={() => {setDisplayDelete(false)}}
                                            changeCurrentPage={props.changeCurrentPage}
                                            accessToken={props.accessToken}
                                            setUser={props.setUser}
                                            setAccessToken={props.setAccessToken}/>}
        </>
    )
}

export default User_Personal_Info