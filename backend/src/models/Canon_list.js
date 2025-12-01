import mongoose from "mongoose";

/*
Collection: Canon_list
Contains:
 - every canonical name of any species ranked lower than LC
 - collected from the IUCN
 - _id is the IUCN ID for easy upsert and tracking
*/

const canonSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // IUCN ID
    name: { type: String, required: true, trim: true, index: true },
    state: { 
      type: String, 
      required: true, 
      enum: ["CR","EN","VU","NT","DD","EW","EX"], 
      uppercase: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Canon = mongoose.model("Canon", canonSchema, "Canon_list");
export default Canon;
