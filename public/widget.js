(function () {
  const script = document.currentScript;
  const publicKey = script?.getAttribute("data-public-key");

  if (!publicKey) {
    console.error("Widget Error: data-public-key is missing");
    return;
  }

  const scriptSrc = script?.src;
  if (!scriptSrc) {
    console.error("Widget Error: script src is missing");
    return;
  }

  const scriptUrl = new URL(scriptSrc);
  const apiBase = `${scriptUrl.origin}/api/v1`;

  let sessionId = null;
  let isOpen = false;
  let isInitialized = false;

  const state = {
    welcomeMessage: "Hi! How can I help you?",
    position: "bottom-right",
    primaryColor: "#111827",
    textColor: "#ffffff"
  };

  const chatButton = document.createElement("button");
  chatButton.type = "button";
  chatButton.innerText = "💬 Chat";

  const chatBox = document.createElement("div");
  const chatHeader = document.createElement("div");
  const messagesContainer = document.createElement("div");
  const inputWrapper = document.createElement("div");
  const input = document.createElement("input");
  const sendButton = document.createElement("button");

  function applyStyles() {
    chatButton.style.position = "fixed";
    chatButton.style.bottom = "20px";
    chatButton.style.zIndex = "999999";
    chatButton.style.border = "none";
    chatButton.style.borderRadius = "999px";
    chatButton.style.padding = "12px 18px";
    chatButton.style.cursor = "pointer";
    chatButton.style.background = state.primaryColor;
    chatButton.style.color = state.textColor;
    chatButton.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
    chatButton.style.fontSize = "14px";

    chatBox.style.position = "fixed";
    chatBox.style.bottom = "80px";
    chatBox.style.width = "340px";
    chatBox.style.height = "460px";
    chatBox.style.background = "#ffffff";
    chatBox.style.border = "1px solid #e5e7eb";
    chatBox.style.borderRadius = "16px";
    chatBox.style.boxShadow = "0 12px 32px rgba(0,0,0,0.18)";
    chatBox.style.overflow = "hidden";
    chatBox.style.zIndex = "999999";
    chatBox.style.display = "none";
    chatBox.style.fontFamily = "Arial, sans-serif";

    chatHeader.style.background = state.primaryColor;
    chatHeader.style.color = state.textColor;
    chatHeader.style.padding = "14px 16px";
    chatHeader.style.fontWeight = "bold";
    chatHeader.style.fontSize = "14px";
    chatHeader.innerText = "Chat Assistant";

    messagesContainer.style.height = "340px";
    messagesContainer.style.overflowY = "auto";
    messagesContainer.style.padding = "12px";
    messagesContainer.style.background = "#f9fafb";

    inputWrapper.style.display = "flex";
    inputWrapper.style.borderTop = "1px solid #e5e7eb";
    inputWrapper.style.background = "#ffffff";

    input.type = "text";
    input.placeholder = "Type your message...";
    input.style.flex = "1";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.padding = "14px";
    input.style.fontSize = "14px";

    sendButton.type = "button";
    sendButton.innerText = "Send";
    sendButton.style.border = "none";
    sendButton.style.padding = "0 16px";
    sendButton.style.cursor = "pointer";
    sendButton.style.background = state.primaryColor;
    sendButton.style.color = state.textColor;
    sendButton.style.fontWeight = "bold";

    if (state.position === "bottom-left") {
      chatButton.style.left = "20px";
      chatButton.style.right = "auto";
      chatBox.style.left = "20px";
      chatBox.style.right = "auto";
    } else {
      chatButton.style.right = "20px";
      chatButton.style.left = "auto";
      chatBox.style.right = "20px";
      chatBox.style.left = "auto";
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function addMessage(role, text) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.marginBottom = "10px";
    row.style.justifyContent = role === "assistant" ? "flex-start" : "flex-end";

    const bubble = document.createElement("div");
    bubble.style.maxWidth = "80%";
    bubble.style.padding = "10px 12px";
    bubble.style.borderRadius = "14px";
    bubble.style.fontSize = "14px";
    bubble.style.lineHeight = "1.4";
    bubble.style.wordBreak = "break-word";

    if (role === "assistant") {
      bubble.style.background = "#e5e7eb";
      bubble.style.color = "#111827";
    } else {
      bubble.style.background = state.primaryColor;
      bubble.style.color = state.textColor;
    }

    bubble.innerHTML = escapeHtml(text);
    row.appendChild(bubble);
    messagesContainer.appendChild(row);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function createSession() {
    const res = await fetch(`${apiBase}/public/widgets/session`, {
      method: "POST",
      headers: {
        "x-public-key": publicKey
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Failed to create session");
    }

    sessionId = data.session_id;

    if (data.widget) {
      state.welcomeMessage =
        data.widget.welcome_message || state.welcomeMessage;
      state.position = data.widget.position || state.position;
      state.primaryColor =
        data.widget.theme_config?.primaryColor || state.primaryColor;
      state.textColor =
        data.widget.theme_config?.textColor || state.textColor;
    }

    applyStyles();

    if (state.welcomeMessage) {
      addMessage("assistant", state.welcomeMessage);
    }
  }

  async function sendMessage(message) {
    const res = await fetch(`${apiBase}/public/widgets/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": publicKey
      },
      body: JSON.stringify({
        session_id: sessionId,
        message
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Failed to send message");
    }

    return data;
  }

  async function handleOpen() {
    isOpen = !isOpen;
    chatBox.style.display = isOpen ? "block" : "none";

    if (!isInitialized) {
      isInitialized = true;

      try {
        await createSession();
      } catch (error) {
        console.error("Session init error:", error);
        addMessage("assistant", "Failed to start chat");
      }
    }
  }

  async function handleSend() {
    const text = input.value.trim();
    if (!text || !sessionId) return;

    addMessage("visitor", text);
    input.value = "";
    input.disabled = true;
    sendButton.disabled = true;

    try {
      const data = await sendMessage(text);
      addMessage("assistant", data.answer || "No response");
    } catch (error) {
      console.error("Send message error:", error);
      addMessage("assistant", "Something went wrong");
    } finally {
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  chatButton.addEventListener("click", handleOpen);
  sendButton.addEventListener("click", handleSend);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      handleSend();
    }
  });

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(sendButton);

  chatBox.appendChild(chatHeader);
  chatBox.appendChild(messagesContainer);
  chatBox.appendChild(inputWrapper);

  document.body.appendChild(chatButton);
  document.body.appendChild(chatBox);

  applyStyles();
})();