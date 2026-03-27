import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";

export default function App() {
  const { user } = useAuth();

  // Not logged in → Login
  if (!user) return <Login />;

  // Role-based redirect
  if (user.role === "student") return <StudentDashboard />;
  if (user.role === "teacher") return <TeacherDashboard />;

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-text-muted">Unknown role: {user.role}</p>
    </div>
  );
}
