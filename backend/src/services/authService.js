import jwt from "jsonwebtoken";
// all this functions assume for already existing users ids and emails

/*
arguments: user json model
returns the following payload:
{
  id: _id -- the id of the user
  email: String -- the email of the user
  role: enum -- the role of the user  (either user of admin)
} jwt signed (15m)
*/
export function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

/*
arguments: user json model
returns the same payload as above
{
  id: _id -- duh
} jwt signed (7d)
*/
export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

/*
arguments: express response object, refresh jwt string
function sets the following cookies:
 - httpOnly:true -- XSS attacks
 - secure:true -- only HTTPS
 - sameSite:none -- cookie will be sent always (different origins)
 - path:/auth/refresh -- scope restriction
 - maxAge:.. -- 7 days ttl
*/
export function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}


/*
possible vulnerabilities:
  we have no CSRF protection
  so theres a bunch of attacks to obtain our JWT refresh via another
  webpage with the same path, TODO: protect against it.

  jwt.sign() can indeed fail so try catch() to be implemented
*/

