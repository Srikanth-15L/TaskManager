const { validationResult } = require("express-validator");
const taskService = require("../services/taskService");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  return null;
};

/** POST /api/tasks */
const createTask = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { projectId, title, description, assignedTo, priority, dueDate } = req.body;
    const task = await taskService.createTask({
      projectId,
      title,
      description,
      assignedTo,
      assignedBy: req.user.uid,
      priority,
      dueDate,
    });
    res.status(201).json({ success: true, message: "Task created and assigned.", data: task });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** GET /api/tasks */
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const tasks = await taskService.getTasks(req.user.uid, req.user.role, projectId || null);
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** GET /api/tasks/:taskId */
const getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);

    // Members can only view their own tasks
    if (req.user.role !== "admin" && task.assignedTo !== req.user.uid) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** PUT /api/tasks/:taskId — Admin only */
const updateTask = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const updated = await taskService.updateTask(req.params.taskId, req.body);
    res.json({ success: true, message: "Task updated.", data: updated });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** PATCH /api/tasks/:taskId/status — Member can update own tasks */
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(422).json({ success: false, message: "status field is required." });
    }
    const updated = await taskService.updateTaskStatus(
      req.params.taskId,
      status,
      req.user.uid,
      req.user.role
    );
    res.json({ success: true, message: "Task status updated.", data: updated });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** DELETE /api/tasks/:taskId — Admin only */
const deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.taskId);
    res.json({ success: true, message: "Task deleted." });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, updateStatus, deleteTask };
