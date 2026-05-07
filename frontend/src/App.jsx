import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

// Pages
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Dashboard    from "./pages/Dashboard";
import Projects     from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks        from "./pages/Tasks";
import Members      from "./pages/Members";
import Analytics    from "./pages/Analytics";

/** Layout wrapper that renders the sidebar + main content */
const AppLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    {/* Offset content by sidebar width on large screens */}
    <main className="flex-1 lg:ml-64 min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {children}
    </main>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — all authenticated users */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        }/>
        <Route path="/projects" element={
          <ProtectedRoute>
            <AppLayout><Projects /></AppLayout>
          </ProtectedRoute>
        }/>
        <Route path="/projects/:projectId" element={
          <ProtectedRoute>
            <AppLayout><ProjectDetail /></AppLayout>
          </ProtectedRoute>
        }/>
        <Route path="/tasks" element={
          <ProtectedRoute>
            <AppLayout><Tasks /></AppLayout>
          </ProtectedRoute>
        }/>

        {/* Protected — admin only */}
        <Route path="/members" element={
          <ProtectedRoute adminOnly>
            <AppLayout><Members /></AppLayout>
          </ProtectedRoute>
        }/>
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AppLayout><Analytics /></AppLayout>
          </ProtectedRoute>
        }/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "14px"
          }
        }}
      />
      <AnimatedRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
