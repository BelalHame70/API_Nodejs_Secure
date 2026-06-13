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

    // Main colors
    primaryColor: "#0057ff",
    textColor: "#ffffff",

    // Dark theme colors
    backgroundColor: "#0f0f10",
    panelColor: "#111111",
    borderColor: "#2a2a2a",
    inputColor: "#151515",
    assistantBubble: "#151515",
    visitorBubble: "#0057ff",
    assistantText: "#ffffff",
    visitorText: "#ffffff",
    mutedText: "#9ca3af"
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
    // Chat button
    chatButton.style.position = "fixed";
    chatButton.style.bottom = "20px";
    chatButton.style.zIndex = "999999";
    chatButton.style.border = "none";
    chatButton.style.borderRadius = "999px";
    chatButton.style.padding = "12px 18px";
    chatButton.style.cursor = "pointer";
    chatButton.style.background = state.primaryColor;
    chatButton.style.color = state.textColor;
    chatButton.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
    chatButton.style.fontSize = "14px";
    chatButton.style.fontWeight = "600";

    // Main chat box
    chatBox.style.position = "fixed";
    chatBox.style.bottom = "80px";
    chatBox.style.width = "380px";
    chatBox.style.height = "560px";
    chatBox.style.background = state.backgroundColor;
    chatBox.style.border = `1px solid ${state.borderColor}`;
    chatBox.style.borderRadius = "22px";
    chatBox.style.boxShadow = "0 18px 50px rgba(0,0,0,0.55)";
    chatBox.style.overflow = "hidden";
    chatBox.style.zIndex = "999999";
    chatBox.style.display = "none";
    chatBox.style.fontFamily =
      "Inter, Arial, Helvetica, sans-serif";
    chatBox.style.color = "#ffffff";

    // Header
    chatHeader.style.background = state.panelColor;
    chatHeader.style.color = "#ffffff";
    chatHeader.style.padding = "18px 20px";
    chatHeader.style.fontWeight = "700";
    chatHeader.style.fontSize = "18px";
    chatHeader.style.borderBottom = `1px solid ${state.borderColor}`;
    chatHeader.innerText = "Test";

    // Messages area
    messagesContainer.style.height = "418px";
    messagesContainer.style.overflowY = "auto";
    messagesContainer.style.padding = "16px";
    messagesContainer.style.background = state.backgroundColor;
    messagesContainer.style.boxSizing = "border-box";

    // Scrollbar styling
    messagesContainer.style.scrollbarWidth = "thin";
    messagesContainer.style.scrollbarColor = `${state.borderColor} transparent`;

    // Input wrapper
    inputWrapper.style.display = "flex";
    inputWrapper.style.alignItems = "center";
    inputWrapper.style.gap = "10px";
    inputWrapper.style.padding = "14px";
    inputWrapper.style.borderTop = `1px solid ${state.borderColor}`;
    inputWrapper.style.background = state.panelColor;
    inputWrapper.style.boxSizing = "border-box";

    // Input
    input.type = "text";
    input.placeholder = "Type a message...";
    input.style.flex = "1";
    input.style.height = "48px";
    input.style.border = `1px solid ${state.borderColor}`;
    input.style.borderRadius = "14px";
    input.style.outline = "none";
    input.style.padding = "0 16px";
    input.style.fontSize = "14px";
    input.style.background = state.inputColor;
    input.style.color = "#ffffff";
    input.style.boxSizing = "border-box";

    input.onfocus = function () {
      input.style.border = `1px solid ${state.primaryColor}`;
    };

    input.onblur = function () {
      input.style.border = `1px solid ${state.borderColor}`;
    };

    // Send button
    sendButton.type = "button";
    sendButton.innerHTML = "➤";
    sendButton.style.width = "48px";
    sendButton.style.height = "48px";
    sendButton.style.border = `1px solid ${state.borderColor}`;
    sendButton.style.borderRadius = "14px";
    sendButton.style.cursor = "pointer";
    sendButton.style.background = state.inputColor;
    sendButton.style.color = "#ffffff";
    sendButton.style.fontSize = "20px";
    sendButton.style.display = "flex";
    sendButton.style.alignItems = "center";
    sendButton.style.justifyContent = "center";
    sendButton.style.transition = "0.2s ease";

    sendButton.onmouseenter = function () {
      sendButton.style.background = state.primaryColor;
      sendButton.style.borderColor = state.primaryColor;
    };

    sendButton.onmouseleave = function () {
      sendButton.style.background = state.inputColor;
      sendButton.style.borderColor = state.borderColor;
    };

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

    // Mobile responsive
    if (window.innerWidth <= 480) {
      chatBox.style.width = "calc(100vw - 24px)";
      chatBox.style.height = "calc(100vh - 110px)";
      chatBox.style.bottom = "80px";
      chatBox.style.right = "12px";
      chatBox.style.left = "12px";

      messagesContainer.style.height = "calc(100% - 145px)";
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
    row.style.alignItems = "flex-end";
    row.style.gap = "10px";
    row.style.marginBottom = "14px";
    row.style.justifyContent =
      role === "assistant" ? "flex-start" : "flex-end";

    if (role === "assistant") {
      const icon = document.createElement("div");
      icon.innerText = "🤖";
      icon.style.width = "32px";
      icon.style.height = "32px";
      icon.style.minWidth = "32px";
      icon.style.borderRadius = "10px";
      icon.style.background = "#0b1f4d";
      icon.style.color = state.primaryColor;
      icon.style.display = "flex";
      icon.style.alignItems = "center";
      icon.style.justifyContent = "center";
      icon.style.fontSize = "14px";
      icon.style.border = "1px solid #123a8a";

      row.appendChild(icon);
    }

    const bubble = document.createElement("div");
    bubble.style.maxWidth = "78%";
    bubble.style.padding = "12px 16px";
    bubble.style.borderRadius = "18px";
    bubble.style.fontSize = "15px";
    bubble.style.lineHeight = "1.5";
    bubble.style.wordBreak = "break-word";
    bubble.style.whiteSpace = "pre-wrap";
    bubble.style.boxSizing = "border-box";

    if (role === "assistant") {
      bubble.style.background = state.assistantBubble;
      bubble.style.color = state.assistantText;
      bubble.style.border = `1px solid ${state.borderColor}`;
      bubble.style.borderTopLeftRadius = "6px";
    } else {
      bubble.style.background = state.visitorBubble;
      bubble.style.color = state.visitorText;
      bubble.style.border = `1px solid ${state.visitorBubble}`;
      bubble.style.borderTopRightRadius = "6px";
    }

    bubble.innerHTML = escapeHtml(text);

    row.appendChild(bubble);
    messagesContainer.appendChild(row);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addTypingMessage() {
    const row = document.createElement("div");
    row.setAttribute("data-typing", "true");
    row.style.display = "flex";
    row.style.alignItems = "flex-end";
    row.style.gap = "10px";
    row.style.marginBottom = "14px";
    row.style.justifyContent = "flex-start";

    const icon = document.createElement("div");
    icon.innerText = "🤖";
    icon.style.width = "32px";
    icon.style.height = "32px";
    icon.style.minWidth = "32px";
    icon.style.borderRadius = "10px";
    icon.style.background = "#0b1f4d";
    icon.style.color = state.primaryColor;
    icon.style.display = "flex";
    icon.style.alignItems = "center";
    icon.style.justifyContent = "center";
    icon.style.fontSize = "14px";
    icon.style.border = "1px solid #123a8a";

    const bubble = document.createElement("div");
    bubble.innerText = "Typing...";
    bubble.style.maxWidth = "78%";
    bubble.style.padding = "12px 16px";
    bubble.style.borderRadius = "18px";
    bubble.style.borderTopLeftRadius = "6px";
    bubble.style.fontSize = "14px";
    bubble.style.lineHeight = "1.5";
    bubble.style.background = state.assistantBubble;
    bubble.style.color = state.mutedText;
    bubble.style.border = `1px solid ${state.borderColor}`;

    row.appendChild(icon);
    row.appendChild(bubble);

    messagesContainer.appendChild(row);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTypingMessage() {
    const typing = messagesContainer.querySelector('[data-typing="true"]');
    if (typing) {
      typing.remove();
    }
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

      // لو عايز اللون الأزرق يتغير من الداشبورد
      state.primaryColor =
        data.widget.theme_config?.primaryColor || state.primaryColor;

      state.visitorBubble = state.primaryColor;

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
    sendButton.style.opacity = "0.6";
    input.style.opacity = "0.6";

    addTypingMessage();

    try {
      const data = await sendMessage(text);

      removeTypingMessage();

      addMessage("assistant", data.answer || "No response");
    } catch (error) {
      console.error("Send message error:", error);

      removeTypingMessage();

      addMessage("assistant", "Something went wrong");
    } finally {
      input.disabled = false;
      sendButton.disabled = false;
      sendButton.style.opacity = "1";
      input.style.opacity = "1";
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

  window.addEventListener("resize", applyStyles);

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(sendButton);

  chatBox.appendChild(chatHeader);
  chatBox.appendChild(messagesContainer);
  chatBox.appendChild(inputWrapper);

  document.body.appendChild(chatButton);
  document.body.appendChild(chatBox);

  applyStyles();
})();