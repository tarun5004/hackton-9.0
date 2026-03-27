import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getStudentDashboard } from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Attendance() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttendance = useCallback(() => {
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
    fetchAttendance();
  }, [fetchAttendance]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={fetchAttendance} />;
  if (!data) return null;

  return (
    <div className="flex min-h-screen" id="attendance-page">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Subject-wise</span> Attendance
          </h1>
          <p className="text-text-muted text-sm mt-1">Detailed breakdown of your attendance</p>
        </div>

        <div className="glass-card p-6 fade-in h-full flex flex-col">
          {(!data.subjects || data.subjects.length === 0) ? (
            <p className="text-text-muted text-sm mt-4">No subjects data available</p>
          ) : (
            <div className="overflow-x-auto space-y-5 flex-1 pr-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="px-3 py-3 text-xs font-semibold text-text-muted uppercase">Subject</th>
                    <th className="px-3 py-3 text-xs font-semibold text-text-muted uppercase">Attended</th>
                    <th className="px-3 py-3 text-xs font-semibold text-text-muted uppercase">Total</th>
                    <th className="px-3 py-3 text-xs font-semibold text-text-muted uppercase">%</th>
                    <th className="px-3 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.subjects.map((sub) => (
                    <tr key={sub.subject_id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                      <td className="px-3 py-4 text-sm font-medium">{sub.subject_name}</td>
                      <td className="px-3 py-4 text-sm font-semibold">{sub.attended}</td>
                      <td className="px-3 py-4 text-sm font-semibold">{sub.total}</td>
                      <td className="px-3 py-4 text-sm font-semibold">
                        <span className={`${sub.percentage >= 75 ? "text-accent-green" : "text-accent-red"}`}>
                          {sub.percentage}%
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        {sub.percentage >= 75 ? (
                           <span className="text-xs px-2.5 py-1 rounded-full bg-accent-green/10 text-accent-green font-medium">Safe</span>
                        ) : (
                           <span className="text-xs px-2.5 py-1 rounded-full bg-accent-red/10 text-accent-red font-medium">Warning</span>
                        )}
                        {sub.safe_to_bunk > 0 && <span className="ml-2 text-xs text-text-muted">({sub.safe_to_bunk} safe to bunk)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        <p className="text-text-muted text-sm">Loading attendance...</p>
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
