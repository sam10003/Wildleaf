import './trash_details.css'
import default_plant_picture from "../assets/default_plant.jpg"

function Trash_Details(props) {

    return (
        <>
            <div id='trash_container'>
                <div id='trash_detail_first_layer_container'>
                    <div id='after_img_container'>
                        <img src={default_plant_picture} alt="" />
                        <p>Before</p>
                    </div>
                    <div id='before_img_container'>
                        <img src={default_plant_picture} alt="" />
                        <p>After</p>
                    </div>
                </div>
                <div id='trash_detail_second_layer_container'>
                    <h3>Cleaned by aluso</h3>
                    <p>On the 20/10/2025 at 24.2 -45.2</p>
                </div>
            </div>
        </>
    )
}

export default Trash_Details