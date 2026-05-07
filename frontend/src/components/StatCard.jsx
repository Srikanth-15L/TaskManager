import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color = "#6366f1", subtitle }) => {
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef(null);

  // Animate number counting up
  useEffect(() => {
    if (typeof value !== "number") { setDisplayed(value); return; }
    const duration = 600;
    const start = performance.now();
    const startVal = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayed(Math.round(startVal + (value - startVal) * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <TrendingUp size={14} style={{ color: "var(--text-muted)" }} />
      </div>

      <p className="text-3xl font-bold mb-1 animate-count-up"
        style={{ color: "var(--text-primary)" }}>
        {typeof value === "number"
          ? displayed
          : value}
        {typeof value === "number" && label.toLowerCase().includes("%") ? "%" : ""}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
