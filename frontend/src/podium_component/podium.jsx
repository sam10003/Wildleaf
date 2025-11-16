import './podium.css'
import leaf_icon from "../assets/leaf-fill.svg"

function Podium(props) {

    return (
        <>
            <div id='podium_container'>
                <div>
                    <h3></h3>
                    <div id='second_place'>
                        <img class="left_leaf" src={leaf_icon} alt="leaf"/>
                        <h2>2</h2>
                        <img class="right_leaf" src={leaf_icon} alt="leaf"/>
                    </div>
                </div>
                <div>
                    <h3></h3>
                    <div id='first_place'>
                        <img class="left_leaf" src={leaf_icon} alt="leaf"/>
                        <h2>1</h2>
                        <img class="right_leaf" src={leaf_icon} alt="leaf"/>
                    </div>
                </div>
                <div>
                    <h3></h3>
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