const { validationResult } = require("express-validator");
const userService = require("../services/userService");

/** Helper to send validation errors */
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  return null;
};

/** POST /api/users/register */
const registerUser = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { userId, name, email, role } = req.body;
    const user = await userService.createUser({ userId, name, email, role });
    res.status(201).json({ success: true, message: "User profile created.", data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** GET /api/users — Admin only */
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** GET /api/users/me */
const getMe = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.uid);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

/** PATCH /api/users/:userId/role — Admin only */
const updateRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!["admin", "member"].includes(role)) {
      return res.status(422).json({ success: false, message: "Role must be 'admin' or 'member'." });
    }
    const user = await userService.updateUserRole(userId, role);
    res.json({ success: true, message: "Role updated.", data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error." });
  }
};

module.exports = { registerUser, getAllUsers, getMe, updateRole };
