import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    // Try to get token from Authorization header (Bearer) or token header
    let token =
      req.headers.authorization?.split(" ")[1] ||
      req.headers.token ||
      req.headers.Token ||
      req.body.token;

    console.log("Auth Middleware: token received:", token);

    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized" });

    const decoded = jwt.decode(token);
    console.log("Auth Middleware: decoded token:", decoded);

    // Accept either clerkId, sub, or id as the user id
    const clerkId = decoded?.clerkId || decoded?.sub || decoded?.id;
    if (!clerkId) {
      console.log("Auth Middleware: clerkId/sub/id not found in token payload");
      return res
        .status(401)
        .json({ success: false, message: "Invalid token" });
    }

    req.body.clerkId = clerkId;
    req.clerkId = clerkId;
    next();
  } catch (err) {
    console.log("Auth Middleware: error", err);
    res.status(401).json({ success: false, message: "Auth error" });
  }
};

export default authUser;
