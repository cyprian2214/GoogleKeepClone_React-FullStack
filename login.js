const API_BASE = "https://googlekeepclone-api.onrender.com";
const AUTH_TOKEN_KEY = "authToken";

const form = document.getElementById("login-form");
const registerBtn = document.getElementById("register-btn");
const message = document.getElementById("login-message");

const setMessage = (text, type = "") => {
  message.textContent = text;
  message.className = `login-message ${type}`.trim();
};

const hasValidToken = async (token) => {
  if (!token) return false;
  try {
    const response = await fetch(`${API_BASE}/api/notes`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (_) {
    return false;
  }
};

const submitAuth = async (path) => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    setMessage("Email and password are required", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Authentication failed", "error");
      return;
    }

    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    window.location.href = "index.html";
  } catch (error) {
    setMessage("Unable to reach server", "error");
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAuth("/api/auth/login");
});

registerBtn.addEventListener("click", () => {
  submitAuth("/api/auth/register");
});

(async () => {
  const existingToken = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!existingToken) return;

  const valid = await hasValidToken(existingToken);
  if (valid) {
    window.location.href = "index.html";
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
})();
