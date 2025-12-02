/**
 * Service to fetch endangered plants by region (progressive/streaming)
 */

const API_BASE_URL = 'http://localhost:5000/IUCN';

/**
 * Fetch endangered plants for a specific region with progressive updates
 * @param {string} regionName - The GeoJSON region name (e.g., "Cataluña", "Andalucía")
 * @param {Function} onPlantFound - Callback called when a plant is found (plant) => void
 * @param {Function} onProgress - Callback called for progress updates (progress) => void
 * @returns {Function} - Cleanup function to close the connection
 */
export function fetchPlantsByRegionProgressive(regionName, onPlantFound, onProgress) {
  const eventSource = new EventSource(`${API_BASE_URL}/plants/${encodeURIComponent(regionName)}`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'plant') {
        // A new plant was found - add it immediately
        if (onPlantFound) {
          onPlantFound(data.plant);
        }
      } else if (data.type === 'progress') {
        // Progress update
        if (onProgress) {
          onProgress(data);
        }
      } else if (data.type === 'complete') {
        // All done
        if (onProgress) {
          onProgress({ complete: true, ...data });
        }
        eventSource.close();
      } else if (data.type === 'start') {
        // Connection started
        if (onProgress) {
          onProgress({ started: true, region: data.region });
        }
      }
    } catch (err) {
      console.error('Error parsing SSE data:', err);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    eventSource.close();
    if (onProgress) {
      onProgress({ error: true });
    }
  };
  
  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

