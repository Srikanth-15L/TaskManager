import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProjects, createProject, deleteProject, getTasks } from "../services/api";
import ProjectCard from "../components/ProjectCard";
import { Plus, FolderKanban, AlertCircle, X, Loader2, Trash2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects]   = useState([]);
  const [taskMap, setTaskMap]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ title: "", description: "" });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([getProjects(), getTasks()]);
      const projects = pRes.data.data;
      setProjects(projects);

      const map = {};
      (tRes.data.data || []).forEach(task => {
        if (!map[task.projectId]) map[task.projectId] = { total: 0, completed: 0 };
        map[task.projectId].total++;
        if (task.status === "Completed") map[task.projectId].completed++;
      });
      setTaskMap(map);
    } catch (err) {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const validateForm = () => {
    const e = {};
    if (!form.title.trim())       e.title = "Project title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      await createProject(form);
      toast.success("Project created successfully!");
      setShowModal(false);
      setForm({ title: "", description: "" });
      await fetchData();
    } catch (err) {
      toast.error("Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Delete this project and all its tasks?</p>
        <div className="flex gap-2">
          <button 
            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteProject(projectId);
                setProjects(p => p.filter(pr => pr.projectId !== projectId));
                toast.success("Project deleted.");
              } catch {
                toast.error("Failed to delete project.");
              }
            }}
          >
            Yes, Delete
          </button>
          <button 
            className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-black/5"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000, position: "top-center" });
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 lg:p-8 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Projects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage and track your team projects
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="form-input pl-11 py-2 w-full md:w-64 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              id="create-project-btn" 
              className="btn-primary shadow-lg shadow-emerald-500/20 whitespace-nowrap" 
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} /> New Project
            </motion.button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 h-48 animate-pulse border-black/5 bg-white" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-card border-dashed border-2 border-black/5 bg-white/50">
          <FolderKanban size={40} className="text-slate-300 mb-4" />
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>No projects found</h3>
          <p className="text-sm text-slate-400 mt-2">Try adjusting your search or start a new project.</p>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map(project => (
            <motion.div 
              key={project.projectId} 
              variants={item}
              className="relative group"
            >
              <ProjectCard project={project} taskStats={taskMap[project.projectId]} />
              {isAdmin && (
                <button
                  onClick={() => handleDelete(project.projectId)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-red-50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/5 backdrop-blur-sm" />
            <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-md p-8 relative z-10 border-black/5 shadow-2xl bg-white">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>New Project</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="form-label">Project Title</label>
                  <input type="text" className={`form-input ${formErrors.title ? "border-red-500" : ""}`} placeholder="e.g. Website Redesign" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea rows={4} className={`form-input resize-none ${formErrors.description ? "border-red-500" : ""}`} placeholder="Describe goals..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 h-12 justify-center">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 h-12 justify-center">{submitting ? <Loader2 className="animate-spin" /> : "Create Project"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Projects;
