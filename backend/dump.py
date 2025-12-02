# save as dump_iucn.py
import json
from pymongo import MongoClient

# --- CONFIG ---
MONGO_URI = "mongodb://admin:secret@127.0.0.1:27017"  # host + port of your container
DB_NAME = "wildleaf"
COLLECTION_NAME = "IUCN"
OUTPUT_FILE = "IUCN.json"

# --- CONNECT ---
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# --- FETCH & DUMP ---
docs = list(collection.find({}))  # fetch all documents
for d in docs:                     # convert ObjectId to string
    if "_id" in d:
        d["_id"] = str(d["_id"])

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(docs, f, ensure_ascii=False, indent=2)

print(f"[✓] Dumped {len(docs)} documents from '{COLLECTION_NAME}' to '{OUTPUT_FILE}'")
