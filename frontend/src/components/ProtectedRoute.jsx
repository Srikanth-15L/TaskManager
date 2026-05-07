import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps a route to require authentication.
 * Optionally requires admin role.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, userProfile, isAdmin, loading } = useAuth();

  // Wait for auth to initialize
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="spinner w-10 h-10" />
    </div>
  );

  // No firebase user? Kick to login
  if (!currentUser) return <Navigate to="/login" replace />;

  // Firebase user exists but no backend profile yet? 
  // This handles the gap during registration or if the backend profile is missing.
  if (!userProfile) return <Navigate to="/login" replace />;

  // Admin check
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
