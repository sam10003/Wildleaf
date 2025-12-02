from pymongo import MongoClient
import json

# Connect to Mongo (no auth)
client = MongoClient("mongodb://54.235.180.181:27017")  # or the container host

db = client["wildleaf-mongo"]  # the database where you want the collection

# Load JSON file
with open("IUCN.json", "r", encoding="utf-8") as f:
    docs = json.load(f)

# Convert _id to string to avoid ObjectId conflicts
for d in docs:
    if "_id" in d:
        d["_id"] = str(d["_id"])

# Insert all documents
db.IUCN.insert_many(docs)

print(f"[✓] Inserted {len(docs)} documents into 'IUCN' collection")
