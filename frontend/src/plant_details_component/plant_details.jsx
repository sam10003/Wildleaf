import './plant_details.css'
import default_plant_picture from "../assets/default_plant.jpg"

function Plant_Details(props) {
    const plant = props.plant || {};

    // IUCN status labels
    const iucnStatusLabels = {
        'EX': 'Extinct',
        'EW': 'Extinct in the Wild',
        'CR': 'Critically Endangered',
        'EN': 'Endangered',
        'VU': 'Vulnerable',
        'NT': 'Near Threatened',
        'DD': 'Data Deficient',
        'NE': 'Not Evaluated'
    };

    const iucnStatus = iucnStatusLabels[plant.iucnStatus] || plant.iucnStatus || 'Unknown';
    const imageUrl = plant.imageUrl || default_plant_picture;
    const description = plant.gbifData?.description || plant.gbifData?.vernacularNames?.[0]?.vernacularName || 'No description available.';

    return (
        <>
            <div id='plant_container'>
                <div id='plant_detail_first_layer_container'>
                    <img src={imageUrl} alt={plant.scientificName || 'plant'} onError={(e) => {
                        e.target.src = default_plant_picture;
                    }}/>
                    <div id='plant_details_main_info_container'>
                        <h2>{plant.scientificName || 'Unknown Plant'}</h2>
                        <h3>Who Am I?</h3>
                        <p>{description}</p>
                    </div>
                </div>
                <div id='plant_detail_second_layer_container'>
                    <h3>Conservation Status</h3>
                    <p>
                        IUCN Status: <strong>{iucnStatus}</strong>
                        {plant.occurrenceCount && (
                            <> • Found in {plant.occurrenceCount} occurrence{plant.occurrenceCount !== 1 ? 's' : ''} in this region</>
                        )}
                    </p>
                </div>
            </div>
        </>
    )
}

export default Plant_Details