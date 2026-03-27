import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-dark-800 border-r border-dark-600 flex flex-col p-6 fixed left-0 top-0" id="sidebar">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-xl font-bold gradient-text">Catalyst</h1>
        <p className="text-xs text-text-muted mt-1">College Productivity</p>
      </div>

      {/* User Info */}
      <div className="glass-card p-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.charAt(0) || "?"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
            <p className="text-xs text-text-muted capitalize">{user?.role || "unknown"}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        <SidebarLink to="/dashboard" icon="📊" label="Dashboard" />
        {user?.role === "student" && (
          <>
            <SidebarLink to="/attendance" icon="📋" label="Attendance" />
            <SidebarLink to="/assignments" icon="📝" label="Assignments" />
            <SidebarLink to="/labsheets" icon="🔬" label="Lab Sheets" />
          </>
        )}
        {user?.role === "teacher" && (
          <>
            {/* The teacher's internal navigation is managed by tabs on the dashboard page for now 
                as keeping state in tabs matches the requirement and doesn't complicate react-router further for teacher */}
          </>
        )}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-accent-red hover:bg-dark-700 transition-all duration-200 text-sm font-medium mt-4 cursor-pointer border border-transparent hover:border-accent-red/20"
        id="logout-btn"
      >
        <span>🚪</span>
        <span>Log Out</span>
      </button>
    </aside>
  );
}

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 border ${
          isActive
            ? "bg-accent-blue/10 text-accent-blue border-accent-blue/20 shadow-sm"
            : "text-text-secondary border-transparent hover:bg-dark-700 hover:text-text-primary"
        }`
      }
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
