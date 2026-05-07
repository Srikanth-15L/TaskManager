import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllUsers, updateUserRole } from "../services/api";
import { Users, ShieldCheck, User, Search, Loader2, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Members = () => {
  const { userProfile } = useAuth();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data.data);
      } catch (err) {
        toast.error("Failed to load team members.");
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "member" : "admin";
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Change <b>{user.name}</b>'s role to <b>{newRole}</b>?</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm"
            onClick={async () => {
              toast.dismiss(t.id);
              setUpdating(user.userId);
              try {
                await updateUserRole(user.userId, newRole);
                setUsers(prev => prev.map(u => u.userId === user.userId ? { ...u, role: newRole } : u));
                toast.success("Role updated successfully!");
              } catch { toast.error("Failed to update role."); }
              finally { setUpdating(null); }
            }}>Confirm</button>
          <button className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-black/5"
            onClick={() => toast.dismiss(t.id)}>Cancel</button>
        </div>
      </div>
    ));
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Team Members</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Managing {users.length} professional users</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
          <input type="text" placeholder="Search team..." className="form-input pl-11 py-2.5 text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-24 flex flex-col items-center text-center border-dashed border-2 border-black/5 bg-white/50">
          <Users size={40} className="text-slate-200 mb-4" />
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Member not found</h3>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(user => {
              const isSelf = user.userId === userProfile?.userId;
              const isAdmin = user.role === "admin";
              return (
                <motion.div key={user.userId} layout variants={item} className="glass-card p-5 flex items-center gap-4 group border-black/5 bg-white shadow-sm">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0 transition-transform group-hover:scale-105 ${isAdmin ? "bg-gradient-to-br from-emerald-500 to-sky-500 shadow-md shadow-emerald-500/10" : "bg-slate-100 !text-slate-400 border border-black/5"}`}>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                      {isSelf && <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[8px] font-black text-emerald-600 border border-emerald-100 shadow-sm">YOU</span>}
                    </div>
                    <p className="text-xs truncate flex items-center gap-1 opacity-60" style={{ color: "var(--text-muted)" }}><Mail size={10} /> {user.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black tracking-widest ${isAdmin ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
                      {isAdmin ? <ShieldCheck size={12} /> : <User size={12} />}
                      {user.role.toUpperCase()}
                    </div>
                    {!isSelf && (
                      <button onClick={() => handleRoleToggle(user)} disabled={!!updating} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest">
                        {updating === user.userId ? <Loader2 size={14} className="animate-spin" /> : `Switch to ${isAdmin ? "Member" : "Admin"}`}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Members;
