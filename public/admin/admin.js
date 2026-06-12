const API_BASE_URL = "http://localhost:9000/api/v1";

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
      data.overview.total_users;

    document.getElementById("totalAdmins").textContent =
      data.overview.total_admins;

    document.getElementById("totalAgents").textContent =
      data.overview.total_agents;

    document.getElementById("totalSessions").textContent =
      data.overview.total_sessions;
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

    if (!data.success || data.users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
      return;
    }

    data.users.forEach((user) => {
      const tr = document.createElement("tr");

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
          <button class="action-btn blue" onclick="viewMessages('${user.user_id}')">
            Msgs
          </button>

          ${
            user.role === "admin"
              ? `<button class="action-btn gray" onclick="removeAdmin('${user.user_id}')">Remove</button>`
              : `<button class="action-btn blue" onclick="makeAdmin('${user.user_id}')">Admin</button>`
          }

          <button class="action-btn red" onclick="deleteUser('${user.user_id}')">
            Delete
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
  }
};

const viewMessages = async (userId) => {
  const box = document.getElementById("messagesBox");
  box.innerHTML = "Loading messages...";

  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/messages`, {
      headers: authHeaders()
    });

    const data = await res.json();

    if (!data.success) {
      box.innerHTML = "Could not load messages.";
      return;
    }

    if (!data.sessions || data.sessions.length === 0) {
      box.innerHTML = "No messages found for this user.";
      return;
    }

    box.innerHTML = "";

    data.sessions.forEach((session) => {
      const card = document.createElement("div");
      card.className = "message-card";

      const messages = session.messages || [];

      card.innerHTML = `
        <h4>Session: ${session.session_id}</h4>
        <p>Agent ID: ${session.agent_id}</p>
        <hr />
        ${
          messages.length
            ? messages
                .map(
                  (msg) => `
                    <p>
                      <strong>${msg.role || msg.sender || "message"}:</strong>
                      ${msg.content || msg.message || ""}
                    </p>
                  `
                )
                .join("")
            : "<p>No messages inside this session.</p>"
        }
      `;

      box.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    box.innerHTML = "Error loading messages.";
  }
};

const makeAdmin = async (userId) => {
  await fetch(`${API_BASE_URL}/admin/users/${userId}/make-admin`, {
    method: "PUT",
    headers: authHeaders()
  });

  await loadOverview();
  await loadUsers();
};

const removeAdmin = async (userId) => {
  await fetch(`${API_BASE_URL}/admin/users/${userId}/remove-admin`, {
    method: "PUT",
    headers: authHeaders()
  });

  await loadOverview();
  await loadUsers();
};

const deleteUser = async (userId) => {
  const ok = confirm("Are you sure you want to delete this user?");

  if (!ok) return;

  await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  await loadOverview();
  await loadUsers();
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