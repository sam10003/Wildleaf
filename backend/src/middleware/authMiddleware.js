import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load full user from DB
    const user = await User.findById(decoded.id).select("-__v");

    if (!user)
      return res.status(404).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}