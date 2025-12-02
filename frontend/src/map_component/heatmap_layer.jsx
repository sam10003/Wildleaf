import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

/**
 * Custom Heatmap Layer Component for Leaflet
 * Displays IUCN plant occurrence data as a heatmap with zoom-aware settings
 */
function HeatmapLayer({ heatmapData }) {
    const map = useMap();
    const heatmapLayerRef = useRef(null);

    useEffect(() => {
        if (!heatmapData || !heatmapData.points || heatmapData.points.length === 0) {
            return;
        }

        // Function to update heatmap based on zoom level
        const updateHeatmap = () => {
            const zoom = map.getZoom();
            
            // Zoom-aware settings: smaller radius and lower intensity when zoomed out
            let radius, blur, minOpacity, max;
            
            if (zoom < 7) {
                // Very zoomed out - minimal intensity
                radius = 8;
                blur = 8;
                minOpacity = 0.2;
                max = 0.6;
            } else if (zoom < 9) {
                // Zoomed out - reduced intensity
                radius = 12;
                blur = 10;
                minOpacity = 0.3;
                max = 0.7;
            } else if (zoom < 11) {
                // Medium zoom
                radius = 18;
                blur = 12;
                minOpacity = 0.4;
                max = 0.85;
            } else {
                // Zoomed in - full intensity
                radius = 25;
                blur = 15;
                minOpacity = 0.5;
                max = 1.0;
            }

            // Remove existing layer if it exists
            if (heatmapLayerRef.current) {
                map.removeLayer(heatmapLayerRef.current);
                heatmapLayerRef.current = null;
            }

            // Create new heatmap layer with zoom-appropriate settings
            const newLayer = L.heatLayer(heatmapData.points, {
                radius: radius,
                blur: blur,
                maxZoom: 18,
                minOpacity: minOpacity,
                max: max,
                gradient: {           // Softer gradient to avoid too much red
                    0.0: 'blue',      // Low intensity - blue
                    0.2: 'cyan',      // Medium-low - cyan
                    0.4: 'lime',      // Medium - lime green
                    0.6: 'yellow',    // Medium-high - yellow
                    0.8: 'orange',    // High - orange
                    1.0: 'red'        // Very high - red
                }
            });

            newLayer.addTo(map);
            heatmapLayerRef.current = newLayer;
        };

        // Initial creation
        updateHeatmap();

        // Update on zoom change
        map.on('zoomend', updateHeatmap);

        // Cleanup function
        return () => {
            map.off('zoomend', updateHeatmap);
            if (heatmapLayerRef.current) {
                map.removeLayer(heatmapLayerRef.current);
                heatmapLayerRef.current = null;
            }
        };
    }, [map, heatmapData]);

    return null; // This component doesn't render anything visible
}

export default HeatmapLayer;

