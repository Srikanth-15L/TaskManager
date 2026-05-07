const { validationResult } = require("express-validator");
const projectService = require("../services/projectService");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  return null;
};

/** POST /api/projects */
const createProject = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { title, description } = req.body;
    const project = await projectService.createProject({
      title,
      description,
      createdBy: req.user.uid,
    });
    res.status(201).json({ success: true, message: "Project created.", data: project });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** GET /api/projects */
const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects(req.user.uid, req.user.role);
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** GET /api/projects/:projectId */
const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** PUT /api/projects/:projectId */
const updateProject = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const updated = await projectService.updateProject(req.params.projectId, req.body);
    res.json({ success: true, message: "Project updated.", data: updated });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** DELETE /api/projects/:projectId */
const deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(req.params.projectId);
    res.json({ success: true, message: "Project and related data deleted successfully." });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** POST /api/projects/:projectId/members */
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(422).json({ success: false, message: "userId is required." });
    }
    const member = await projectService.addMember(req.params.projectId, userId);
    res.status(201).json({ success: true, message: "Member added to project.", data: member });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** DELETE /api/projects/:projectId/members/:userId */
const removeMember = async (req, res) => {
  try {
    await projectService.removeMember(req.params.projectId, req.params.userId);
    res.json({ success: true, message: "Member removed from project." });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** GET /api/projects/:projectId/members */
const getProjectMembers = async (req, res) => {
  try {
    const members = await projectService.getProjectMembers(req.params.projectId);
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectMembers,
};
