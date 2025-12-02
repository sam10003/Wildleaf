import './plant_details.css'
import default_plant_picture from "../assets/default_plant.jpg"
import { useState, useEffect, memo } from 'react'
import { fetchPlantImageFromWikidata } from '../services/plantImageService.js'

function Plant_Details(props) {
    const plant = props.plant || {};
    const [imageUrl, setImageUrl] = useState(plant.imageUrl || default_plant_picture);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    
    // Update image URL when plant changes
    useEffect(() => {
        setImageUrl(plant.imageUrl || default_plant_picture);
    }, [plant.imageUrl]);

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
    const description = plant.gbifData?.description || plant.gbifData?.vernacularNames?.[0]?.vernacularName || 'No description available.';

    const handleImageError = async (e) => {
        // If default image also fails, stop trying
        if (e.target.src === default_plant_picture || e.target.src.includes('default_plant')) {
            return;
        }
        
        // If current image failed, try fetching from Wikidata
        if (plant.scientificName && !isLoadingImage) {
            setIsLoadingImage(true);
            const wikidataImage = await fetchPlantImageFromWikidata(plant.scientificName);
            
            if (wikidataImage) {
                setImageUrl(wikidataImage);
            } else {
                // Fallback to default image
                setImageUrl(default_plant_picture);
            }
            setIsLoadingImage(false);
        } else {
            // Fallback to default image
            setImageUrl(default_plant_picture);
        }
    };

    return (
        <>
            <div id='plant_container'>
                <div id='plant_detail_first_layer_container'>
                    <img 
                        src={imageUrl} 
                        alt={plant.scientificName || 'plant'} 
                        onError={handleImageError}
                        loading="lazy"
                        decoding="async"
                        style={{ opacity: isLoadingImage ? 0.5 : 1 }}
                    />
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

export default memo(Plant_Details);