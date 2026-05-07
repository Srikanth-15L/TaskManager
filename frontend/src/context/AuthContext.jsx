import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/firebaseClient";
import { registerUser, getMe } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]   = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [authError, setAuthError]       = useState(null);

  const loadProfile = async (retryCount = 0) => {
    try {
      const res = await getMe();
      if (res.data?.data) {
        setUserProfile(res.data.data);
        return res.data.data;
      }
      throw new Error("Invalid profile response");
    } catch (err) {
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadProfile(retryCount + 1);
      }
      setUserProfile(null);
      console.error("Profile load failed:", err);
      return null;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Only set loading to false AFTER profile is loaded to avoid race conditions
        await loadProfile();
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const friendlyError = (code) => {
    const map = {
      "auth/invalid-email":           "Invalid email address.",
      "auth/user-disabled":           "This account has been disabled.",
      "auth/user-not-found":          "No account found with this email.",
      "auth/wrong-password":          "Incorrect password.",
      "auth/email-already-in-use":    "An account with this email already exists.",
      "auth/weak-password":           "Password must be at least 6 characters.",
      "auth/too-many-requests":       "Too many attempts. Please try again later.",
      "auth/popup-closed-by-user":    "Google sign-in was cancelled.",
      "auth/network-request-failed":  "Network error. Check your connection.",
      "auth/invalid-credential":      "Invalid credentials. Please check your email and password.",
    };
    return map[code] || `Authentication failed (${code}).`;
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Explicitly wait for profile to load before returning from login
      // This ensures 'navigate("/dashboard")' happens AFTER profile is ready
      const profile = await loadProfile();
      if (!profile) throw new Error("Could not retrieve user profile from workspace.");
      return profile;
    } catch (err) {
      const msg = err.message || friendlyError(err.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, role = "member") => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      await registerUser({ userId: user.uid, name, email, role });
      await signOut(auth);
    } catch (err) {
      try { if (auth.currentUser) await auth.currentUser.delete(); } catch (e) { await signOut(auth); }
      const msg = err.response?.data?.message || friendlyError(err.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;

      try {
        const profile = await loadProfile();
        if (!profile) throw new Error("Profile missing");
        return { isNew: false };
      } catch (err) {
        await registerUser({
          userId: user.uid,
          name: user.displayName || "Google User",
          email: user.email,
          role: "member"
        });
        await signOut(auth);
        return { isNew: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || friendlyError(err.code) || "Google login failed.";
      setAuthError(msg);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const value = useMemo(() => ({
    currentUser,
    userProfile,
    loading,
    authError,
    setAuthError,
    login,
    register,
    loginWithGoogle,
    logout,
    isAdmin: userProfile?.role === "admin",
  }), [currentUser, userProfile, loading, authError]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
