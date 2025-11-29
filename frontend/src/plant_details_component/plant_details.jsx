import './plant_details.css'
import default_plant_picture from "../assets/default_plant.jpg"

function Plant_Details(props) {

    return (
        <>
            <div id='plant_container'>
                <div id='plant_detail_first_layer_container'>
                    <img src={default_plant_picture} alt="default_plant"/>
                    <div id='plant_details_main_info_container'>
                        <h2>Name</h2>
                        <h3>Who Am I?</h3>
                        <p>Main info</p>
                    </div>
                </div>
                <div id='plant_detail_second_layer_container'>
                    <h3>How to save me?</h3>
                    <p>Main info</p>
                </div>
            </div>
        </>
    )
}

export default Plant_Details