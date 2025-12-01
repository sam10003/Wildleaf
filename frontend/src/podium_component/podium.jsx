import './podium.css'
import leaf_icon from "../assets/leaf-fill.svg"

function Podium(props) {

    console.log(props.users)

    return (
        <>
            <div id='podium_container'>
                <div>
                    {props.users[1] && <h3>{props.users[1].name} : {props.users[1].score}</h3>}
                    <div id='second_place'>
                        <img class="left_leaf" src={leaf_icon} alt="leaf"/>
                        <h2>2</h2>
                        <img class="right_leaf" src={leaf_icon} alt="leaf"/>
                    </div>
                </div>
                <div>
                    {props.users[0] && <h3>{props.users[0].name} : {props.users[0].score}</h3>}
                    <div id='first_place'>
                        <img class="left_leaf" src={leaf_icon} alt="leaf"/>
                        <h2>1</h2>
                        <img class="right_leaf" src={leaf_icon} alt="leaf"/>
                    </div>
                </div>
                <div>
                    {props.users[2] && <h3>{props.users[2].name} : {props.users[2].score}</h3>}
                    <div id='third_place'>
                        <img class="left_leaf" src={leaf_icon} alt="leaf"/>
                        <h2>3</h2>
                        <img class="right_leaf" src={leaf_icon} alt="leaf"/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Podium