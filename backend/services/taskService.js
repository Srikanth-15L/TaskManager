const { db } = require("../firebase/firebaseAdmin");
const { v4: uuidv4 } = require("uuid");
const { TASK_STATUSES, TASK_PRIORITIES } = require("../models/schemas");

/**
 * Create a new task under a project and assign it to a member.
 */
const createTask = async ({ projectId, title, description, assignedTo, assignedBy, priority, dueDate }) => {
  // Validate project exists
  const projectDoc = await db.collection("projects").doc(projectId).get();
  if (!projectDoc.exists) throw { status: 404, message: "Project not found." };

  // Validate assignee exists and is a member of the project
  const assigneeDoc = await db.collection("users").doc(assignedTo).get();
  if (!assigneeDoc.exists) throw { status: 404, message: "Assigned user not found." };

  const memberSnap = await db
    .collection("projectMembers")
    .where("projectId", "==", projectId)
    .where("userId", "==", assignedTo)
    .get();
  if (memberSnap.empty) {
    throw { status: 400, message: "Assigned user is not a member of this project." };
  }

  // Validate priority
  if (!TASK_PRIORITIES.includes(priority)) {
    throw { status: 400, message: `Invalid priority. Must be one of: ${TASK_PRIORITIES.join(", ")}` };
  }

  // Validate dueDate is a valid future date
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) throw { status: 400, message: "Invalid due date format." };

  const taskId = uuidv4();
  const taskData = {
    taskId,
    projectId,
    title: title.trim(),
    description: description.trim(),
    assignedTo,
    assignedBy,
    status: "Pending",
    priority,
    dueDate: due.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection("tasks").doc(taskId).set(taskData);
  return taskData;
};

/**
 * Get tasks — admin sees all (or filtered by project), member sees only assigned tasks.
 */
const getTasks = async (userId, role, projectId = null) => {
  let tasks = [];
  
  if (role === "admin") {
    let query = db.collection("tasks");
    if (projectId) query = query.where("projectId", "==", projectId);
    const snap = await query.orderBy("createdAt", "desc").get();
    tasks = snap.docs.map((d) => d.data());
  } else {
    // For members: see all tasks in projects they are part of
    let projectIds = [];
    if (projectId) {
      const memCheck = await db.collection("projectMembers")
        .where("projectId", "==", projectId)
        .where("userId", "==", userId)
        .get();
      if (memCheck.empty) return []; // Or throw 403
      projectIds = [projectId];
    } else {
      const memSnap = await db.collection("projectMembers")
        .where("userId", "==", userId)
        .get();
      projectIds = memSnap.docs.map(d => d.data().projectId);
    }

    if (projectIds.length === 0) return [];

    // Firestore 'in' query supports max 30 items
    const chunks = [];
    for (let i = 0; i < projectIds.length; i += 30) {
      chunks.push(projectIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      const snap = await db.collection("tasks").where("projectId", "in", chunk).get();
      snap.docs.forEach((d) => tasks.push(d.data()));
    }
    // Sort manually since 'in' query and 'orderBy' on different fields is complex in Firestore
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Fetch unique assignee names to avoid multiple DB hits
  const uids = [...new Set(tasks.map(t => t.assignedTo))];
  const userMap = {};
  if (uids.length > 0) {
    const userSnap = await db.collection("users").where("userId", "in", uids.slice(0, 30)).get();
    userSnap.docs.forEach(d => {
      const u = d.data();
      userMap[u.userId] = u.name;
    });
  }

  return tasks.map(t => ({
    ...t,
    assigneeName: userMap[t.assignedTo] || "Unknown User"
  }));
};

/**
 * Get a single task by ID.
 */
const getTaskById = async (taskId) => {
  const doc = await db.collection("tasks").doc(taskId).get();
  if (!doc.exists) throw { status: 404, message: "Task not found." };
  return doc.data();
};

/**
 * Update task fields (admin only).
 */
const updateTask = async (taskId, updates) => {
  const ref = db.collection("tasks").doc(taskId);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, message: "Task not found." };

  const allowed = ["title", "description", "assignedTo", "priority", "dueDate", "status"];
  const sanitized = {};

  allowed.forEach((field) => {
    if (updates[field] !== undefined) sanitized[field] = updates[field];
  });

  if (sanitized.priority && !TASK_PRIORITIES.includes(sanitized.priority)) {
    throw { status: 400, message: `Invalid priority. Must be one of: ${TASK_PRIORITIES.join(", ")}` };
  }
  if (sanitized.status && !TASK_STATUSES.includes(sanitized.status)) {
    throw { status: 400, message: `Invalid status. Must be one of: ${TASK_STATUSES.join(", ")}` };
  }
  if (sanitized.dueDate) {
    const due = new Date(sanitized.dueDate);
    if (isNaN(due.getTime())) throw { status: 400, message: "Invalid due date format." };
    sanitized.dueDate = due.toISOString();
  }
  if (sanitized.title) sanitized.title = sanitized.title.trim();
  if (sanitized.description) sanitized.description = sanitized.description.trim();

  sanitized.updatedAt = new Date().toISOString();
  await ref.update(sanitized);
  return { ...doc.data(), ...sanitized };
};

/**
 * Update only task status (member-allowed action).
 */
const updateTaskStatus = async (taskId, status, userId, role) => {
  if (!TASK_STATUSES.includes(status)) {
    throw { status: 400, message: `Invalid status. Allowed: ${TASK_STATUSES.join(", ")}` };
  }

  const ref = db.collection("tasks").doc(taskId);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, message: "Task not found." };

  const task = doc.data();
  // Members can only update their own tasks
  if (role !== "admin" && task.assignedTo !== userId) {
    throw { status: 403, message: "You can only update tasks assigned to you." };
  }

  await ref.update({ status, updatedAt: new Date().toISOString() });
  return { ...task, status };
};

/**
 * Delete a task (admin only).
 */
const deleteTask = async (taskId) => {
  const ref = db.collection("tasks").doc(taskId);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, message: "Task not found." };
  await ref.delete();
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
