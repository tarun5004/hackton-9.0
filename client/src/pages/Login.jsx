import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/api";

export default function Login() {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await login(email.trim());
      loginUser(user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent-blue/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-purple/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md fade-in relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">EduDash</h1>
          <p className="text-text-muted text-sm">College Productivity Dashboard</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-6">Sign in with your college email</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-text-secondary font-medium mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mca.edu"
                className="input-field"
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 text-sm text-accent-red fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner !w-5 !h-5 !border-2" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick logins for demo */}
          <div className="mt-6 pt-6 border-t border-dark-600">
            <p className="text-xs text-text-muted text-center mb-3">Quick demo logins</p>
            <div className="flex gap-2">
              <button
                onClick={() => setEmail("21mca001@mca.edu")}
                className="flex-1 text-xs py-2 px-3 rounded-lg bg-dark-700 text-text-secondary hover:bg-dark-600 hover:text-text-primary transition-all cursor-pointer"
              >
                👨‍🎓 Student
              </button>
              <button
                onClick={() => setEmail("sharma@mca.edu")}
                className="flex-1 text-xs py-2 px-3 rounded-lg bg-dark-700 text-text-secondary hover:bg-dark-600 hover:text-text-primary transition-all cursor-pointer"
              >
                👩‍🏫 Teacher
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          MCA Section • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
