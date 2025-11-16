# print_occurrences.py
from pathlib import Path
from dotenv import dotenv_values
from pymongo import MongoClient, errors

# Load .env one directory up
env_path = Path(__file__).parent.parent / ".env"
env_vars = dotenv_values(env_path)

mongo_uri = env_vars.get("MONGO_URI")
if not mongo_uri:
    raise ValueError("MONGO_URI not found in .env")

try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    client.server_info()
    print("Connected to MongoDB!")
except errors.ServerSelectionTimeoutError as err:
    print("Failed to connect to MongoDB:")
    print(err)
    exit(1)

db = client["wildleaf"]
collection = db.get_collection("OccurrencesByRegion")

try:
    count = collection.count_documents({})
    print(f"Found {count} documents in 'OccurrencesByRegion'.\n")

    if count == 0:
        print("Collection is empty!")
    else:
        for doc in collection.find():
            print(f"{doc['region']}: {doc['occurrences']} occurrences")
except Exception as e:
    print("Error reading documents:")
    print(e)
