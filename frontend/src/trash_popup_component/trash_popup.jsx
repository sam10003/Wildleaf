import './trash_popup.css'
import cancel_icon from '../assets/x.svg'
import Add_Trash from './add_trash_component/add_trash'
import Validation from './validation_component/validation'
import { useState } from 'react'

function Trash_Popup(props) {

    const [ endForm, setEndForm ] = useState(false)

    const handleSubmit = (values) => {
        console.log("Form submitted: " + values);
        setEndForm(true);
    }

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