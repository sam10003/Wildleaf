import './delete_popup.css'
import Button from '../../button_component/button'

import { useState } from 'react';

function Delete_Popup(props) {

    const [ log, setLog ] = useState("");
    const append = (msg) => setLog((l) => l + "\n" + msg);

    const handleDelete = async () => {
        if (!props.accessToken) return append("No access token available");
        try {
            const res = await fetch("http://localhost:5000/user/delete", {
                method: "DELETE",
                headers: {
                Authorization: `Bearer ${props.accessToken}`,
                "Content-Type": "application/json",
                },
                credentials: "include",
            });
            const data = await res.json();
            props.setAccessToken("");
            props.setUser(null);
            localStorage.removeItem("accessToken");
            
            append("Account deleted → " + JSON.stringify(data, null, 2));
        } catch (err) {
            append("Delete error: " + err.message);
        }
        props.changeCurrentPage("map");
    };

    return (
        <>
            <div id='delete_popup_container'>
                <div id='delete_popup_content'>
                    <div>{log}</div>
                    <h1>Do you really want to delete your account?</h1>
                    <div>
                        <Button text="Delete" onClick={handleDelete}/>
                        <Button text="Cancel" onClick={props.onClickClose}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Delete_Popup