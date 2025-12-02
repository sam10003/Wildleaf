/**
 * Service to fetch heatmap data for IUCN plant occurrences
 */

const API_BASE_URL = 'http://52.203.48.52:5000/IUCN';

/**
 * Fetch occurrence coordinates for heatmap visualization
 * @returns {Promise<Object>} - Object containing points array [[lat, lng, intensity], ...]
 */
export async function fetchHeatmapData() {
  try {
    const response = await fetch(`${API_BASE_URL}/heatmap/occurrences`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch heatmap data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return { points: [], totalPlants: 0, totalPoints: 0 };
  }
}

