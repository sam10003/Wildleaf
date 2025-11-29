import express from "express";
import Trash from "../../models/Trash.js";
import User from "../../models/User.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

/* Middleware to handle trash before and after image uploads to Cloudinary 
  That way we don't have to store images ourselves */
function createImageMiddleware(fieldsSpec = []) {
  return (req, res, next) => {
    try {
      // Configure Cloudinary with credentials from environment variables
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Set up Cloudinary storage
      const storage = new CloudinaryStorage({
        cloudinary,
        params: {
          folder: "wildleaf/trash",        // Cloudinary folder name
          allowed_formats: ["jpg", "jpeg", "png", "avif", "webp"],
        },
      });

      const upload = multer({ storage });
      const middleware = upload.fields(fieldsSpec);

      // run multer middleware:
      middleware(req, res, (err) => {
        if (err) {
          // multer/cloudinary error handler
          return next(err);
        }
        next();
      });
    } catch (err) {
      next(err);
    }
  };
}

const createTrash = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    const beforePhoto = req.files.beforePhoto?.[0];
    const afterPhoto = req.files.afterPhoto?.[0];

    const { latitude, longitude } = req.body;

    const trash = await Trash.create({
      userId,
      userEmail,
      beforePhotoId: beforePhoto.filename,
      afterPhotoId: afterPhoto.filename,
      beforePhotoURL: beforePhoto.path,
      afterPhotoURL: afterPhoto.path,
      latitude,
      longitude,
    });

    // Increase user score by 10 points
    console.log("before trash submit");
    await User.findByIdAndUpdate(
      userId,
      { $inc: {score: 10} },
      { new: true }
    );
    console.log("after trash submit");

    res.json({
      message: "Trash submission created",
      trash,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create trash submission",
      details: err.message,
    });
  }
};

const getAllTrash = async (req, res) => {
  try {
    const userId = req.user._id;

    const trashPosts = await Trash.find({ userId }).sort({ createdAt: -1 });

    res.json(trashPosts);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch trash posts",
      details: err.message,
    });
  }
};

const getTrashById = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const trash = await Trash.findOne({ _id: postId, userId });

    if (!trash) {
      return res.status(404).json({ error: "Trash post not found" });
    }

    res.json(trash);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch trash post",
      details: err.message,
    });
  }
};

export const deleteTrash = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const trash = await Trash.findOne({ _id: postId, userId });

    if (!trash) {
      return res.status(404).json({ error: "Trash post not found" });
    }

    await cloudinary.uploader.destroy(trash.beforePhotoId);
    await cloudinary.uploader.destroy(trash.afterPhotoId);

    await trash.deleteOne();

    res.json({ message: "Trash post deleted successfully" });
  } catch (err) {
    console.error("Error deleting trash post:", err);
    res.status(500).json({
      error: "Failed to delete trash post",
      details: err.message,
    });
  }
};


// Routes
const router = express.Router();

router.post("/create", authMiddleware, 
  createImageMiddleware([
    { name: "beforePhoto", maxCount: 1 },
    { name: "afterPhoto", maxCount: 1 },
  ]),
  createTrash
);
router.get("/all", authMiddleware, getAllTrash);
router.get("/one/:id", authMiddleware, getTrashById);
router.delete("/delete/:id", authMiddleware,
  createImageMiddleware([
    { name: "beforePhoto", maxCount: 1 },
    { name: "afterPhoto", maxCount: 1 },
  ]),
  deleteTrash);

export default router;