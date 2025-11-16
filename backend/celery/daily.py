from pathlib import Path
from dotenv import dotenv_values
from pymongo import MongoClient
import requests
import time

# Load .env one directory up
env_path = Path(__file__).parent.parent / ".env"
env_vars = dotenv_values(env_path)

mongo_uri = env_vars.get("MONGO_URI")
if not mongo_uri:
    raise ValueError("MONGO_URI not found in .env")

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["wildleaf"]

# Collections
canon_collection = db["Canon_list"]
occurrences_collection = db["OccurrencesByRegion"]

# If you want a fresh collection
occurrences_collection.drop()

# List of Spanish autonomous communities (ISO 3166-2 codes or names)
# Simplifying: names as used by GBIF in 'stateProvince' field
comunidades = [
    "Andalucia", "Aragon", "Asturias", "Balears", "Canarias", "Cantabria",
    "Castilla y Leon", "Castilla-La Mancha", "Catalonia", "Valencia",
    "Extremadura", "Galicia", "Madrid", "Murcia", "Navarra",
    "Pais Vasco", "La Rioja", "Ceuta", "Melilla"
]

# Initialize counts
region_counts = {c: 0 for c in comunidades}

# Iterate species
for species_doc in canon_collection.find():
    species_name = species_doc.get("name")
    print(f"Fetching GBIF occurrences for: {species_name}")
    
    # Fetch occurrences from GBIF in Spain with coordinates
    url = f"https://api.gbif.org/v1/occurrence/search"
    params = {
        "scientificName": species_name,
        "country": "ES",
        "hasCoordinate": True,
        "limit": 300  # Adjust if you want more
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        for occ in data.get("results", []):
            region = occ.get("stateProvince")
            if region in region_counts:
                region_counts[region] += 1
    except Exception as e:
        print(f"Error fetching {species_name}: {e}")
    
    time.sleep(0.1)  # polite pause to avoid hammering GBIF

# Save to MongoDB
for region, count in region_counts.items():
    occurrences_collection.insert_one({
        "region": region,
        "occurrences": count
    })

print("Done! Aggregated occurrences saved in 'OccurrencesByRegion'.")
