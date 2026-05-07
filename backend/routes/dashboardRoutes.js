const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

const router = express.Router();

/** GET /api/dashboard/stats */
router.get("/stats", verifyToken, getDashboardStats);

module.exports = router;
