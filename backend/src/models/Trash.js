import mongoose from "mongoose";

const trashSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String, required: true },
  beforePhotoId: { type: String, required: true },  // ID to cloud storage
  afterPhotoId: { type: String, required: true },  
  beforePhotoURL: { type: String, required: true },  // URL to cloud storage
  afterPhotoURL: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true },
  },
},{ timestamps: true });

trashSchema.index({ location: "2dsphere" });

const Trash = mongoose.model("Trash", trashSchema);
export default Trash;

//GeoJson for map rendering might need to be implemented

