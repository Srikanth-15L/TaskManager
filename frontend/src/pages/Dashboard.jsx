import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Plus, Filter, 
  ArrowRight, Users, CheckCircle2 
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { userProfile, isAdmin } = useAuth();
  const [data, setData] = useState({
    totalProjects: 0,
    pendingTasks: 0,
    teamSize: 0,
    recentProjects: [],
    recentTasks: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async (active) => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      
      if (!active.current) return;

      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      if (active.current) setLoading(false);
    }
  };

  useEffect(() => {
    const active = { current: true };
    fetchData(active);
    return () => { active.current = false; };
  }, [isAdmin]);

  const stats = [
    { label: "Active Projects", value: data.totalProjects, icon: LayoutDashboard, color: "blue", to: "/projects" },
    { label: "Pending Tasks", value: data.pendingTasks, icon: CheckCircle2, color: "emerald", to: "/tasks" },
    { label: isAdmin ? "Total Members" : "Team Size", value: data.teamSize || 0, icon: Users, color: "amber", to: isAdmin ? "/members" : null },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 lg:p-10 relative overflow-hidden bg-white border-black/5"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back, {userProfile?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-lg font-medium opacity-70" style={{ color: "var(--text-secondary)" }}>
            You have <span className="text-emerald-600 font-bold">{data.pendingTasks} tasks</span> pending today.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Recent Projects</h3>
            <Link to="/projects" className="text-sm font-bold text-emerald-600 hover:gap-2 flex items-center gap-1 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {data.recentProjects.map((project) => (
              <ProjectCard key={project._id || project.id} project={project} />
            ))}
            {data.recentProjects.length === 0 && (
              <div className="glass-card p-10 text-center border-dashed border-2 border-black/5 bg-slate-50/50">
                <p className="text-sm font-bold opacity-40">No projects yet</p>
                <Link to="/projects" className="btn-primary mt-4 inline-flex items-center gap-2 text-xs">
                  <Plus size={14} /> Create One
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Priority Tasks */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Priority Tasks</h3>
            <Link to="/tasks" className="text-sm font-bold text-emerald-600 hover:gap-2 flex items-center gap-1 transition-all">
              Manage <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {data.recentTasks.map((task) => (
              <TaskCard key={task._id || task.id} task={task} />
            ))}
            {data.recentTasks.length === 0 && (
              <div className="glass-card p-10 text-center border-dashed border-2 border-black/5 bg-slate-50/50">
                <p className="text-sm font-bold opacity-40">All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
