import axios from "axios";
import { auth } from "../firebase/firebaseClient";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

// Middleware to attach Firebase ID token to outgoing requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      "An unexpected error occurred.";
    error.displayMessage = message;
    return Promise.reject(error);
  }
);

/* User Services */
export const registerUser   = (data)         => api.post("/users/register", data);
export const getMe          = ()             => api.get("/users/me");
export const getAllUsers     = ()             => api.get("/users");
export const updateUserRole = (userId, role) => api.patch(`/users/${userId}/role`, { role });

/* Project Services */
export const createProject      = (data)              => api.post("/projects", data);
export const getProjects        = ()                  => api.get("/projects");
export const getProjectById     = (id)                => api.get(`/projects/${id}`);
export const updateProject      = (id, data)          => api.put(`/projects/${id}`, data);
export const deleteProject      = (id)                => api.delete(`/projects/${id}`);
export const addProjectMember   = (id, userId)        => api.post(`/projects/${id}/members`, { userId });
export const removeProjectMember= (id, userId)        => api.delete(`/projects/${id}/members/${userId}`);
export const getProjectMembers  = (id)                => api.get(`/projects/${id}/members`);

/* Task Services */
export const createTask    = (data)          => api.post("/tasks", data);
export const getTasks      = (projectId)     => api.get("/tasks", { params: projectId ? { projectId } : {} });
export const getTaskById   = (id)            => api.get(`/tasks/${id}`);
export const updateTask    = (id, data)      => api.put(`/tasks/${id}`, data);
export const updateStatus  = (id, status)    => api.patch(`/tasks/${id}/status`, { status });
export const deleteTask    = (id)            => api.delete(`/tasks/${id}`);

/* Analytics & Dashboard */
export const getDashboardStats = () => api.get("/dashboard/stats");

export default api;
