import './button.css'

function Button(props) {

    return (
        <>
            <button id='button' onClick={props.onClick} type={props.type}>
                {props.img && <img src={props.img} alt="button"/>}
                {props.text && <p>{props.text}</p>}
            </button>
        </>
    )
}

export default Button