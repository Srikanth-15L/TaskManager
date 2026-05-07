const express = require("express");
const { body } = require("express-validator");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectMembers,
} = require("../controllers/projectController");

const router = express.Router();

const projectValidation = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 150 }).withMessage("Title too long."),
  body("description").trim().notEmpty().withMessage("Description is required.").isLength({ max: 1000 }).withMessage("Description too long."),
];

/** POST /api/projects — Admin */
router.post("/", verifyToken, requireAdmin, projectValidation, createProject);

/** GET /api/projects */
router.get("/", verifyToken, getProjects);

/** GET /api/projects/:projectId */
router.get("/:projectId", verifyToken, getProjectById);

/** PUT /api/projects/:projectId — Admin */
router.put(
  "/:projectId",
  verifyToken,
  requireAdmin,
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty.").isLength({ max: 150 }),
    body("description").optional().trim().notEmpty().withMessage("Description cannot be empty.").isLength({ max: 1000 }),
    body("status").optional().isIn(["Pending", "Completed"]).withMessage("Invalid status."),
  ],
  updateProject
);

/** DELETE /api/projects/:projectId — Admin */
router.delete("/:projectId", verifyToken, requireAdmin, deleteProject);

/** POST /api/projects/:projectId/members — Admin */
router.post("/:projectId/members", verifyToken, requireAdmin, addMember);

/** DELETE /api/projects/:projectId/members/:userId — Admin */
router.delete("/:projectId/members/:userId", verifyToken, requireAdmin, removeMember);

/** GET /api/projects/:projectId/members */
router.get("/:projectId/members", verifyToken, getProjectMembers);

module.exports = router;
