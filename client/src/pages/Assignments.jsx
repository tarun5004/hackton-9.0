import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getStudentDashboard } from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Assignments() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(() => {
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
    fetchData();
  }, [fetchData]);

  const sorted = useMemo(() => {
    if (!data || !data.assignments) return [];
    return [...data.assignments].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [data]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={fetchData} />;
  if (!data) return null;

  return (
    <div className="flex min-h-screen" id="assignments-page">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8 fade-in">
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Assignments</span> Tracker
          </h1>
          <p className="text-text-muted text-sm mt-1">Keep track of your project submissions</p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            📝 Assignments ({sorted.length})
          </h3>
          {sorted.length === 0 ? (
            <p className="text-text-muted text-sm">No assignments yet</p>
          ) : (
            <div className="space-y-4">
              {sorted.map((a) => {
                const daysLeft = Math.ceil((new Date(a.deadline) - new Date()) / 86400000);
                const isUrgent = daysLeft <= 3 && daysLeft >= 0;
                const isPast = daysLeft < 0;

                return (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all shadow-sm
                      ${isPast
                        ? "bg-dark-700/50 border-dark-600/50 opacity-60"
                        : isUrgent
                          ? "bg-accent-amber/5 border-accent-amber/20"
                          : "bg-dark-700/30 border-dark-600/30"
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium truncate">{a.title}</p>
                      <p className="text-sm text-text-secondary mt-1">{a.subject_name}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className={`text-sm font-semibold ${isPast ? "text-text-muted" : isUrgent ? "text-accent-amber" : "text-text-secondary"}`}>
                        {isPast ? "Past due" : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(a.deadline).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Loading Screen ──
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-text-muted text-sm">Loading assignments...</p>
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
