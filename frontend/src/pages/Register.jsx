import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Zap, Globe, ShieldCheck, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "member" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.isNew) {
        toast.success("Account created! Please sign in.");
        navigate("/login");
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Google authentication failed");
    } finally {
      setGLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4" style={{ background: "var(--bg-primary)" }}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle,#10b981,transparent 70%)" }} 
        />
      </div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-xl shadow-emerald-500/10"
            style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-2))" }}>
            <Zap size={32} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Join Team</h1>
          <p className="text-sm mt-2 font-medium" style={{ color: "var(--text-secondary)" }}>
            Create your account to get started
          </p>
        </div>

        <div className="glass-card p-8 shadow-2xl border-black/5 bg-white overflow-y-auto max-h-[85vh] custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="form-label">Account Role</label>
              <div className="grid grid-cols-2 gap-4">
                {["member","admin"].map(r => (
                  <motion.button 
                    key={r} type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                      form.role === r ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" : "border-black/5 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <ShieldCheck size={16} /> {r.charAt(0).toUpperCase() + r.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input name="name" type="text" className={`form-input pl-11 ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Srikanth" value={form.name} onChange={handleChange} />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1 font-bold">{errors.name}</p>}
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input name="email" type="email" className={`form-input pl-11 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="you@example.com" value={form.email} onChange={handleChange} />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1 font-bold">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Password</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input name="password" type="password" className={`form-input pl-11 ${errors.password ? "border-red-500" : ""}`}
                      placeholder="••••••" value={form.password} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Confirm</label>
                  <div className="relative group">
                    <input name="confirm" type="password" className={`form-input ${errors.confirm ? "border-red-500" : ""}`}
                      placeholder="••••••" value={form.confirm} onChange={handleChange} />
                  </div>
                </div>
              </div>
              {(errors.password || errors.confirm) && (
                <p className="text-xs text-red-500 font-bold">{errors.password || errors.confirm}</p>
              )}
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" className="btn-primary w-full justify-center h-12 text-sm font-black shadow-lg shadow-emerald-500/20 mt-4"
              disabled={loading}>
              {loading ? <span className="spinner w-5 h-5" /> : "Create New Account"}
            </motion.button>
          </form>

          <div className="divider my-8"><span>or sign up with</span></div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogle} className="btn-secondary w-full justify-center h-12 text-sm font-bold border-black/5 bg-white hover:bg-slate-50 shadow-sm"
            disabled={gLoading}>
            {gLoading ? <span className="spinner w-5 h-5" /> : (
              <>
                <Globe size={18} className="text-emerald-500" /> Google Account
              </>
            )}
          </motion.button>

          <p className="text-center mt-8 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">
              Sign in <ArrowLeft size={14} />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
