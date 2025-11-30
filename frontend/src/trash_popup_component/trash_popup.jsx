import './trash_popup.css'
import cancel_icon from '../assets/x.svg'
import Add_Trash from './add_trash_component/add_trash'
import Validation from './validation_component/validation'
import { useState } from 'react'

function Trash_Popup(props) {

    const [ endForm, setEndForm ] = useState(false);

    const [log, setLog] = useState("");
    const append = (msg) => setLog((l) => l + "\n" + msg);

    console.log(props.accessToken)
    console.log(props.user)

    const handleSubmit = async (values) => {
        if (!props.accessToken) return append("No access token.");

        const formData = new FormData();
        formData.append("beforePhoto", values.img_before);
        formData.append("afterPhoto", values.img_after);
        formData.append("latitude", values.latitude);
        formData.append("longitude", values.longitude);
        formData.append("createdAt", values.date);

        try {
        const res = await fetch("http://localhost:5000/trash/create", {
            method: "POST",
            headers: {
            Authorization: `Bearer ${props.accessToken}`,
            },
            credentials: "include",
            body: formData,
        });

        const data = await res.json();
            append("POST /trash/create → " + JSON.stringify(data, null, 2));
        } catch (err) {
            append("Error creating trash: " + err.message);
        }

        setEndForm(true);
    };

    return (
        <>
            <div id='trash_popup_container'>
                {!endForm && 
                    <div id="add_trash_container">
                        <img id='btn_close' src={cancel_icon} alt="close_popup" onClick={props.onClickClose}/>
                        <Add_Trash handleSubmit={handleSubmit} onClick={props.onClickClose}/>
                    </div>
                }
                {endForm && 
                    <div id="validation_container">
                        <img id='btn_close' src={cancel_icon} alt="close_popup"/>
                        <Validation onClick={props.onClickClose}/>
                    </div>
                }
            </div>
        </>
    )
}

export default Trash_Popup