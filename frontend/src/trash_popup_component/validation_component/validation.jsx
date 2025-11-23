import './validation.css'
import Button from '../../button_component/button'

function Validation(props) {

    return (
        <>
            <div id='validation_container_content'>
                <h2>Thank you for your dedication!</h2>
                <p>Your trash cleaning has been registered</p>
                <Button text="OK" onClick={props.onClick}/>
            </div>
        </>
    )
}

export default Validation