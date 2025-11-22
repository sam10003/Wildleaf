import express from "express";
import User from "../../models/User.js";
import authMiddleware from "../../middleware/authMiddleware.js";
//import { getProfile, deleteAccount } from "../../controllers/userController.js";

const getProfile = (req, res) => {
  res.json({ user: req.user });
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account", details: err.message });
  }
};

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.delete("/delete", authMiddleware, deleteAccount);

export default router;