
import api from "./api";

/* ─────────────────────────────────────────────
   Authentication
   Backend: /api/auth
───────────────────────────────────────────── */

export const authApi = {
  login: (data) => api.post("/auth/login", data),

  register: (data) => api.post("/auth/register", data),

  me: () => api.get("/auth/me"),

  logout: () => api.post("/auth/logout"),

  updateProfile: (data) => api.put("/auth/profile", data),

  changePassword: (data) => api.put("/auth/change-password", data),
};

/* ─────────────────────────────────────────────
   Leads
   Backend: /api/leads
───────────────────────────────────────────── */

export const leadsApi = {
  list: (params = {}) => api.get("/leads", { params }),

  get: (id) => api.get(`/leads/${id}`),

  create: (data) => api.post("/leads", data),

  update: (id, data) => api.put(`/leads/${id}`, data),

  remove: (id) => api.delete(`/leads/${id}`),

  reorder: (updates) =>
    api.patch("/leads/reorder", { updates }),
};

/* ─────────────────────────────────────────────
   Contacts
   Backend: /api/contacts
───────────────────────────────────────────── */

export const contactsApi = {
  list: (params = {}) => api.get("/contacts", { params }),

  get: (id) => api.get(`/contacts/${id}`),

  create: (data) => api.post("/contacts", data),

  update: (id, data) => api.put(`/contacts/${id}`, data),

  remove: (id) => api.delete(`/contacts/${id}`),
};

/* ─────────────────────────────────────────────
   Notes
   Backend: /api/notes
───────────────────────────────────────────── */

export const notesApi = {
  list: (params = {}) => api.get("/notes", { params }),

  get: (id) => api.get(`/notes/${id}`),

  create: (data) => api.post("/notes", data),

  update: (id, data) => api.put(`/notes/${id}`, data),

  remove: (id) => api.delete(`/notes/${id}`),
};

/* ─────────────────────────────────────────────
   Tasks
   Backend: /api/tasks
───────────────────────────────────────────── */

export const tasksApi = {
  list: (params = {}) => api.get("/tasks", { params }),

  get: (id) => api.get(`/tasks/${id}`),

  create: (data) => api.post("/tasks", data),

  update: (id, data) => api.put(`/tasks/${id}`, data),

  remove: (id) => api.delete(`/tasks/${id}`),
};

/* ─────────────────────────────────────────────
   AI Features
   Backend: /api/ai
───────────────────────────────────────────── */

export const aiApi = {
  leadSummary: (leadId) =>
    api.post(`/ai/leads/${leadId}/summary`),

  generateEmail: (leadId, data) =>
    api.post(`/ai/leads/${leadId}/email`, data),

  salesInsights: () =>
    api.post("/ai/sales-insights"),
};

/* ─────────────────────────────────────────────
   Analytics
   Backend: /api/analytics
───────────────────────────────────────────── */

export const analyticsApi = {
  overview: () => api.get("/analytics/overview"),
};
