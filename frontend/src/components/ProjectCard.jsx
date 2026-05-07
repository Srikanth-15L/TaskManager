import { Users, CheckCircle2, Calendar, Layout, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ProjectCard = ({ project, taskStats = {} }) => {
  const navigate = useNavigate();
  const { total = 0, completed = 0 } = taskStats;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const status = project.status || "Pending";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/projects/${project.projectId}`)}
      className="glass-card p-6 cursor-pointer flex flex-col h-full border-black/5 relative overflow-hidden group bg-white"
      id={`project-card-${project.projectId}`}
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/[0.06] transition-colors" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
          <Layout size={20} />
        </div>
        <div className="px-2 py-1 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400 flex items-center gap-1 border border-black/5">
          <Calendar size={10} />
          {new Date(project.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-black tracking-tight line-clamp-1 group-hover:text-emerald-600 transition-colors"
            style={{ color: "var(--text-primary)" }}>
            {project.title}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
            status === "Completed" 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
              : "bg-amber-50 text-amber-600 border-amber-100"
          }`}>
            {status}
          </span>
        </div>
        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {project.description}
        </p>
      </div>

      {/* Progress Section */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
          <span style={{ color: "var(--text-muted)" }}>Workspace Progress</span>
          <span className="text-emerald-600">
            {progress}%
          </span>
        </div>
        
        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-black/[0.03] shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full relative"
            style={{
              background: progress === 100
                ? "linear-gradient(90deg,#10b981,#34d399)"
                : "linear-gradient(90deg,var(--accent),var(--accent-2))",
            }}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={12} />
              <span>{completed}/{total} Tasks</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
            DETAILS <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
