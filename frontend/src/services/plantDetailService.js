/**
 * Service to fetch detailed plant information from multiple sources
 * (Wikidata, GBIF, IUCN)
 */

/**
 * Fetch detailed plant information from multiple sources
 * @param {string} scientificName - Scientific name of the plant
 * @param {number} speciesKey - GBIF species key
 * @param {string} iucnStatus - IUCN conservation status
 * @returns {Promise<Object>} - Detailed plant information
 */
export async function fetchDetailedPlantInfo(scientificName, speciesKey, iucnStatus) {
  const info = {
    scientificName,
    habitat: null,
    description: null,
    threats: null,
    funFacts: [],
    stats: null,
    images: [],
    vernacularNames: []
  };

  // Fetch from multiple sources in parallel
  const [wikidataData, gbifData, iucnData] = await Promise.allSettled([
    fetchWikidataInfo(scientificName),
    fetchGBIFDetailedInfo(speciesKey),
    fetchIUCNInfo(scientificName)
  ]);

  // Process Wikidata data
  if (wikidataData.status === 'fulfilled' && wikidataData.value) {
    const wd = wikidataData.value;
    info.habitat = wd.habitat || info.habitat;
    info.description = wd.description || info.description;
    info.funFacts = wd.funFacts || info.funFacts;
    if (wd.images && wd.images.length > 0) {
      info.images = [...info.images, ...wd.images];
    }
  }

  // Process GBIF data
  if (gbifData.status === 'fulfilled' && gbifData.value) {
    const gbif = gbifData.value;
    info.description = gbif.description || info.description;
    info.vernacularNames = gbif.vernacularNames || info.vernacularNames;
    info.stats = gbif.stats || info.stats;
    if (gbif.images && gbif.images.length > 0) {
      info.images = [...info.images, ...gbif.images];
    }
  }

  // Process IUCN data
  if (iucnData.status === 'fulfilled' && iucnData.value) {
    const iucn = iucnData.value;
    info.threats = iucn.threats || info.threats;
    info.habitat = iucn.habitat || info.habitat;
    info.description = iucn.rationale || info.description;
  }

  return info;
}

/**
 * Fetch information from Wikidata
 */
async function fetchWikidataInfo(scientificName) {
  try {
    // First, search for the item
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(scientificName)}&language=en&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    if (!searchData.search || searchData.search.length === 0) return null;

    const itemId = searchData.search[0].id;
    if (!itemId) return null;

    // Get detailed information
    const itemUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${itemId}&props=descriptions|claims|sitelinks&format=json&origin=*`;
    const itemRes = await fetch(itemUrl);
    if (!itemRes.ok) return null;

    const itemData = await itemRes.json();
    const entity = itemData.entities?.[itemId];
    if (!entity) return null;

    const result = {
      description: entity.descriptions?.en?.value || null,
      habitat: null,
      funFacts: [],
      threats: null
    };

    // Extract habitat information from various properties
    // P1416 = IUCN conservation status (contains habitat info)
    // P2974 = IUCN habitat ID
    const habitatClaims = entity.claims?.P2974 || entity.claims?.P1416;
    if (habitatClaims) {
      result.habitat = extractPropertyText(entity.claims, 'P2974') || 
                      extractPropertyText(entity.claims, 'P1416');
    }

    // Extract fun facts from various interesting properties
    const funFacts = [];
    
    // Common names
    const commonNames = extractPropertyArray(entity.claims, 'P1843');
    if (commonNames && commonNames.length > 0) {
      funFacts.push(`Also known as: ${commonNames.slice(0, 3).join(', ')}`);
    }

    // Parent taxon
    const parentTaxon = extractPropertyText(entity.claims, 'P171');
    if (parentTaxon) {
      funFacts.push(`Belongs to the ${parentTaxon} family.`);
    }

    // Geographic distribution
    const distribution = extractPropertyText(entity.claims, 'P1830');
    if (distribution) {
      funFacts.push(`Native to: ${distribution}`);
    }

    result.funFacts = funFacts;

    // Try to get Wikipedia article for more info
    const sitelinks = entity.sitelinks;
    if (sitelinks?.enwiki) {
      try {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${sitelinks.enwiki.title}`;
        const wikiRes = await fetch(wikiUrl);
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.extract) {
            result.description = result.description || wikiData.extract;
          }
        }
      } catch (err) {
        // Silent fail
      }
    }

    // Try to get images
    const imageClaims = entity.claims?.P18; // image property
    if (imageClaims && imageClaims.length > 0) {
      const images = [];
      imageClaims.slice(0, 3).forEach(claim => {
        const imageFileName = claim.mainsnak?.datavalue?.value;
        if (imageFileName) {
          const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageFileName)}?width=800`;
          images.push(imageUrl);
        }
      });
      result.images = images;
    }

    return result;
  } catch (err) {
    console.warn('Error fetching Wikidata info:', err);
    return null;
  }
}

/**
 * Extract property value from Wikidata claims
 */
function extractProperty(claims, propertyId) {
  if (!claims || !claims[propertyId]) return null;
  const claim = claims[propertyId][0];
  return claim?.mainsnak?.datavalue?.value || null;
}

/**
 * Extract property text/label from Wikidata claims
 */
function extractPropertyText(claims, propertyId) {
  if (!claims || !claims[propertyId]) return null;
  const claim = claims[propertyId][0];
  const value = claim?.mainsnak?.datavalue?.value;
  // If it's an object with labels, get the label
  if (typeof value === 'object' && value !== null) {
    return value.labels?.en?.value || value.title || null;
  }
  return value || null;
}

/**
 * Extract array of property values
 */
function extractPropertyArray(claims, propertyId) {
  if (!claims || !claims[propertyId]) return [];
  return claims[propertyId]
    .map(claim => {
      const value = claim?.mainsnak?.datavalue?.value;
      if (typeof value === 'object' && value !== null) {
        return value.labels?.en?.value || value.title || null;
      }
      return value || null;
    })
    .filter(Boolean);
}

/**
 * Fetch detailed information from GBIF
 */
async function fetchGBIFDetailedInfo(speciesKey) {
  if (!speciesKey) return null;

  try {
    // Get species details
    const speciesRes = await fetch(`https://api.gbif.org/v1/species/${speciesKey}`);
    if (!speciesRes.ok) return null;
    const speciesData = await speciesRes.json();

    // Get occurrence statistics over years
    const statsRes = await fetch(
      `https://api.gbif.org/v1/occurrence/search?speciesKey=${speciesKey}&limit=0&facet=year&facetLimit=1000`
    );
    let stats = null;
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      if (statsData.facets && statsData.facets.length > 0) {
        const yearFacet = statsData.facets.find(f => f.name === 'year');
        if (yearFacet && yearFacet.counts) {
          stats = {
            totalOccurrences: statsData.count,
            occurrencesByYear: yearFacet.counts.sort((a, b) => a.name - b.name)
          };
        }
      }
    }

    // Get media/images
    const mediaRes = await fetch(`https://api.gbif.org/v1/species/${speciesKey}/media?limit=5`);
    let images = [];
    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      if (mediaData.results) {
        images = mediaData.results
          .filter(m => m.type === 'StillImage' && m.identifier)
          .map(m => m.identifier);
      }
    }

    return {
      description: speciesData.description || speciesData.remarks,
      vernacularNames: speciesData.vernacularNames || [],
      stats: stats,
      images: images
    };
  } catch (err) {
    console.warn('Error fetching GBIF detailed info:', err);
    return null;
  }
}

/**
 * Fetch information from IUCN and Wikipedia
 */
async function fetchIUCNInfo(scientificName) {
  try {
    // Try Wikipedia first for general info
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName.replace(' ', '_'))}`;
    const wikiRes = await fetch(wikiUrl);
    
    let wikiData = null;
    if (wikiRes.ok) {
      wikiData = await wikiRes.json();
    }

    // Try to search for IUCN Red List page
    const iucnSearchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName + ' IUCN')}`;
    let iucnData = null;
    try {
      const iucnRes = await fetch(iucnSearchUrl);
      if (iucnRes.ok) {
        iucnData = await iucnRes.json();
      }
    } catch (err) {
      // Silent fail
    }

    // Extract information
    const result = {
      description: wikiData?.extract || null,
      habitat: null,
      threats: null,
      rationale: null
    };

    // Try to extract habitat and threats from Wikipedia extract
    if (wikiData?.extract) {
      const extract = wikiData.extract.toLowerCase();
      
      // Look for habitat keywords
      const habitatKeywords = ['habitat', 'grows in', 'found in', 'native to', 'occurs in'];
      for (const keyword of habitatKeywords) {
        if (extract.includes(keyword)) {
          const start = extract.indexOf(keyword);
          const snippet = wikiData.extract.substring(Math.max(0, start - 20), Math.min(extract.length, start + 200));
          if (!result.habitat) {
            result.habitat = snippet.trim();
          }
          break;
        }
      }

      // Look for threat keywords
      const threatKeywords = ['threat', 'endangered', 'declining', 'vulnerable', 'risk', 'extinction'];
      for (const keyword of threatKeywords) {
        if (extract.includes(keyword)) {
          const start = extract.indexOf(keyword);
          const snippet = wikiData.extract.substring(Math.max(0, start - 20), Math.min(extract.length, start + 300));
          if (!result.threats) {
            result.threats = snippet.trim();
          }
          break;
        }
      }
    }

    return result;
  } catch (err) {
    console.warn('Error fetching IUCN/Wikipedia info:', err);
    return null;
  }
}

