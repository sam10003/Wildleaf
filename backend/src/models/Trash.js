import mongoose from "mongoose";

const trashSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String, required: true },
  beforePhotoId: { type: String, required: true },  // ID to cloud storage
  afterPhotoId: { type: String, required: true },  
  beforePhotoURL: { type: String, required: true },  // URL to cloud storage
  afterPhotoURL: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Trash = mongoose.model("Trash", trashSchema);
export default Trash;