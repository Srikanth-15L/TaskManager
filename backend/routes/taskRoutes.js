const express = require("express");
const { body } = require("express-validator");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateStatus,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"];
const VALID_STATUSES = ["Pending", "In Progress", "Completed", "Blocked"];

const createTaskValidation = [
  body("projectId").notEmpty().withMessage("projectId is required."),
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required.").isLength({ max: 2000 }),
  body("assignedTo").notEmpty().withMessage("assignedTo (userId) is required."),
  body("priority").isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`),
  body("dueDate").isISO8601().withMessage("dueDate must be a valid ISO date (YYYY-MM-DD)."),
];

/** POST /api/tasks — Admin */
router.post("/", verifyToken, requireAdmin, createTaskValidation, createTask);

/** GET /api/tasks */
router.get("/", verifyToken, getTasks);

/** GET /api/tasks/:taskId */
router.get("/:taskId", verifyToken, getTaskById);

/** PUT /api/tasks/:taskId — Admin */
router.put(
  "/:taskId",
  verifyToken,
  requireAdmin,
  [
    body("title").optional().trim().notEmpty().isLength({ max: 200 }),
    body("description").optional().trim().notEmpty().isLength({ max: 2000 }),
    body("priority").optional().isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`),
    body("status").optional().isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),
    body("dueDate").optional().isISO8601().withMessage("dueDate must be a valid ISO date."),
  ],
  updateTask
);

/** PATCH /api/tasks/:taskId/status — Member can update their own */
router.patch("/:taskId/status", verifyToken, updateStatus);

/** DELETE /api/tasks/:taskId — Admin */
router.delete("/:taskId", verifyToken, requireAdmin, deleteTask);

module.exports = router;
