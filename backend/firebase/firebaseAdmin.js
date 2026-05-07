const admin = require("firebase-admin");
const path = require("path");

let serviceAccount;

// Load service account from environment variable (Production/Render) 
// or from local file (Development)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", err);
    process.exit(1);
  }
} else {
  const serviceAccountPath = path.resolve(
    __dirname,
    "../../config/TaskManagerFirebase.json"
  );
  try {
    serviceAccount = require(serviceAccountPath);
  } catch (err) {
    console.error("Firebase service account file not found and no environment variable set.");
  }
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
