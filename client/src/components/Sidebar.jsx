import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-dark-800 border-r border-dark-600 flex flex-col p-6 fixed left-0 top-0" id="sidebar">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-xl font-bold gradient-text">EduDash</h1>
        <p className="text-xs text-text-muted mt-1">College Productivity</p>
      </div>

      {/* User Info */}
      <div className="glass-card p-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-sm font-bold">
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
        <SidebarLink icon="📊" label="Dashboard" active />
        {user?.role === "student" && (
          <>
            <SidebarLink icon="📋" label="Attendance" />
            <SidebarLink icon="📝" label="Assignments" />
            <SidebarLink icon="🔬" label="Lab Sheets" />
          </>
        )}
        {user?.role === "teacher" && (
          <>
            <SidebarLink icon="👥" label="Students" />
            <SidebarLink icon="✅" label="Mark Attendance" />
            <SidebarLink icon="📎" label="Upload CSV" />
          </>
        )}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-accent-red hover:bg-dark-700 transition-all duration-200 text-sm font-medium mt-4 cursor-pointer"
        id="logout-btn"
      >
        <span>🚪</span>
        <span>Log Out</span>
      </button>
    </aside>
  );
}

function SidebarLink({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200
        ${active
          ? "bg-gradient-to-r from-accent-blue/15 to-accent-purple/10 text-accent-blue border border-accent-blue/20"
          : "text-text-secondary hover:bg-dark-700 hover:text-text-primary"
        }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
