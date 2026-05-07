const { db } = require("../firebase/firebaseAdmin");
const { v4: uuidv4 } = require("uuid");

/**
 * Create a new project.
 */
const createProject = async ({ title, description, createdBy }) => {
  const projectId = uuidv4();
  const projectData = {
    projectId,
    title: title.trim(),
    description: description.trim(),
    createdBy,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  await db.collection("projects").doc(projectId).set(projectData);
  return projectData;
};

/**
 * Get all projects (admin gets all, member gets only their projects).
 */
const getProjects = async (userId, role) => {
  if (role === "admin") {
    const snap = await db.collection("projects").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data());
  }

  // For members: fetch their project memberships first
  const memberSnap = await db
    .collection("projectMembers")
    .where("userId", "==", userId)
    .get();

  const projectIds = memberSnap.docs.map((d) => d.data().projectId);
  if (projectIds.length === 0) return [];

  // Firestore 'in' query supports max 30 items
  const chunks = [];
  for (let i = 0; i < projectIds.length; i += 30) {
    chunks.push(projectIds.slice(i, i + 30));
  }

  const results = [];
  for (const chunk of chunks) {
    const snap = await db.collection("projects").where("projectId", "in", chunk).get();
    snap.docs.forEach((d) => results.push(d.data()));
  }
  return results;
};

/**
 * Get a single project by ID.
 */
const getProjectById = async (projectId) => {
  const doc = await db.collection("projects").doc(projectId).get();
  if (!doc.exists) throw { status: 404, message: "Project not found." };
  return doc.data();
};

/**
 * Update a project.
 */
const updateProject = async (projectId, updates) => {
  const ref = db.collection("projects").doc(projectId);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, message: "Project not found." };

  const allowed = ["title", "description", "status"];
  const sanitized = {};
  allowed.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitized[field] = typeof updates[field] === "string" ? updates[field].trim() : updates[field];
    }
  });

  await ref.update({ ...sanitized, updatedAt: new Date().toISOString() });
  return { ...doc.data(), ...sanitized };
};

/**
 * Delete a project and its members/tasks.
 */
const deleteProject = async (projectId) => {
  const ref = db.collection("projects").doc(projectId);
  const doc = await ref.get();
  if (!doc.exists) throw { status: 404, message: "Project not found." };

  const batch = db.batch();
  batch.delete(ref);

  // Delete project members
  const membersSnap = await db
    .collection("projectMembers")
    .where("projectId", "==", projectId)
    .get();
  membersSnap.docs.forEach((d) => batch.delete(d.ref));

  // Delete tasks
  const tasksSnap = await db
    .collection("tasks")
    .where("projectId", "==", projectId)
    .get();
  tasksSnap.docs.forEach((d) => batch.delete(d.ref));

  await batch.commit();
};

/**
 * Add a member to a project.
 */
const addMember = async (projectId, userId) => {
  // Validate project exists
  const projectDoc = await db.collection("projects").doc(projectId).get();
  if (!projectDoc.exists) throw { status: 404, message: "Project not found." };

  // Validate user exists
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) throw { status: 404, message: "User not found." };

  // Check if already a member
  const existing = await db
    .collection("projectMembers")
    .where("projectId", "==", projectId)
    .where("userId", "==", userId)
    .get();
  if (!existing.empty) throw { status: 409, message: "User is already a member of this project." };

  const id = uuidv4();
  const memberData = {
    id,
    projectId,
    userId,
    joinedAt: new Date().toISOString(),
  };
  await db.collection("projectMembers").doc(id).set(memberData);
  return memberData;
};

/**
 * Remove a member from a project.
 */
const removeMember = async (projectId, userId) => {
  const snap = await db
    .collection("projectMembers")
    .where("projectId", "==", projectId)
    .where("userId", "==", userId)
    .get();

  if (snap.empty) throw { status: 404, message: "Member not found in this project." };

  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};

/**
 * Get all members of a project (with user profiles).
 */
const getProjectMembers = async (projectId) => {
  const snap = await db
    .collection("projectMembers")
    .where("projectId", "==", projectId)
    .get();

  const members = [];
  for (const doc of snap.docs) {
    const { userId, joinedAt } = doc.data();
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists) {
      members.push({ ...userDoc.data(), joinedAt });
    }
  }
  return members;
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
