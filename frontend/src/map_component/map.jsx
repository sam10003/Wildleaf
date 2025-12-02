import './map.css'
import { useState, useEffect } from 'react';
import Map_Result from '../map_result_component/map_result';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';

import FitBounds from './fit_bounds.jsx';
import HeatmapLayer from './heatmap_layer.jsx';
import TrashMarkers from './trash_markers.jsx';
import { fetchHeatmapData } from '../services/heatmapService.js';
import { fetchTrashCleanings } from '../services/trashService.js';

function Map(props) {
    const [regions, setRegions] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [heatmapData, setHeatmapData] = useState(null);
    const [heatmapLoading, setHeatmapLoading] = useState(true);
    const [trashCleanings, setTrashCleanings] = useState([]);

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

    useEffect(() => {
        // Fetch heatmap data when component mounts
        const loadHeatmapData = async () => {
            setHeatmapLoading(true);
            try {
                const data = await fetchHeatmapData();
                setHeatmapData(data);
                console.log(`✅ Loaded ${data.totalPoints} heatmap points from ${data.totalPlants} plants`);
            } catch (err) {
                console.error('Failed to load heatmap data:', err);
            } finally {
                setHeatmapLoading(false);
            }
        };
        
        loadHeatmapData();
    }, []);

    useEffect(() => {
        // Fetch trash cleanings when component mounts or accessToken changes
        const loadTrashCleanings = async () => {
            if (props.accessToken) {
                try {
                    const trash = await fetchTrashCleanings(props.accessToken);
                    setTrashCleanings(trash);
                    console.log(`✅ Loaded ${trash.length} trash cleanings`);
                } catch (err) {
                    console.error('Failed to load trash cleanings:', err);
                    setTrashCleanings([]);
                }
            } else {
                setTrashCleanings([]);
            }
        };
        
        loadTrashCleanings();
    }, [props.accessToken]);

    const handleClickRegion = (region, layer) => {
        // Function to update boundary style based on zoom level
        const updateBoundaryStyle = () => {
            const mapInstance = layer._map;
            if (!mapInstance) return;
            
            const zoom = mapInstance.getZoom();
            let weight, opacity;
            
            if (zoom < 7) {
                // Very zoomed out - thinner, more transparent
                weight = 1.5;
                opacity = 0.5;
            } else if (zoom < 9) {
                // Zoomed out - medium
                weight = 2;
                opacity = 0.6;
            } else {
                // Zoomed in - full visibility
                weight = 2.5;
                opacity = 0.85;
            }

            layer.setStyle({
                color: '#00ff00',
                weight: weight,
                opacity: opacity,
                fillColor: 'transparent',
                fillOpacity: 0
            });
        };

        // Initial style - simpler, non-zoom-aware initially
        layer.setStyle({
            color: '#00ff00',
            weight: 2,
            opacity: 0.7,
            fillColor: 'transparent',
            fillOpacity: 0
        });

        // Update style on zoom changes
        const mapInstance = layer._map;
        if (mapInstance) {
            mapInstance.on('zoomend', updateBoundaryStyle);
        }

        // Add hover effect
        layer.on({
            mouseover: (e) => {
                layer.setStyle({
                    color: '#00ff00',
                    weight: 3,
                    opacity: 1,
                    fillColor: 'transparent',
                    fillOpacity: 0
                });
            },
            mouseout: (e) => {
                updateBoundaryStyle();
            },
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
            
            {/* Heatmap layer for IUCN plant occurrences */}
            {props.showHeatmap !== false && heatmapData && heatmapData.points && heatmapData.points.length > 0 && (
                <HeatmapLayer heatmapData={heatmapData} />
            )}
            
            {/* Trash cleaning markers */}
            {props.showTrash !== false && trashCleanings && trashCleanings.length > 0 && (
                <TrashMarkers trashCleanings={trashCleanings} />
            )}
            
            {/* GeoJSON boundaries for autonomous communities - keep clickable */}
            {regions && (
              <>
                <GeoJSON 
                    key="regions-boundaries"
                    data={regions} 
                    onEachFeature={handleClickRegion}
                    style={{
                        color: '#00ff00',
                        weight: 2,
                        opacity: 0.7,
                        fillColor: 'transparent',
                        fillOpacity: 0
                    }}
                />
                <FitBounds geoJson={regions}/>
              </>
            )}
            
            {/* Loading indicator for heatmap */}
            {heatmapLoading && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    zIndex: 1000,
                    fontSize: '14px'
                }}>
                    Loading plant occurrence heatmap...
                </div>
            )}
        </MapContainer>
    );
}

export default Map;
