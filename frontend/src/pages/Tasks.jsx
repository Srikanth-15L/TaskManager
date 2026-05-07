import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks, updateStatus } from "../services/api";
import TaskCard from "../components/TaskCard";
import { CheckSquare, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const STATUSES = ["All","Pending","In Progress","Completed","Blocked"];

const Tasks = () => {
  const { isAdmin, userProfile } = useAuth();
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      setTasks(res.data.data);
    } catch (err) {
      console.error("Tasks fetch error:", err);
      toast.error("Failed to load tasks.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch, isAdmin]); // Re-fetch when admin status is confirmed

  const handleStatusChange = async (task, status) => {
    try {
      await updateStatus(task.taskId, status);
      setTasks(prev => prev.map(t => t.taskId === task.taskId ? { ...t, status } : t));
      toast.success(`Task moved to ${status}`);
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const filtered = tasks.filter(t => {
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesSearch = (t.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (t.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { scale: 0.9, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>{isAdmin ? "Global Tasks" : "My Tasks"}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Viewing {filtered.length} tasks</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-64 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input type="text" placeholder="Search tasks..." className="form-input pl-11 py-2 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-black/5 shadow-sm overflow-x-auto custom-scrollbar">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${statusFilter === s ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>{s.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-24 flex flex-col items-center text-center border-dashed border-2 border-black/5 bg-white/50">
          <CheckSquare size={40} className="text-slate-200 mb-4" />
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>No tasks found</h3>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map(task => (
              <motion.div key={task.taskId} layout variants={item} className="space-y-3">
                <TaskCard task={task} isAdmin={isAdmin} currentUser={userProfile} />
                <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl w-fit border border-black/5 shadow-sm overflow-x-auto">
                  {["Pending","In Progress","Completed","Blocked"].map(s => (
                    <button key={s} onClick={() => handleStatusChange(task, s)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest transition-all whitespace-nowrap ${task.status === s ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>{s.toUpperCase()}</button>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Tasks;
