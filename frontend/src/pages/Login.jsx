import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Zap, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
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
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.isNew) {
        toast.success("Registration successful! Please sign in.");
        navigate("/login");
      } else {
        toast.success("Signed in with Google");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Google authentication failed");
    } finally {
      setGLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4" style={{ background: "var(--bg-primary)" }}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle,#10b981,transparent 70%)" }} 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle,#0ea5e9,transparent 70%)" }} 
        />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-xl shadow-emerald-500/10"
            style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-2))" }}>
            <Zap size={32} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>TaskManager</h1>
          <p className="text-sm mt-2 font-medium" style={{ color: "var(--text-secondary)" }}>
            The professional way to manage your team
          </p>
        </div>

        <div className="glass-card p-8 shadow-2xl border-black/5 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                  <Mail size={18} style={{ color: "var(--text-muted)" }} />
                </div>
                <input name="email" type="email"
                  className={`form-input pl-11 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="you@example.com"
                  value={form.email} onChange={handleChange} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-2 font-bold">{errors.email}</p>}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                  <Lock size={18} style={{ color: "var(--text-muted)" }} />
                </div>
                <input name="password" type="password"
                  className={`form-input pl-11 ${errors.password ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange} />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-2 font-bold">{errors.password}</p>}
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" className="btn-primary w-full justify-center h-12 text-sm font-black shadow-lg shadow-emerald-500/20"
              disabled={loading}>
              {loading ? <span className="spinner w-5 h-5" /> : "Sign In to Workspace"}
            </motion.button>
          </form>

          <div className="divider my-8"><span>or continue with</span></div>

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
            New to TaskFlow?{" "}
            <Link to="/register" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">
              Create account <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
