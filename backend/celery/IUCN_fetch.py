import requests
import time
import json
from pymongo import MongoClient
from pygbif import species as gbif_species

API_IUCN = "LPt5meXXJLjgBKBt1FS9Qg8DngSWbr2RX2Az"
MONGO_URI = "mongodb://admin:secret@localhost:27017/"
PROGRESS_FILE = "progress.json"  # store last successful page

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["wildleaf"]

# Collection with minimal JSON structure
collection = db["IUCN"]

# Load last page if exists
# Load last page if exists
page = 0
try:
    with open(PROGRESS_FILE, "r") as f:
        try:
            progress = json.load(f)
            page = progress.get("page", 0)
        except json.JSONDecodeError:
            print("progress.json empty or invalid, starting from page 0")
except FileNotFoundError:
    print("progress.json not found, starting from page 0")

url = "https://api.iucnredlist.org/api/v4/countries/ES"
headers = {"accept": "application/json", "Authorization": API_IUCN}

while True:
    page += 1
    params = {"page": page}
    response = requests.get(url, headers=headers, params=params)
    print("requested " + str(page)) 
    response.raise_for_status()
    data = response.json()

    assessments = data.get("assessments", [])
    if not assessments:  # end of data
        print("All pages processed.")
        break
    VALID_STATES = ["NT", "VU", "EN", "CR", "DD", "NE"]
    for assessment in assessments:
        if not assessment.get("latest"):
            continue

        name = assessment["taxon_scientific_name"]
        sis_id = assessment["sis_taxon_id"]
        state = assessment["red_list_category_code"]
        
        if state not in VALID_STATES:
            print("not in category %s %s"%(state,name))
            continue

        # Query GBIF for kingdom
        try:
            gbif_result = gbif_species.name_backbone(name)
            kingdom = gbif_result.get("kingdom")
        except Exception as e:
            print(f"GBIF error for {name}: {e}")
            time.sleep(1)  # safe pause on error
            continue

        if kingdom != "Plantae":
            print("not plant, %s %s" % (kingdom,name))
            continue  # skip non-plants

        species_doc = {
            "_id": sis_id,
            "name": name,
            "state": state
        }

        print(json.dumps(species_doc, ensure_ascii=False))

        collection.update_one(
            {"_id": sis_id},
            {"$set": species_doc},
            upsert=True
        )

        time.sleep(0.5)  # small delay per GBIF request

    # Save progress in case of crash
    with open(PROGRESS_FILE, "w") as f:
        json.dump({"page": page}, f)

    time.sleep(2)  # polite delay per IUCN page
