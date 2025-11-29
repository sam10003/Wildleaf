import express from "express";
import User from "../../models/User.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const getProfile = (req, res) => {
  res.json({ user: req.user });
};

/*
  arguments: the request and response for the client
  will delete from the mongoDB the document with the corresponding
  id and clear the following cookies (logging him out)

  to keep in mind that the frontend must handle the removal
  of the access token stored locally
*/

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const deletedUser = await User.findByIdAndDelete(userId);
    console.log(deletedUser);
    if(!deletedUser) return res.status(404).json({error: "User not found"});

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/auth/refresh",
    });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account", details: err.message });
  }
};


// Routes
const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.delete("/delete", authMiddleware, deleteAccount);

export default router;
