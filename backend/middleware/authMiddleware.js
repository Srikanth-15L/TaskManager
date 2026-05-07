const { auth, db } = require("../firebase/firebaseAdmin");

/**
 * Verifies Firebase ID token from Authorization header.
 * Attaches decoded user + Firestore profile to req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);

    // Fetch Firestore user profile for role info
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User profile not found. Please register first." });
    }

    req.user = { uid: decoded.uid, ...userDoc.data() };
    next();
  } catch (error) {
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ success: false, message: "Token expired. Please login again." });
    }
    if (error.code === "auth/argument-error" || error.code === "auth/invalid-id-token") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: "Authentication failed." });
  }
};

/**
 * Middleware to restrict access to admin-only routes.
 * Must be used AFTER verifyToken.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
  }
  next();
};

/**
 * Middleware to verify the user is a member of the specified project.
 * Reads :projectId from req.params.
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { uid, role } = req.user;

    // Admins have access to all projects
    if (role === "admin") return next();

    const memberSnap = await db
      .collection("projectMembers")
      .where("projectId", "==", projectId)
      .where("userId", "==", uid)
      .get();

    if (memberSnap.empty) {
      return res.status(403).json({ success: false, message: "Access denied: Not a member of this project." });
    }
    next();
  } catch (error) {
    console.error("Project member check error:", error);
    return res.status(500).json({ success: false, message: "Server error during authorization." });
  }
};

module.exports = { verifyToken, requireAdmin, requireProjectMember };
