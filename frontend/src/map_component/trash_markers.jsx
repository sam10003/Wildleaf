import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import './trash_markers.css';

/**
 * Component to display trash cleaning markers on the map with hover photo preview
 */
function TrashMarkers({ trashCleanings }) {
    const map = useMap();
    const markersRef = useRef([]);
    const hoverPopupRef = useRef(null);

    useEffect(() => {
        if (!trashCleanings || trashCleanings.length === 0) {
            // Clean up existing markers
            markersRef.current.forEach(marker => {
                map.removeLayer(marker);
            });
            markersRef.current = [];
            return;
        }

        // Create a custom icon for trash markers
        const trashIcon = L.divIcon({
            className: 'trash-marker-icon',
            html: '<div class="trash-marker-inner">🗑️</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        // Clear existing markers
        markersRef.current.forEach(marker => {
            map.removeLayer(marker);
        });
        markersRef.current = [];

        // Create markers for each trash cleaning
        trashCleanings.forEach(trash => {
            if (!trash.coordinates || trash.coordinates.length !== 2) {
                return;
            }

            const [lng, lat] = trash.coordinates;

            // Validate coordinates
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn('Invalid coordinates for trash:', trash);
                return;
            }

            // Create marker
            const marker = L.marker([lat, lng], { icon: trashIcon });

            // Create hover popup for photo preview
            const hoverPopup = L.popup({
                className: 'trash-hover-popup',
                offset: [0, -35],
                closeButton: false,
                autoPan: false
            });

            // Show photos on hover (horizontal layout)
            marker.on('mouseover', (e) => {
                if (trash.beforePhotoURL || trash.afterPhotoURL) {
                    let hoverContent = '<div class="trash-hover-preview">';
                    
                    // User name
                    if (trash.userEmail) {
                        hoverContent += `<div class="trash-hover-username">${trash.userEmail}</div>`;
                    }
                    
                    // Photos horizontally
                    hoverContent += '<div class="trash-hover-images">';
                    
                    if (trash.beforePhotoURL) {
                        hoverContent += `
                            <div class="trash-hover-image-wrapper">
                                <span class="trash-hover-label">Before</span>
                                <img src="${trash.beforePhotoURL}" alt="Before cleanup" />
                            </div>
                        `;
                    }
                    
                    if (trash.afterPhotoURL) {
                        hoverContent += `
                            <div class="trash-hover-image-wrapper">
                                <span class="trash-hover-label">After</span>
                                <img src="${trash.afterPhotoURL}" alt="After cleanup" />
                            </div>
                        `;
                    }
                    
                    hoverContent += '</div></div>';
                    
                    hoverPopup.setContent(hoverContent);
                    hoverPopup.setLatLng(e.latlng);
                    hoverPopup.openOn(map);
                    hoverPopupRef.current = hoverPopup;
                }
            });

            // Close hover popup on mouseout
            marker.on('mouseout', () => {
                if (hoverPopupRef.current) {
                    map.closePopup(hoverPopupRef.current);
                    hoverPopupRef.current = null;
                }
            });

            // No click popup - hover only

            marker.addTo(map);
            markersRef.current.push(marker);
        });

        // Cleanup function
        return () => {
            markersRef.current.forEach(marker => {
                map.removeLayer(marker);
            });
            markersRef.current = [];
            if (hoverPopupRef.current) {
                map.closePopup(hoverPopupRef.current);
                hoverPopupRef.current = null;
            }
        };
    }, [map, trashCleanings]);

    return null;
}

export default TrashMarkers;

