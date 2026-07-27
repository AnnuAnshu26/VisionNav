// Small fetch wrapper for talking to the NavAssist backend.
// Base URL can be overridden with REACT_APP_API_URL (see .env.example).
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "navassist_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error(
      "Could not reach the NavAssist server. Make sure the backend is running (npm start in /backend)."
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),
  updateProfile: (payload) => request("/profile", { method: "PUT", body: payload }),
  listReports: () => request("/reports"),
  createReport: (payload) => request("/reports", { method: "POST", body: payload }),
  listSos: () => request("/sos"),
  createSos: (payload) => request("/sos", { method: "POST", body: payload }),
};
