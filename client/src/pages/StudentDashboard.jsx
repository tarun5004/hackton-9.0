import { useEffect, useState, useMemo, useCallback } from "react";
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

        {/* Middle Row: Streak + Subject Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-1">
            <StreakTracker subjects={data.subjects || []} />
          </div>
          <div className="lg:col-span-2">
            <SubjectBreakdown subjects={data.subjects || []} />
          </div>
        </div>

        {/* Bottom Row: Assignments + Lab Sheets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 stagger">
          <AssignmentsList assignments={data.assignments || []} />
          <LabSheetsList labsheets={data.labsheets || []} />
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

// ── Subject Breakdown ──
function SubjectBreakdown({ subjects }) {
  return (
    <div className="glass-card p-6 fade-in h-full flex flex-col">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        Subject Breakdown
      </h3>
      {(!subjects || subjects.length === 0) ? (
        <p className="text-text-muted text-sm mt-4">No subjects data available</p>
      ) : (
        <div className="space-y-5 overflow-y-auto pr-2 max-h-64 flex-1">
          {subjects.map((sub) => (
            <div key={sub.subject_id} className="fade-in">
              <div className="flex items-center justify-between text-sm mb-1.5 font-medium">
                <span className="truncate pr-4">{sub.subject_name}</span>
                <span className={`shrink-0 ${sub.percentage >= 75 ? "text-accent-green" : "text-accent-red"}`}>
                  {sub.percentage}%
                </span>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-2 mb-1.5 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${sub.percentage >= 75 ? "bg-accent-green" : "bg-accent-red"}`}
                  style={{ width: `${Math.min(100, sub.percentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-text-muted">
                <span>Attended: {sub.attended}/{sub.total}</span>
                <span>Safe to bunk: {sub.safe_to_bunk}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Assignments List ──
function AssignmentsList({ assignments }) {
  const sorted = useMemo(() => {
    if (!assignments) return [];
    return [...assignments].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [assignments]);

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        📝 Assignments ({assignments ? assignments.length : 0})
      </h3>
      {sorted.length === 0 ? (
        <p className="text-text-muted text-sm">No assignments yet</p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {sorted.map((a) => {
            const daysLeft = Math.ceil((new Date(a.deadline) - new Date()) / 86400000);
            const isUrgent = daysLeft <= 3 && daysLeft >= 0;
            const isPast = daysLeft < 0;

            return (
              <div
                key={a.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all
                  ${isPast
                    ? "bg-dark-700/50 border-dark-600/50 opacity-60"
                    : isUrgent
                      ? "bg-accent-amber/5 border-accent-amber/20"
                      : "bg-dark-700/30 border-dark-600/30"
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{a.subject_name}</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className={`text-xs font-semibold ${isPast ? "text-text-muted" : isUrgent ? "text-accent-amber" : "text-text-secondary"}`}>
                    {isPast ? "Past due" : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {new Date(a.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Lab Sheets List ──
function LabSheetsList({ labsheets }) {
  const sorted = useMemo(() => {
    if (!labsheets) return [];
    return [...labsheets].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [labsheets]);

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        🔬 Lab Sheets ({labsheets ? labsheets.length : 0})
      </h3>
      {sorted.length === 0 ? (
        <p className="text-text-muted text-sm">No lab sheets yet</p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {sorted.map((ls) => {
            const daysLeft = Math.ceil((new Date(ls.deadline) - new Date()) / 86400000);
            const isUrgent = daysLeft <= 3 && daysLeft >= 0;

            return (
              <div
                key={ls.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all
                  ${isUrgent
                    ? "bg-accent-amber/5 border-accent-amber/20"
                    : "bg-dark-700/30 border-dark-600/30"
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{ls.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{ls.subject_name}</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className={`text-xs font-semibold ${isUrgent ? "text-accent-amber" : "text-text-secondary"}`}>
                    {daysLeft < 0 ? "Past due" : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
