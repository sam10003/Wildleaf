import jwt from "jsonwebtoken";
// token for security and user identification

export function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

export function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}