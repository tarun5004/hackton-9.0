import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Attendance from "./pages/Attendance";
import Assignments from "./pages/Assignments";
import LabSheets from "./pages/LabSheets";

export default function App() {
  const { user } = useAuth();

  // Not logged in → Login
  if (!user) return <Login />;

  // Role-based routing
  if (user.role === "student") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/labsheets" element={<LabSheets />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  if (user.role === "teacher") {
    // Teacher uses a single dashboard page with tabs for now
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<TeacherDashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-text-muted">Unknown role: {user.role}</p>
    </div>
  );
}
