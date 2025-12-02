/**
 * Service to fetch trash cleanings from the backend
 */

const API_BASE_URL = 'http://localhost:5000';

/**
 * Fetch all trash cleanings for the logged-in user
 * @param {string} accessToken - Authentication token
 * @returns {Promise<Array>} - Array of trash cleaning objects with coordinates
 */
export async function fetchTrashCleanings(accessToken) {
  if (!accessToken) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/trash/all`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to fetch trash cleanings:', response.status);
      return [];
    }

    const data = await response.json();
    
    // Transform data to ensure we have coordinates in the correct format
    return data.map(trash => ({
      ...trash,
      coordinates: trash.location?.coordinates || null, // [longitude, latitude]
      latitude: trash.location?.coordinates?.[1] || null,
      longitude: trash.location?.coordinates?.[0] || null,
    })).filter(trash => trash.coordinates && trash.coordinates.length === 2);
  } catch (error) {
    console.error('Error fetching trash cleanings:', error);
    return [];
  }
}

