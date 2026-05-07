const ROLES = ["admin", "member"];

const TASK_STATUSES = ["Pending", "In Progress", "Completed", "Blocked"];

const TASK_PRIORITIES = ["Low", "Medium", "High", "Critical"];

const USER_SCHEMA = {
  requiredFields: ["userId", "name", "email", "role"],
};

const PROJECT_SCHEMA = {
  requiredFields: ["title", "description"],
};

const TASK_SCHEMA = {
  requiredFields: ["projectId", "title", "description", "assignedTo", "priority", "dueDate"],
};

module.exports = {
  ROLES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  USER_SCHEMA,
  PROJECT_SCHEMA,
  TASK_SCHEMA,
};
