const API_BASE_URL = "https://apinodejssecure-production.up.railway.app/api/v1";

if (!localStorage.getItem("access_token")) {
  window.location.href = "/admin-login";
}

const adminUser = JSON.parse(localStorage.getItem("admin_user") || "{}");

window.addEventListener("DOMContentLoaded", () => {
  const adminName = document.getElementById("adminName");
  const adminEmail = document.getElementById("adminEmail");

  if (adminName) {
    adminName.textContent = adminUser.name || "Admin";
  }

  if (adminEmail) {
    adminEmail.textContent = adminUser.email || "admin@agentlab.com";
  }
});

const getToken = () => {
  return localStorage.getItem("access_token");
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

const loadOverview = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/overview`, {
      headers: authHeaders()
    });

    const data = await res.json();

    if (!data.success) return;

    document.getElementById("totalUsers").textContent =
      data.overview.total_users ?? 0;

    document.getElementById("totalAdmins").textContent =
      data.overview.total_admins ?? 0;

    document.getElementById("totalAgents").textContent =
      data.overview.total_agents ?? 0;

    document.getElementById("totalSessions").textContent =
      data.overview.total_sessions ?? 0;
  } catch (error) {
    console.error(error);
  }
};

const loadUsers = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: authHeaders()
    });

    const data = await res.json();

    const tbody = document.getElementById("usersTable");
    tbody.innerHTML = "";

    if (!data.success || !data.users || data.users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
      return;
    }

    data.users.forEach((user) => {
      const tr = document.createElement("tr");

      const roleButton =
        user.role === "admin"
          ? `<button class="action-btn gray" onclick="removeAdmin('${user.user_id}')">Remove</button>`
          : `<button class="action-btn blue" onclick="makeAdmin('${user.user_id}')">Admin</button>`;

      tr.innerHTML = `
        <td title="${user.name || "-"}">${user.name || "-"}</td>
        <td title="${user.email || "-"}">${user.email || "-"}</td>
        <td>
          <span class="badge ${user.role === "admin" ? "admin" : "user"}">
            ${user.role || "user"}
          </span>
        </td>
        <td>${user.verified ? "Yes" : "No"}</td>
        <td>
          <div class="actions-wrap">
            ${roleButton}
            <button class="action-btn red" onclick="deleteUser('${user.user_id}')">
              Delete
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);

    const tbody = document.getElementById("usersTable");

    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5">Error loading users</td></tr>`;
    }
  }
};

const makeAdmin = async (userId) => {
  try {
    await fetch(`${API_BASE_URL}/admin/users/${userId}/make-admin`, {
      method: "PUT",
      headers: authHeaders()
    });

    await loadOverview();
    await loadUsers();
  } catch (error) {
    console.error(error);
  }
};

const removeAdmin = async (userId) => {
  try {
    await fetch(`${API_BASE_URL}/admin/users/${userId}/remove-admin`, {
      method: "PUT",
      headers: authHeaders()
    });

    await loadOverview();
    await loadUsers();
  } catch (error) {
    console.error(error);
  }
};

const deleteUser = async (userId) => {
  const ok = confirm("Are you sure you want to delete this user?");

  if (!ok) return;

  try {
    await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    await loadOverview();
    await loadUsers();
  } catch (error) {
    console.error(error);
  }
};

const openCreateUser = () => {
  document.getElementById("createUserModal").classList.add("show");
};

const closeCreateUser = () => {
  document.getElementById("createUserModal").classList.remove("show");
};

const createUser = async () => {
  const name = document.getElementById("nameInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  const role = document.getElementById("roleInput").value;

  if (!name || !email || !password) {
    alert("Name, email and password are required");
    return;
  }

  const endpoint = role === "admin" ? "/admin/admins" : "/admin/users";

  const body =
    role === "admin"
      ? { name, email, password }
      : { name, email, password, role };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Error creating user");
      return;
    }

    closeCreateUser();

    document.getElementById("nameInput").value = "";
    document.getElementById("emailInput").value = "";
    document.getElementById("passwordInput").value = "";
    document.getElementById("roleInput").value = "user";

    await loadOverview();
    await loadUsers();
  } catch (error) {
    console.error(error);
    alert("Something went wrong while creating the user");
  }
};

const logoutBtn = document.querySelector(".logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "GET",
        credentials: "include"
      });
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("admin_user");

    window.location.href = "/admin-login";
  });
}

loadOverview();
loadUsers();