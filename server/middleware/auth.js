import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized" });
    const decoded = jwt.decode(token);
    if (!decoded?.clerkId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid token" });
    req.body.clerkId = decoded.clerkId;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Auth error" });
  }
};

export default authUser;
