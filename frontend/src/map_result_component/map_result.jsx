import './map_result.css'
import Plant_Details from '../plant_details_component/plant_details.jsx'

function Map_Result(props) {

    return (
        <>
            <div id='map_results_container'>
                <div id='title_container'>
                    <h2>Plants in {props.region}</h2>
                </div>
                <div id='search_container'>
                    <input id='search_field' type="text" placeholder='search plants...'/>
                </div>
                <div id='plants_container'>
                    <Plant_Details/>
                    <Plant_Details/>
                    <Plant_Details/>
                    <Plant_Details/>
                    <Plant_Details/>
                    <Plant_Details/>
                    <Plant_Details/>
                    <Plant_Details/>
                    <Plant_Details/>
                    <Plant_Details/>
                    <Plant_Details/>
                </div>
            </div>
        </>
    )
}

export default Map_Result