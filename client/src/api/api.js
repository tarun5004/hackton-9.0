const BASE_URL = "http://localhost:8000";

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Auth ──
export function login(email) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ── Student ──
export function getStudentDashboard(id) {
  return request(`/student/dashboard/${id}`);
}

export function getStudentAttendance(id) {
  return request(`/student/attendance/${id}`);
}

// ── Teacher ──
export function getAllStudents() {
  return request("/teacher/students");
}

export function bulkAttendance(data) {
  return request("/teacher/attendance/bulk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function uploadCSV(file) {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(`${BASE_URL}/teacher/upload-csv`, {
    method: "POST",
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  });
}

export function createAssignment(data) {
  return request("/teacher/assignment", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function createLabSheet(data) {
  return request("/teacher/labsheet", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
