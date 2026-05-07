import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getProjectById, getProjectMembers, getTasks,
  addProjectMember, removeProjectMember,
  createTask, updateStatus, deleteTask, getAllUsers,
  updateProject, updateTask
} from "../services/api";
import TaskCard from "../components/TaskCard";
import {
  ArrowLeft, Plus, Users, X, Loader2,
  CheckSquare, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const PRIORITIES = ["Low","Medium","High","Critical"];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { isAdmin, userProfile } = useAuth();
  const navigate = useNavigate();

  const [project,  setProject]  = useState(null);
  const [members,  setMembers]  = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // Modals
  const [taskModal,   setTaskModal]   = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [taskForm,    setTaskForm]    = useState({ title:"", description:"", assignedTo:"", priority:"Medium", dueDate:"" });
  const [taskErrors,  setTaskErrors]  = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  const fetchAll = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      // Use allSettled for the optional allUsers fetch
      const promises = [
        getProjectById(projectId),
        getProjectMembers(projectId),
        getTasks(projectId),
      ];
      
      const results = await Promise.all(promises);
      setProject(results[0].data.data);
      setMembers(results[1].data.data);
      setTasks(results[2].data.data);

      if (isAdmin) {
        const uRes = await getAllUsers();
        setAllUsers(uRes.data.data || []);
      }
    } catch (err) {
      console.error("Project fetch error:", err);
      toast.error("Failed to load project details.");
    } finally { setLoading(false); }
  }, [projectId, isAdmin]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const validateTask = () => {
    const e = {};
    if (!taskForm.title.trim())       e.title       = "Title is required.";
    if (!taskForm.description.trim()) e.description = "Description is required.";
    if (!taskForm.assignedTo)         e.assignedTo  = "Please assign this task.";
    if (!taskForm.dueDate)            e.dueDate     = "Due date is required.";
    return e;
  };

  const handleCreateTask = async (ev) => {
    ev.preventDefault();
    const errs = validateTask();
    if (Object.keys(errs).length) { setTaskErrors(errs); return; }
    setSubmitting(true);
    try {
      await createTask({ ...taskForm, projectId });
      toast.success("Task created successfully!");
      setTaskModal(false);
      setTaskForm({ title:"", description:"", assignedTo:"", priority:"Medium", dueDate:"" });
      fetchAll();
    } catch (err) { toast.error("Failed to create task."); }
    finally { setSubmitting(false); }
  };

  const handleAddMember = async () => {
    if (!selectedUser) { toast.error("Please select a user."); return; }
    try {
      await addProjectMember(projectId, selectedUser);
      toast.success("Member added to project!");
      setSelectedUser("");
      fetchAll();
    } catch (err) { toast.error("Failed to add member."); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeProjectMember(projectId, userId);
      setMembers(m => m.filter(u => u.userId !== userId));
      toast.success("Member removed.");
    } catch { toast.error("Failed to remove member."); }
  };

  const handleTaskUpdate = async (ev) => {
    ev.preventDefault();
    const errs = validateTask();
    if (Object.keys(errs).length) { setTaskErrors(errs); return; }
    setSubmitting(true);
    try {
      await updateTask(editingTask.taskId, taskForm);
      toast.success("Task updated successfully!");
      setEditingTask(null);
      setTaskForm({ title:"", description:"", assignedTo:"", priority:"Medium", dueDate:"" });
      fetchAll();
    } catch (err) { toast.error("Failed to update task."); }
    finally { setSubmitting(false); }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ""
    });
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateStatus(taskId, status);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status } : t));
      toast.success(`Status updated to ${status}`);
    } catch (err) { toast.error("Failed to update status."); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(t => t.filter(tk => tk.taskId !== taskId));
      toast.success("Task deleted.");
    } catch { toast.error("Failed to delete task."); }
  };

  const handleProjectStatusToggle = async () => {
    const newStatus = project.status === "Completed" ? "Pending" : "Completed";
    try {
      await updateProject(projectId, { status: newStatus });
      setProject(prev => ({ ...prev, status: newStatus }));
      toast.success(`Project marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update project status.");
    }
  };

  const nonMembers = allUsers.filter(u => !members.find(m => m.userId === u.userId));

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"
      />
    </div>
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
      initial="hidden"
      animate="show"
      variants={container}
      className="p-4 lg:p-8 space-y-8"
    >
      <motion.button 
        variants={item}
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-[10px] font-black tracking-widest hover:text-emerald-600 transition-colors"
        style={{ color: "var(--text-muted)" }}>
        <ArrowLeft size={14} /> BACK TO PROJECTS
      </motion.button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div variants={item} className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>{project?.title}</h1>
            <div className={`px-2 py-1 rounded-lg text-[10px] font-black border shadow-sm ${
              project?.status === "Completed" 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-amber-50 text-amber-600 border-amber-100"
            }`}>
              {project?.status?.toUpperCase() || "PENDING"}
            </div>
          </div>
          <p className="text-sm max-w-2xl" style={{ color: "var(--text-secondary)" }}>{project?.description}</p>
        </motion.div>
        
        {isAdmin && (
          <motion.div variants={item} className="flex gap-3">
            <button 
              className={`btn-secondary h-11 px-6 justify-center ${project?.status === "Completed" ? "text-amber-600" : "text-emerald-600"}`} 
              onClick={handleProjectStatusToggle}
            >
              {project?.status === "Completed" ? "Reopen Project" : "Mark Completed"}
            </button>
            <button className="btn-secondary h-11 px-6 justify-center" onClick={() => setMemberModal(true)}>
              <Users size={18} /> Manage Team
            </button>
            <button className="btn-primary h-11 px-6 shadow-lg shadow-emerald-500/20 justify-center" onClick={() => setTaskModal(true)}>
              <Plus size={18} /> Add Task
            </button>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <motion.div variants={item} className="xl:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-4 border-black/5 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Team Members</h3>
              <Users size={16} className="text-emerald-500" />
            </div>
            <div className="space-y-3">
              {members.length === 0 ? (
                <p className="text-xs text-muted">No members yet.</p>
              ) : (
                members.map(m => (
                  <motion.div 
                    key={m.userId}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-emerald-600 border border-black/5 shadow-sm">
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{m.name}</span>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleRemoveMember(m.userId)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 transition-all">
                        <X size={14} />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-6 space-y-4 border-black/5 bg-white shadow-sm">
            <h3 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Project Info</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Total Tasks</span>
                <span style={{ color: "var(--text-primary)" }}>{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Completed</span>
                <span className="text-emerald-600">{tasks.filter(t => t.status === "Completed").length}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Created On</span>
                <span style={{ color: "var(--text-primary)" }}>{new Date(project?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="xl:col-span-3 space-y-6">
          <motion.div variants={item} className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
              <CheckSquare size={20} className="text-emerald-500" />
              Tasks
            </h2>
          </motion.div>

          {tasks.length === 0 ? (
            <motion.div 
              variants={item}
              className="glass-card p-20 flex flex-col items-center text-center border-dashed border-2 border-black/5 bg-white/50"
            >
              <CheckSquare size={48} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Zero Tasks Found</h3>
              <p className="text-sm text-slate-400 mt-2">Get started by assigning the first task.</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={container}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {tasks.map(task => (
                <TaskCard 
                  key={task.taskId} 
                  task={task} 
                  currentUser={userProfile}
                  isAdmin={isAdmin}
                  onStatusUpdate={handleStatusChange}
                  onEdit={handleEditClick}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(taskModal || editingTask) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setTaskModal(false); setEditingTask(null); }} className="absolute inset-0 bg-black/5 backdrop-blur-sm" />
            <motion.div initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.9 }} className="glass-card w-full max-w-lg p-8 relative z-10 border-black/5 shadow-2xl bg-white overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {editingTask ? "Edit Task" : "Create Task"}
                </h2>
                <button onClick={() => { setTaskModal(false); setEditingTask(null); }} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={20} /></button>
              </div>
              <form onSubmit={editingTask ? handleTaskUpdate : handleCreateTask} className="space-y-6">
                <div>
                  <label className="form-label">Task Title</label>
                  <input type="text" className="form-input" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea rows={3} className="form-input" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Priority</label>
                    <select className="form-input text-sm" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input text-sm" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Assign To</label>
                  <select className="form-input text-sm" value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}>
                    <option value="">Select Member</option>
                    {members.map(m => <option key={m.userId} value={m.userId}>{m.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setTaskModal(false); setEditingTask(null); }} className="btn-secondary flex-1 h-12 justify-center">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 h-12 justify-center">
                    {submitting ? <Loader2 className="animate-spin" /> : (editingTask ? "Update Task" : "Create Task")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {memberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMemberModal(false)} className="absolute inset-0 bg-black/5 backdrop-blur-sm" />
            <motion.div initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.9 }} className="glass-card w-full max-w-md p-8 relative z-10 border-black/5 shadow-2xl bg-white">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Team</h2>
                <button onClick={() => setMemberModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="form-label">Invite New Member</label>
                  <div className="flex gap-2">
                    <select className="form-input flex-1 text-sm" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                      <option value="">Select User</option>
                      {nonMembers.map(u => <option key={u.userId} value={u.userId}>{u.name}</option>)}
                    </select>
                    <button onClick={handleAddMember} className="btn-primary h-11 px-4"><Plus size={18} /></button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {members.map(m => (
                    <div key={m.userId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-black text-emerald-600 border border-emerald-100 shadow-sm">{m.name?.[0]?.toUpperCase()}</div>
                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{m.name}</span>
                      </div>
                      {isAdmin && <button onClick={() => handleRemoveMember(m.userId)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={14} /></button>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectDetail;
