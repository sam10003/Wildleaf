import './map_result.css'
import Plant_Details from '../plant_details_component/plant_details.jsx'
import cancel_icon from '../assets/x.svg'
import { useState, useEffect } from 'react'

function Map_Result(props) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation when component mounts - small delay to ensure initial render completes
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for animation to complete before closing
        setTimeout(() => {
            if (props.onClose) {
                props.onClose();
            }
        }, 300); // Match animation duration
    };

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