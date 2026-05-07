const express = require("express");
const { body } = require("express-validator");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { registerUser, getAllUsers, getMe, updateRole } = require("../controllers/userController");

const router = express.Router();

/** POST /api/users/register — Called after Firebase Auth sign-up */
router.post(
  "/register",
  [
    body("userId").notEmpty().withMessage("userId is required."),
    body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 100 }).withMessage("Name too long."),
    body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
    body("role").optional().isIn(["admin", "member"]).withMessage("Role must be admin or member."),
  ],
  registerUser
);

/** GET /api/users/me */
router.get("/me", verifyToken, getMe);

/** GET /api/users — Admin only */
router.get("/", verifyToken, requireAdmin, getAllUsers);

/** PATCH /api/users/:userId/role — Admin only */
router.patch("/:userId/role", verifyToken, requireAdmin, updateRole);

module.exports = router;
