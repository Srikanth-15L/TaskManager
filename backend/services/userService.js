const { db } = require("../firebase/firebaseAdmin");
const { v4: uuidv4 } = require("uuid");

/**
 * Create a new user profile in Firestore after Firebase Auth registration.
 */
const createUser = async ({ userId, name, email, role }) => {
  const userRef = db.collection("users").doc(userId);
  const existing = await userRef.get();

  if (existing.exists) {
    throw { status: 409, message: "User profile already exists." };
  }

  // First-User-is-Admin logic: If no users exist, make the first one an admin
  let finalRole = role || "member";
  const usersCount = await db.collection("users").limit(1).get();
  if (usersCount.empty) {
    finalRole = "admin";
  }

  const userData = {
    userId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: finalRole,
    createdAt: new Date().toISOString(),
  };

  await userRef.set(userData);
  return userData;
};

/**
 * Get a user by their userId.
 */
const getUserById = async (userId) => {
  const doc = await db.collection("users").doc(userId).get();
  if (!doc.exists) throw { status: 404, message: "User not found." };
  return doc.data();
};

/**
 * Get all users (admin only).
 */
const getAllUsers = async () => {
  const snap = await db.collection("users").orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => d.data());
};

/**
 * Update user role (admin only).
 */
const updateUserRole = async (userId, role) => {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) throw { status: 404, message: "User not found." };

  await userRef.update({ role });
  return { ...doc.data(), role };
};

module.exports = { createUser, getUserById, getAllUsers, updateUserRole };
