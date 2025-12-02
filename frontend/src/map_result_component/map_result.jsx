import './map_result.css'
import Plant_Details from '../plant_details_component/plant_details.jsx'
import cancel_icon from '../assets/x.svg'
import { useState, useEffect } from 'react'
import { fetchPlantsByRegionProgressive } from '../services/plantService.js'

function Map_Result(props) {
    const [isVisible, setIsVisible] = useState(false);
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [progress, setProgress] = useState({ checked: 0, total: 0 });

    useEffect(() => {
        // Trigger animation when component mounts
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Fetch plants progressively when region changes
        if (!props.region) return;

        setLoading(true);
        setPlants([]);
        setProgress({ checked: 0, total: 0 });

        // Use progressive fetching - plants appear as they're found!
        const cleanup = fetchPlantsByRegionProgressive(
            props.region,
            // onPlantFound - called immediately when a plant is found
            (plant) => {
                setPlants(prevPlants => {
                    // Check for duplicates
                    if (prevPlants.find(p => p.scientificName === plant.scientificName)) {
                        return prevPlants;
                    }
                    // Turn off loading when first plant arrives
                    if (prevPlants.length === 0) {
                        setLoading(false);
                    }
                    // Add new plant and sort by occurrence count
                    const updated = [...prevPlants, plant];
                    return updated.sort((a, b) => (b.occurrenceCount || 0) - (a.occurrenceCount || 0));
                });
            },
            // onProgress - called for progress updates
            (progressData) => {
                if (progressData.complete) {
                    setLoading(false);
                } else if (progressData.checked !== undefined) {
                    setProgress({
                        checked: progressData.checked,
                        total: progressData.total || 0,
                        found: progressData.found || 0
                    });
                }
            }
        );

        // Cleanup: close connection when component unmounts or region changes
        return cleanup;
    }, [props.region]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (props.onClose) {
                props.onClose();
            }
        }, 300);
    };

    // Filter plants by search query
    const filteredPlants = plants.filter(plant => 
        plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div 
                id='map_results_container' 
                className={isVisible ? 'slide-in' : 'slide-out'}
            >
                <button id='close_button' onClick={handleClose}>
                    <img src={cancel_icon} alt="close" />
                </button>
                <div id='title_container'>
                    <h2>Plants in {props.region}</h2>
                </div>
                <div id='search_container'>
                    <input 
                        id='search_field' 
                        type="text" 
                        placeholder='search plants...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div id='plants_container'>
                    {loading && plants.length === 0 ? (
                        <div style={{padding: '2vh', color: 'white', textAlign: 'center'}}>
                            Loading plants...
                            {progress.total > 0 && (
                                <div style={{fontSize: '0.9em', marginTop: '0.5vh', opacity: 0.8}}>
                                    Checking {progress.checked}/{progress.total} plants...
                                </div>
                            )}
                        </div>
                    ) : filteredPlants.length === 0 && !loading ? (
                        <div style={{padding: '2vh', color: 'white', textAlign: 'center'}}>
                            {searchQuery ? 'No plants found matching your search.' : 'No endangered plants found in this region.'}
                        </div>
                    ) : (
                        <>
                            {loading && plants.length > 0 && (
                                <div style={{padding: '1vh', color: 'white', textAlign: 'center', fontSize: '0.9em', opacity: 0.8}}>
                                    Found {plants.length} plants... checking more ({progress.checked}/{progress.total})...
                                </div>
                            )}
                            {filteredPlants.map((plant, index) => (
                                <Plant_Details 
                                    key={plant.scientificName || index}
                                    plant={plant}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default Map_Result