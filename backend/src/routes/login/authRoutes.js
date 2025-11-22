import express from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie
} from "../../services/authService.js";
import User from "../../models/User.js";

// Google OAuth Login
const googleAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Missing authorization code" });

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    }).then((r) => r.json());

    if (tokenRes.error) {
      console.error("Google Token Error:", tokenRes);
      return res.status(400).json({ error: "Failed to exchange code", details: tokenRes });
    }

    const accessTokenGoogle = tokenRes.access_token;
    if (!accessTokenGoogle) {
      return res.status(400).json({ error: "No access token returned from Google" });
    }

    // Fetch user info
    const userInfo = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessTokenGoogle}` } }
    ).then((r) => r.json());

    if (!userInfo.sub || !userInfo.email) {
      return res.status(400).json({ error: "Invalid Google user info", details: userInfo });
    }

    // Find user, if no user: create user
    let user = await User.findOne({ email: userInfo.email });
    if (!user) {
      user = await User.create({
        googleId: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      });
    }

    // Generate tokens
    const appAccessToken = generateAccessToken(user);
    const appRefreshToken = generateRefreshToken(user);
    setRefreshCookie(res, appRefreshToken);

    res.json({ accessToken: appAccessToken, user });

  } catch (err) {
    console.error("Google Auth Catch Error:", err);
    res.status(500).json({ error: "Google auth failed", details: err.message });
  }
};

// Refresh
const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/auth/refresh",
  });
  res.json({ message: "Logged out" });
};


// Routes
const router = express.Router();

router.post("/google", googleAuth);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;