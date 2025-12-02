import express from 'express';
import fetch from 'node-fetch';
import Canon from '../models/Canon_list.js';

const router = express.Router();

// Helper function for rate-limited GBIF API calls with retry logic
async function fetchWithRetry(url, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      
      // Handle 429 (Too Many Requests) with exponential backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
        console.warn(`Rate limited (429). Waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Handle other errors
      if (!response.ok && response.status !== 404) {
        if (attempt === maxRetries - 1) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (err) {
      if (attempt === maxRetries - 1) {
        throw err;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Map GeoJSON region names to GBIF stateProvince names
function getGBIFRegionName(geojsonName) {
  const mapping = {
    "Navarra, Comunidad Foral de": "Navarra",
    "País Vasco": "Pais Vasco",
    "La Rioja": "La Rioja",
    "Cataluña": "Catalonia",
    "Aragon": "Aragon",
    "Extremadura": "Extremadura",
    "Galicia": "Galicia",
    "Castilla y León": "Castilla y Leon",
    "Comunidad Valenciana": "Valencia",
    "Murcia": "Murcia",
    "Andalucía": "Andalucia",
    "Asturias": "Asturias",
    "Cantabria": "Cantabria",
    "Islas Canarias": "Canarias",
    "Islas Baleares": "Balears",
    "Castilla la Mancha": "Castilla-La Mancha",
    "Comunidad de Madrid": "Madrid",
    "Ceuta": "Ceuta",
    "Melilla": "Melilla"
  };
  return mapping[geojsonName] || geojsonName;
}

// Get all IUCN endangered plants for a specific region (streaming/progressive)
router.get('/plants/:region', async (req, res) => {
  // Set headers for Server-Sent Events (SSE) - progressive streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const regionName = req.params.region;
    const gbifRegionName = getGBIFRegionName(regionName);
    
    console.log(`Fetching IUCN plants for region: ${regionName} (GBIF: ${gbifRegionName})`);
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'start', region: regionName })}\n\n`);

    // Get ALL IUCN plants from collection (no status filter - they're all pre-picked)
    const allIUCNPlants = await Canon.find().select('name state -_id');

    console.log(`📋 Found ${allIUCNPlants.length} IUCN plants to check for region: ${gbifRegionName}`);
    
    if (allIUCNPlants.length === 0) {
      return res.json({ plants: [], region: regionName, message: 'No IUCN plants found in database' });
    }

    const plantsInRegion = [];
    const batchSize = 5; // Reduced batch size to avoid rate limiting
    let checkedCount = 0;

    // Process ALL plants - don't stop early!
    for (let i = 0; i < allIUCNPlants.length; i += batchSize) {
      const batch = allIUCNPlants.slice(i, i + batchSize);
      
      // Process batch sequentially to avoid rate limiting
      for (const plant of batch) {
        checkedCount++;
        try {
          // Query GBIF: Does this plant have occurrences in this region?
          // Try with stateProvince first
          let apiUrl = `https://api.gbif.org/v1/occurrence/search?` +
            `scientificName=${encodeURIComponent(plant.name)}` +
            `&country=ES` +
            `&stateProvince=${encodeURIComponent(gbifRegionName)}` +
            `&kingdom=Plantae` +
            `&hasCoordinate=true` +
            `&limit=10`; // Get more results to better check occurrence count

          let response = await fetchWithRetry(apiUrl, 3, 2000);
          let data = null;
          
          if (response && response.ok) {
            data = await response.json();
          }

          // If no results with stateProvince, try without it and filter manually
          if (!data || data.count === 0) {
            // First check if plant exists in Spain at all
            apiUrl = `https://api.gbif.org/v1/occurrence/search?` +
              `scientificName=${encodeURIComponent(plant.name)}` +
              `&country=ES` +
              `&kingdom=Plantae` +
              `&hasCoordinate=true` +
              `&limit=300`; // Get more occurrences to check region manually
            
            // Add delay before second request
            await new Promise(resolve => setTimeout(resolve, 1000));
            response = await fetchWithRetry(apiUrl, 3, 2000);
            
            if (response && response.ok) {
              data = await response.json();
              
              // If plant exists in Spain, try to find it in our region
              if (data.results && data.results.length > 0) {
                // Filter results by stateProvince manually (flexible matching)
                const regionOccurrences = data.results.filter(occ => {
                  const occRegion = occ.stateProvince;
                  if (!occRegion) return false;
                  
                  // Normalize for comparison
                  const occNorm = occRegion.toLowerCase().trim();
                  const regionNorm = gbifRegionName.toLowerCase().trim();
                  
                  return occNorm === regionNorm ||
                         occNorm.includes(regionNorm) ||
                         regionNorm.includes(occNorm) ||
                         occNorm.replace(/[^a-z0-9]/g, '') === regionNorm.replace(/[^a-z0-9]/g, '');
                });
                
                if (regionOccurrences.length > 0) {
                  data.results = regionOccurrences;
                  data.count = regionOccurrences.length;
                } else {
                  // Plant exists in Spain but not in this region
                  data.count = 0;
                  data.results = [];
                }
              }
            }
          }
          
          if (!response || (!response.ok && response.status !== 404)) {
            if (response?.status === 429) {
              console.warn(`Rate limited (429) for ${plant.name}, skipping for now`);
            } else {
              console.warn(`GBIF API error for ${plant.name}: ${response?.status}`);
            }
            return;
          }

          if (!data) return;
          
          // If we found occurrences, this plant is in the region!
          if (data.count > 0 && data.results && data.results.length > 0) {
            const occurrence = data.results[0];
            
            // Get species key for additional details
            const speciesKey = occurrence.speciesKey;
            
            // Try to get species details from GBIF (non-blocking)
            let speciesData = null;
            if (speciesKey) {
              fetch(`https://api.gbif.org/v1/species/${speciesKey}`)
                .then(speciesRes => {
                  if (speciesRes.ok) {
                    return speciesRes.json();
                  }
                })
                .then(speciesInfo => {
                  if (speciesInfo && speciesInfo.kingdom === 'Plantae') {
                    // Update plant data if we're still in the same request
                    const plantIndex = plantsInRegion.findIndex(p => p.scientificName === plant.name);
                    if (plantIndex >= 0) {
                      plantsInRegion[plantIndex].gbifData = speciesInfo;
                    }
                  }
                })
                .catch(() => {}); // Silent fail
            }

            const plantData = {
              scientificName: plant.name,
              iucnStatus: plant.state,
              speciesKey: speciesKey || null,
              occurrenceCount: data.count,
              imageUrl: occurrence.media?.find(m => m.type === 'StillImage')?.identifier || null,
              gbifData: speciesData
            };

            plantsInRegion.push(plantData);
            
            // Send plant immediately as it's found (progressive rendering)
            res.write(`data: ${JSON.stringify({ type: 'plant', plant: plantData })}\n\n`);
            
            if (plantsInRegion.length % 5 === 0) {
              console.log(`Found ${plantsInRegion.length} plants so far (checked ${checkedCount}/${allIUCNPlants.length})`);
            }
          }
        } catch (err) {
          console.error(`Error checking ${plant.name} in ${gbifRegionName}:`, err);
        }
        
        // Add delay between each plant request to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Progress update - send to client
      if (checkedCount % 50 === 0 || checkedCount >= allIUCNPlants.length) {
        console.log(`Progress: Checked ${checkedCount}/${allIUCNPlants.length} plants, found ${plantsInRegion.length} so far`);
        res.write(`data: ${JSON.stringify({ type: 'progress', checked: checkedCount, total: allIUCNPlants.length, found: plantsInRegion.length })}\n\n`);
      }

      // Increased delay between batches to respect rate limits
      if (i + batchSize < allIUCNPlants.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between batches
      }
    }

    // Sort by occurrence count (most common first)
    plantsInRegion.sort((a, b) => (b.occurrenceCount || 0) - (a.occurrenceCount || 0));
    
    console.log(`✅ Found ${plantsInRegion.length} endangered plants in ${regionName} (checked ${allIUCNPlants.length} total plants)`);
    
    // Send completion message
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      plants: plantsInRegion,
      region: regionName,
      checked: allIUCNPlants.length,
      found: plantsInRegion.length
    })}\n\n`);
    
    res.end();

  } catch (err) {
    console.error('Error fetching plants by region:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
    res.end();
  }
});

// Get all IUCN plants (for frontend to use) - MUST come before /:index
router.get('/all', async (req, res) => {
  try {
    const docs = await Canon.find().select('name state -_id');
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server failed' });
  }
});

// Get occurrence coordinates for heatmap - all IUCN plants in Spain
router.get('/heatmap/occurrences', async (req, res) => {
  try {
    console.log('Fetching heatmap occurrence data...');
    
    // Get all IUCN plants
    const allIUCNPlants = await Canon.find().select('name -_id');
    console.log(`📋 Found ${allIUCNPlants.length} IUCN plants for heatmap`);
    
    const heatmapPoints = [];
    const batchSize = 3; // Much smaller batch size to avoid rate limiting
    let processedCount = 0;
    
    // Process plants in batches
    for (let i = 0; i < allIUCNPlants.length; i += batchSize) {
      const batch = allIUCNPlants.slice(i, i + batchSize);
      
      // Process sequentially within batch to avoid rate limiting
      for (const plant of batch) {
        try {
          // Fetch occurrences for this plant in Spain with coordinates
          const apiUrl = `https://api.gbif.org/v1/occurrence/search?` +
            `scientificName=${encodeURIComponent(plant.name)}` +
            `&country=ES` +
            `&kingdom=Plantae` +
            `&hasCoordinate=true` +
            `&limit=100`; // Limit to 100 occurrences per plant for performance
          
          const response = await fetchWithRetry(apiUrl, 3, 2000);
          
          if (response && response.ok) {
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              // Extract coordinates with intensity (we can weight by occurrence count later)
              data.results.forEach(occurrence => {
                if (occurrence.decimalLatitude && occurrence.decimalLongitude) {
                  // Filter out invalid coordinates
                  const lat = parseFloat(occurrence.decimalLatitude);
                  const lng = parseFloat(occurrence.decimalLongitude);
                  
                  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    heatmapPoints.push([lat, lng, 1]); // [lat, lng, intensity]
                  }
                }
              });
            }
          }
          
          processedCount++;
          
          // Delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          if (err.message && err.message.includes('429')) {
            console.warn(`Rate limited (429) for ${plant.name}, will retry`);
          } else {
            console.warn(`Error fetching occurrences for ${plant.name}:`, err.message);
          }
        }
      }
      
      // Progress update every 50 plants
      if (processedCount % 50 === 0) {
        console.log(`Processed ${processedCount}/${allIUCNPlants.length} plants, found ${heatmapPoints.length} points`);
      }
      
      // Increased delay between batches to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay between batches
    }
    
    console.log(`✅ Heatmap data ready: ${heatmapPoints.length} occurrence points from ${processedCount} plants`);
    
    res.json({
      points: heatmapPoints,
      totalPlants: processedCount,
      totalPoints: heatmapPoints.length
    });
  } catch (err) {
    console.error('Error fetching heatmap occurrences:', err);
    res.status(500).json({ message: 'Failed to fetch heatmap data', error: err.message });
  }
});

// Get by index (keep existing route for compatibility) - MUST be last
router.get('/:index', async (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (isNaN(index) || index < 0) {
    return res.status(400).json({ message: 'Nuh uh' });
  }

  try {
    const docs = await Canon.find().skip(index).limit(1);
    if (!docs || docs.length === 0) {
      return res.status(404).json({ message: 'cant find' });
    }
    res.json(docs[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server failed' });
  }
});

export default router;
