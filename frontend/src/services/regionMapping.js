/**
 * Maps GeoJSON region names to GBIF stateProvince names
 */
export function getGBIFRegionName(geojsonName) {
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
