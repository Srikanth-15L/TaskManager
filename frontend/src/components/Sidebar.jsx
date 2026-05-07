import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, FolderKanban, CheckSquare, Users, 
  LogOut, Menu, X, Zap, BarChart3
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { userProfile, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = useMemo(() => [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/projects",  icon: FolderKanban,   label: "Projects" },
    { to: "/tasks",     icon: CheckSquare,     label: isAdmin ? "All Tasks" : "My Tasks" },
    { to: "/analytics", icon: BarChart3,      label: "Analytics" },
    ...(isAdmin ? [{ to: "/members", icon: Users, label: "Members" }] : []),
  ], [isAdmin]);

  // Close sidebar on route change (mobile)
  useEffect(() => setIsOpen(false), [location]);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 glass-card !rounded-xl shadow-lg border-black/5"
        style={{ color: "var(--text-primary)", background: "white" }}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.aside 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-40 w-64 m-4 lg:m-0 glass-card !rounded-3xl lg:!rounded-none border-black/5 lg:border-r border-t-0 border-b-0 border-l-0 overflow-hidden flex flex-col bg-white shadow-[10px_0_30px_rgba(0,0,0,0.02)]"
          >
            {/* Logo */}
            <div className="p-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
                style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-2))" }}>
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>TaskManager</span>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group overflow-hidden"
                    style={{ 
                      color: isActive ? "var(--accent)" : "var(--text-secondary)",
                      background: isActive ? "rgba(16,185,129,0.08)" : "transparent"
                    }}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute left-0 w-1 h-6 rounded-full"
                        style={{ background: "var(--accent)" }}
                      />
                    )}
                    <item.icon size={18} className={`transition-colors ${isActive ? "text-emerald-500" : "group-hover:text-emerald-600"}`} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="p-6 border-t border-black/5 space-y-4">
              <div className="flex items-center gap-3 px-2">
                {userProfile ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold">
                      {userProfile.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{userProfile.name}</p>
                      <p className="text-[10px] font-black tracking-widest truncate opacity-50 uppercase" style={{ color: "var(--text-muted)" }}>{userProfile.role}</p>
                    </div>
                  </>
                ) : (
                  <div className="animate-pulse flex gap-3 w-full">
                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-2 bg-slate-100 rounded w-3/4" />
                      <div className="h-2 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
              >
                <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/10 backdrop-blur-sm"
        />
      )}
    </>
  );
};

export default Sidebar;
