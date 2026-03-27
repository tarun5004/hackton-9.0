import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getStudentDashboard } from "../api/api";
import Sidebar from "../components/Sidebar";
import StreakTracker from "../components/StreakTracker";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    getStudentDashboard(user.id)
      .then((dashData) => {
        setData(dashData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  return (
    <div className="flex min-h-screen" id="student-dashboard">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-2xl font-bold">
            Welcome back, <span className="gradient-text">{user.name}</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">Here's your academic overview</p>
        </div>

        {/* Alerts */}
        {data.alerts && data.alerts.length > 0 ? (
          <div className="mb-6 space-y-2 fade-in">
            {data.alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border
                  ${alert.type === "attendance"
                    ? "bg-accent-red/10 border-accent-red/20 text-accent-red"
                    : "bg-accent-amber/10 border-accent-amber/20 text-accent-amber"
                  }`}
              >
                <span>{alert.type === "attendance" ? "⚠️" : "⏰"}</span>
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border bg-accent-green/10 border-accent-green/20 text-accent-green fade-in">
            <span>✅</span>
            <span>All good! No urgent alerts.</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 stagger">
          <StatCard
            label="Overall Attendance"
            value={`${data.attendance ?? 0}%`}
            color={(data.attendance ?? 0) >= 75 ? "green" : "red"}
            icon="📊"
          />
          <StatCard
            label="Safe to Bunk"
            value={data.safe_to_bunk ?? 0}
            sub="classes remaining"
            color={(data.safe_to_bunk ?? 0) > 0 ? "cyan" : "red"}
            icon="🎯"
          />
          <StatCard
            label="Upcoming Deadlines"
            value={(data.alerts || []).filter((a) => a.type === "deadline").length}
            sub="due within 3 days"
            color="amber"
            icon="📅"
          />
        </div>

        {/* Streak Tracker */}
        <div className="mb-6">
          <StreakTracker subjects={data.subjects || []} />
        </div>
      </main>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, value, sub, color, icon }) {
  const colorMap = {
    green: "from-accent-green/15 to-accent-green/5 border-accent-green/20 text-accent-green",
    red: "from-accent-red/15 to-accent-red/5 border-accent-red/20 text-accent-red",
    cyan: "from-accent-cyan/15 to-accent-cyan/5 border-accent-cyan/20 text-accent-cyan",
    amber: "from-accent-amber/15 to-accent-amber/5 border-accent-amber/20 text-accent-amber",
    blue: "from-accent-blue/15 to-accent-blue/5 border-accent-blue/20 text-accent-blue",
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${c}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

// ── Loading Screen ──
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-text-muted text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}

// ── Error Screen ──
function ErrorScreen({ message, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 max-w-md text-center">
        <p className="text-4xl mb-4">😵</p>
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-text-muted text-sm mb-4">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
