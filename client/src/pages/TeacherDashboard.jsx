import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAllStudents,
  getAllSubjects,
  bulkAttendance,
  uploadCSV,
  createAssignment,
  createLabSheet,
} from "../api/api";
import Sidebar from "../components/Sidebar";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("students");

  const fetchData = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([getAllStudents(), getAllSubjects()])
      .then(([studentData, subjectData]) => {
        setStudents(studentData || []);
        setSubjects(subjectData || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs = [
    { id: "students", label: "👥 Students" },
    { id: "attendance", label: "✅ Attendance" },
    { id: "csv", label: "📎 CSV Upload" },
    { id: "assignment", label: "📝 Assignment" },
    { id: "labsheet", label: "🔬 Lab Sheet" },
  ];

  return (
    <div className="flex min-h-screen" id="teacher-dashboard">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-2xl font-bold">
            Teacher Panel — <span className="gradient-text">{user.name}</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">Manage students, attendance & resources</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 fade-in">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer
                ${activeTab === tab.id
                  ? "bg-gradient-to-r from-accent-blue/20 to-accent-purple/15 text-accent-blue border border-accent-blue/25"
                  : "bg-dark-700/50 text-text-secondary hover:bg-dark-700 hover:text-text-primary border border-transparent"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 text-sm text-accent-red mb-6 fade-in">
            {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="fade-in">
          {activeTab === "students" && <StudentsTable students={students} loading={loading} />}
          {activeTab === "attendance" && <BulkAttendanceForm students={students} subjects={subjects} onSuccess={fetchData} />}
          {activeTab === "csv" && <CSVUploadForm onSuccess={fetchData} />}
          {activeTab === "assignment" && <AssignmentForm subjects={subjects} onSuccess={fetchData} />}
          {activeTab === "labsheet" && <LabSheetForm subjects={subjects} onSuccess={fetchData} />}
        </div>
      </main>
    </div>
  );
}

// ── Students Table ──
function StudentsTable({ students, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-dark-600">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          All Students ({students.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-600">
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Section</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                <td className="px-5 py-3 text-sm text-text-muted">{i + 1}</td>
                <td className="px-5 py-3 text-sm font-medium">{s.name}</td>
                <td className="px-5 py-3 text-sm text-text-secondary">{s.email}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue font-medium">
                    {s.section || "MCA"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Bulk Attendance Form ──
function BulkAttendanceForm({ students, subjects, onSuccess }) {
  const [subjectId, setSubjectId] = useState("");
  const [records, setRecords] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize records when students load
  useEffect(() => {
    if (students && students.length > 0) {
      setRecords(students.map((s) => ({ student_id: s.id, name: s.name, attended: 0, total: 0 })));
    }
  }, [students]);

  function updateRecord(studentId, field, value) {
    setRecords((prev) =>
      prev.map((r) =>
        r.student_id === studentId ? { ...r, [field]: parseInt(value) || 0 } : r
      )
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!subjectId) {
      setError("Please select a subject");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await bulkAttendance({
        subject_id: parseInt(subjectId),
        records: records.map(({ student_id, attended, total }) => ({ student_id, attended, total })),
      });
      setResult(res);
      setSubjectId("");
      setRecords(students.map((s) => ({ student_id: s.id, name: s.name, attended: 0, total: 0 })));
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">
        Bulk Mark Attendance
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="text-sm text-text-secondary font-medium mb-2 block">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="input-field max-w-xs"
            id="attendance-subject-select"
          >
            <option value="">Select a subject...</option>
            {(subjects || []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto mb-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase">Student</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase">Attended</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.student_id} className="border-b border-dark-700/50">
                  <td className="px-3 py-2 text-sm">{r.name}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={r.attended}
                      onChange={(e) => updateRecord(r.student_id, "attended", e.target.value)}
                      className="input-field !py-1.5 !px-2 w-20 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={r.total}
                      onChange={(e) => updateRecord(r.student_id, "total", e.target.value)}
                      className="input-field !py-1.5 !px-2 w-20 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-accent-red text-sm mb-3">{error}</p>}
        {result && (
          <p className="text-accent-green text-sm mb-3 fade-in">
            ✅ Updated {result.updated} records successfully
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary" id="submit-attendance-btn">
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>
      </form>
    </div>
  );
}

// ── CSV Upload ──
function CSVUploadForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setError("Select a CSV file");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await uploadCSV(file);
      setResult(res);
      setFile(null);
      // Reset the file input
      const input = document.getElementById("csv-input");
      if (input) input.value = "";
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".csv")) {
      setFile(dropped);
    }
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">
        Upload Attendance CSV
      </h3>

      <form onSubmit={handleUpload}>
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center mb-5 transition-all cursor-pointer
            ${dragOver
              ? "border-accent-blue bg-accent-blue/5"
              : "border-dark-500 hover:border-dark-400"
            }`}
          onClick={() => document.getElementById("csv-input").click()}
        >
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="hidden"
          />
          <p className="text-3xl mb-3">📄</p>
          {file ? (
            <p className="text-sm text-accent-green font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-sm text-text-secondary">Drop CSV file here or click to browse</p>
              <p className="text-xs text-text-muted mt-1">Format: email, subject_name, attended, total</p>
            </>
          )}
        </div>

        {error && <p className="text-accent-red text-sm mb-3">{error}</p>}

        {result && (
          <div className="mb-4 fade-in">
            <p className="text-accent-green text-sm mb-2">✅ Imported {result.imported} records</p>
            {result.errors && result.errors.length > 0 && (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-3 mt-2">
                <p className="text-xs text-accent-red font-semibold mb-2">Errors:</p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-accent-red/80">
                    Row {err.row}: {err.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={loading || !file} className="btn-primary" id="upload-csv-btn">
          {loading ? "Uploading..." : "Upload CSV"}
        </button>
      </form>
    </div>
  );
}

// ── Assignment Form ──
function AssignmentForm({ subjects, onSuccess }) {
  const [form, setForm] = useState({ subject_id: "", title: "", deadline: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.subject_id || !form.title || !form.deadline) {
      setError("All fields are required");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await createAssignment({
        subject_id: parseInt(form.subject_id),
        title: form.title,
        deadline: new Date(form.deadline).toISOString(),
      });
      setResult(res);
      setForm({ subject_id: "", title: "", deadline: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-6 max-w-lg">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">
        Create Assignment
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-text-secondary font-medium mb-1.5 block">Subject</label>
          <select
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            className="input-field"
            id="assignment-subject-select"
          >
            <option value="">Select a subject...</option>
            {(subjects || []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-text-secondary font-medium mb-1.5 block">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Assignment title"
            className="input-field"
            id="assignment-title-input"
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary font-medium mb-1.5 block">Deadline</label>
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="input-field"
            id="assignment-deadline-input"
          />
        </div>

        {error && <p className="text-accent-red text-sm">{error}</p>}
        {result && (
          <p className="text-accent-green text-sm fade-in">✅ Created: {result.title} ({result.subject_name})</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary" id="create-assignment-btn">
          {loading ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </div>
  );
}

// ── Lab Sheet Form ──
function LabSheetForm({ subjects, onSuccess }) {
  const [form, setForm] = useState({ subject_id: "", title: "", deadline: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.subject_id || !form.title || !form.deadline) {
      setError("All fields are required");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await createLabSheet({
        subject_id: parseInt(form.subject_id),
        title: form.title,
        deadline: new Date(form.deadline).toISOString(),
      });
      setResult(res);
      setForm({ subject_id: "", title: "", deadline: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card p-6 max-w-lg">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-5">
        Create Lab Sheet
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-text-secondary font-medium mb-1.5 block">Subject</label>
          <select
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
            className="input-field"
            id="labsheet-subject-select"
          >
            <option value="">Select a subject...</option>
            {(subjects || []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-text-secondary font-medium mb-1.5 block">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Lab sheet title"
            className="input-field"
            id="labsheet-title-input"
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary font-medium mb-1.5 block">Deadline</label>
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="input-field"
            id="labsheet-deadline-input"
          />
        </div>

        {error && <p className="text-accent-red text-sm">{error}</p>}
        {result && (
          <p className="text-accent-green text-sm fade-in">✅ Created: {result.title} ({result.subject_name})</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary" id="create-labsheet-btn">
          {loading ? "Creating..." : "Create Lab Sheet"}
        </button>
      </form>
    </div>
  );
}
