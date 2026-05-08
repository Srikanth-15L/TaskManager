import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/api";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from "recharts";
import {
  TrendingUp, CheckCircle2, AlertCircle, Clock,
  BarChart3, PieChart as PieIcon, Users
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#64748b"];

const Analytics = () => {
  const [data, setData] = useState({
    statusData: [],
    priorityData: [],
    projectProgress: [],
    memberWorkload: [],
    totals: { projects: 0, tasks: 0, completed: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats();
        
        if (res.data.success) {
          const d = res.data.data;
          setData({
            statusData: d.statusData || [],
            priorityData: d.priorityData || [],
            projectProgress: d.projectProgress || [],
            memberWorkload: d.memberWorkload || [],
            totals: {
              projects: d.totalProjects || 0,
              tasks: d.totalTasks || 0,
              completed: d.completedTasks || 0
            }
          });
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
        toast.error("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="p-4 lg:p-8 space-y-8"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Analytics Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Real-time performance metrics and project insights</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-sm border border-black/5">
          <TrendingUp size={16} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Live Updates</span>
        </div>
      </motion.div>

      {/* Metrics Overview */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Projects", val: data.totals.projects, icon: BarChart3, color: "var(--accent)" },
          { label: "Completion Rate", val: data.totals.tasks > 0 ? `${Math.round((data.totals.completed / data.totals.tasks) * 100)}%` : "0%", icon: CheckCircle2, color: "#0ea5e9" },
          { label: "Total Tasks", val: data.totals.tasks, icon: Clock, color: "#f59e0b" },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants} className="glass-card p-6 bg-white border-black/5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}10`, color: s.color }}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">{s.label}</p>
              <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{s.val}</h2>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {data.totals.tasks === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-20 flex flex-col items-center text-center border-dashed border-2 border-black/5 bg-white/50">
          <BarChart3 size={48} className="text-slate-200 mb-4" />
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>No data available</h3>
          <p className="text-sm text-slate-400 mt-2">Initialize projects and tasks to generate visualizations.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workflow Distribution */}
          <motion.div variants={itemVariants} className="glass-card p-8 bg-white border-black/5 h-[400px] flex flex-col">
            <h3 className="text-sm font-black tracking-wider uppercase mb-6 flex items-center gap-2">
              <PieIcon size={16} className="text-emerald-500" /> Workflow Distribution
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {data.statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Priority Levels */}
          <motion.div variants={itemVariants} className="glass-card p-8 bg-white border-black/5 h-[400px] flex flex-col">
            <h3 className="text-sm font-black tracking-wider uppercase mb-6 flex items-center gap-2">
              <AlertCircle size={16} className="text-emerald-500" /> Priority Levels
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.priorityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '800', fill: '#1e293b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '800', fill: '#1e293b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Project Progress Tracker */}
          <motion.div variants={itemVariants} className="glass-card p-8 bg-white border-black/5 h-[400px] flex flex-col">
            <h3 className="text-sm font-black tracking-wider uppercase mb-6 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Project Progress
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.projectProgress} layout="vertical" margin={{ left: 20, right: 40 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: '800', fill: '#1e293b' }}
                    width={120}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey={() => 100} fill="#f1f5f9" radius={[0, 6, 6, 0]} barSize={24} isAnimationActive={false} />
                  <Bar
                    dataKey="progress"
                    fill="url(#progressGradient)"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                    style={{ marginTop: '-24px' }}
                  >
                    <LabelList
                      dataKey="progress"
                      position="right"
                      style={{ fontSize: 10, fontWeight: '900', fill: '#10b981' }}
                      formatter={(v) => `${v}%`}
                      offset={10}
                    />
                  </Bar>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Workload Distribution */}
          <motion.div variants={itemVariants} className="glass-card p-8 bg-white border-black/5 h-[400px] flex flex-col">
            <h3 className="text-sm font-black tracking-wider uppercase mb-6 flex items-center gap-2">
              <Users size={16} className="text-emerald-500" /> Team Workload
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.memberWorkload}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '800', fill: '#1e293b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '800', fill: '#1e293b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="tasks" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
