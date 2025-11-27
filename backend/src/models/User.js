//only supports google login

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  score: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;

/*
  current changes:
  -made name required
  -set createdAt and updatedAt as something that is done by default
*/
