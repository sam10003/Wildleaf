/**
 * Service to fetch plant images from Wikidata
 */

/**
 * Fetch plant image from Wikidata by scientific name
 * @param {string} scientificName - Scientific name of the plant
 * @returns {Promise<string|null>} - URL of the image or null
 */
export async function fetchPlantImageFromWikidata(scientificName) {
  try {
    // First, search for the plant on Wikidata
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(scientificName)}&language=en&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    
    if (!searchRes.ok) return null;
    
    const searchData = await searchRes.json();
    if (!searchData.search || searchData.search.length === 0) return null;
    
    const itemId = searchData.search[0].id;
    if (!itemId) return null;
    
    // Get the entity with image property
    const itemUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${itemId}&props=claims&format=json&origin=*`;
    const itemRes = await fetch(itemUrl);
    
    if (!itemRes.ok) return null;
    
    const itemData = await itemRes.json();
    const entity = itemData.entities?.[itemId];
    if (!entity || !entity.claims) return null;
    
    // Get image from P18 property (image)
    const imageClaims = entity.claims.P18;
    if (!imageClaims || imageClaims.length === 0) return null;
    
    const imageFileName = imageClaims[0].mainsnak?.datavalue?.value;
    if (!imageFileName) return null;
    
    // Construct Wikimedia Commons URL
    const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageFileName)}?width=800`;
    
    return imageUrl;
  } catch (err) {
    console.warn('Error fetching image from Wikidata:', err);
    return null;
  }
}

