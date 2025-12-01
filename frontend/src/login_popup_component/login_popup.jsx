import './login_popup.css'
import google_icon from '../assets/google.svg'
import cancel_icon from '../assets/x.svg'

function Login_Popup(props) {

    return (
        <>
            <div id='login_popup_container'>
                <div id='login_popup_content'>
                    <img id='btn_close' src={cancel_icon} alt="close_popup" onClick={props.onClickClose}/>
                    <h1>Login</h1>
                    <button id='btn_login' onClick={props.onClick}>
                        <img src={google_icon} alt="google" />
                        Connect with Google
                    </button>
                </div>
            </div>
        </>
    )
}

export default Login_Popup