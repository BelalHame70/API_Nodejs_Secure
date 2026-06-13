const API_BASE_URL = "https://apinodejssecure-production.up.railway.app/api/v1";

const form = document.getElementById("adminLoginForm");
const errorBox = document.getElementById("loginError");

const showError = (message) => {
  errorBox.style.display = "block";
  errorBox.textContent = message;
};

const hideError = () => {
  errorBox.style.display = "none";
  errorBox.textContent = "";
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;

  if (!email || !password) {
    showError("Email and password are required");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Login failed");
      return;
    }

    if (!data.access_token) {
      showError("Access token not returned");
      return;
    }

    const payload = JSON.parse(atob(data.access_token.split(".")[1]));

    if (payload.role !== "admin") {
      showError("This account is not an admin account");
      return;
    }

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("admin_user", JSON.stringify(data.user || payload));

    window.location.href = "/admin-dashboard";
  } catch (error) {
    console.error(error);
    showError("Something went wrong. Please try again.");
  }
});