import { Clock, AlertCircle, CheckCircle2, User, Flag } from "lucide-react";
import { motion } from "framer-motion";

const priorityConfig = {
  "Low":      { color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" },
  "Medium":   { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  "High":     { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  "Critical": { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
};

const statusConfig = {
  "Pending":     { bg: "bg-slate-50", text: "text-slate-400", border: "border-slate-200" },
  "In Progress": { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
  "Completed":   { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  "Blocked":     { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};

const TaskCard = ({ task, currentUser, isAdmin, onStatusUpdate, onEdit }) => {
  const isOverdue =
    task.status !== "Completed" &&
    task.dueDate &&
    new Date(task.dueDate) < new Date();

  const formattedDue = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "short"
      })
    : null;

  const p = priorityConfig[task.priority] || priorityConfig.Low;
  const s = statusConfig[task.status] || statusConfig.Pending;

  // Only Admin or the Assignee can change status
  const canUpdate = isAdmin || task.assignedTo === currentUser?.uid;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card p-5 border-black/5 relative group bg-white shadow-sm flex flex-col"
      id={`task-card-${task.taskId}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold leading-tight group-hover:text-emerald-600 transition-colors"
              style={{ color: "var(--text-primary)" }}>
              {task.title}
            </h3>
            {isAdmin && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-emerald-600 hover:underline"
              >
                EDIT
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${p.bg} ${p.color} ${p.border}`}>
              {task.priority}
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-emerald-600 border border-black/5 shadow-sm shrink-0" title={task.assigneeName}>
          {task.assigneeName?.charAt(0) || "U"}
        </div>
      </div>

      <p className="text-xs mb-4 line-clamp-2 leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
        {task.description}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-widest border ${s.bg} ${s.text} ${s.border}`}>
          {task.status.toUpperCase()}
        </div>

        {formattedDue && (
          <div className={`flex items-center gap-1 text-[9px] font-black tracking-widest ${
            isOverdue ? "text-red-500 animate-pulse" : "text-slate-400"
          }`}>
            {isOverdue ? <AlertCircle size={10} /> : <Clock size={10} />}
            <span>{isOverdue ? "OVERDUE" : formattedDue.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Interactive Status Bar */}
      {canUpdate && (
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-black/5 mt-auto">
          {Object.keys(statusConfig).map((status) => (
            <button
              key={status}
              onClick={(e) => { e.stopPropagation(); onStatusUpdate?.(task.taskId, status); }}
              className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${
                task.status === status 
                  ? "bg-emerald-500 text-white shadow-sm" 
                  : "text-slate-400 hover:bg-white hover:text-slate-600"
              }`}
            >
              {status.split(' ')[status.split(' ').length - 1]}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
