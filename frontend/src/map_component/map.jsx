import './map.css'
import { useState, useEffect } from 'react';
import Map_Result from '../map_result_component/map_result';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';

import FitBounds from './fit_bounds.jsx';

function Map(props) {
    const [regions, setRegions] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchRegionsData = () => {
        setLoading(true);    // loading state
        setError(false);     // error catching

        fetch('/Wildleaf/spain_regions.geojson')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`.map: HTTP error -- status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setRegions(data);   // grabbing spain
            })
            .catch(err => {
                console.error('.map: Failed to load regions:', err);
                setError(true);     // show error state
            })
            .finally(() => {
                setLoading(false);  // stop loading completely
            });
    };

    useEffect(() => {
        fetchRegionsData();
    }, []);

    const handleClickRegion = (region, layer) => {
        layer.on({
            click: () => {
                console.log(`You clicked on: ${region.properties.name}`);
                props.selectRegion(region.properties.name);
            }
        });
    };

    if (loading) return <div>Loading map…</div>;
    if (error) return <div>Failed to load regions. Try again later.</div>;

    return (
        <MapContainer center={[40.4168, -3.7038]} zoom={6}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {regions && (
              <>
                <GeoJSON data={regions} onEachFeature={handleClickRegion} />
                <FitBounds geoJson={regions}/>
              </>
            )}
        </MapContainer>
    );
}

export default Map;
