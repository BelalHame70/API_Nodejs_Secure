(function () {
  const script = document.currentScript;
  const publicKey = script?.getAttribute("data-public-key");

  if (!publicKey) {
    console.error("Widget Error: data-public-key is missing");
    return;
  }

  const scriptUrl = new URL(script.src);
  const apiBase = `${scriptUrl.origin}/api/v1`;

  let sessionId = null;
  let isOpen = false;
  let isInitialized = false;

  const isArabic =
    document.documentElement.lang?.startsWith("ar") ||
    navigator.language?.startsWith("ar");

  const state = {
    welcomeMessage: isArabic
      ? "مرحباً! كيف يمكنني مساعدتك؟"
      : "Hi! How can I help you?",
    position: "bottom-right",
    primaryColor: "#0057ff",
    textColor: "#ffffff",
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
  chatButton.innerText = isArabic ? "💬 دردشة" : "💬 Chat";

  const chatBox = document.createElement("div");
  const chatHeader = document.createElement("div");
  const messagesContainer = document.createElement("div");
  const inputWrapper = document.createElement("div");
  const input = document.createElement("input");
  const sendButton = document.createElement("button");

  function getWelcomeMessage(welcome) {
    if (!welcome) return state.welcomeMessage;

    if (typeof welcome === "string") return welcome;

    if (typeof welcome === "object") {
      return isArabic
        ? welcome.ar || welcome.en || state.welcomeMessage
        : welcome.en || welcome.ar || state.welcomeMessage;
    }

    return state.welcomeMessage;
  }

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
    chatButton.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
    chatButton.style.fontSize = "14px";
    chatButton.style.fontWeight = "600";

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
    chatBox.style.display = isOpen ? "block" : "none";
    chatBox.style.fontFamily = "Inter, Arial, Helvetica, sans-serif";
    chatBox.style.color = "#ffffff";
    chatBox.style.direction = isArabic ? "rtl" : "ltr";

    chatHeader.style.background = state.panelColor;
    chatHeader.style.color = "#ffffff";
    chatHeader.style.padding = "18px 20px";
    chatHeader.style.fontWeight = "700";
    chatHeader.style.fontSize = "18px";
    chatHeader.style.borderBottom = `1px solid ${state.borderColor}`;
    chatHeader.innerText = isArabic ? "المساعد" : "Test";

    messagesContainer.style.height = "418px";
    messagesContainer.style.overflowY = "auto";
    messagesContainer.style.padding = "16px";
    messagesContainer.style.background = state.backgroundColor;
    messagesContainer.style.boxSizing = "border-box";

    inputWrapper.style.display = "flex";
    inputWrapper.style.alignItems = "center";
    inputWrapper.style.gap = "10px";
    inputWrapper.style.padding = "14px";
    inputWrapper.style.borderTop = `1px solid ${state.borderColor}`;
    inputWrapper.style.background = state.panelColor;
    inputWrapper.style.boxSizing = "border-box";

    input.type = "text";
    input.placeholder = isArabic ? "اكتب رسالتك..." : "Type a message...";
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
    input.style.direction = isArabic ? "rtl" : "ltr";

    sendButton.type = "button";
    sendButton.innerHTML = isArabic ? "➤" : "➤";
    sendButton.style.width = "48px";
    sendButton.style.height = "48px";
    sendButton.style.border = `1px solid ${state.borderColor}`;
    sendButton.style.borderRadius = "14px";
    sendButton.style.cursor = "pointer";
    sendButton.style.background = state.inputColor;
    sendButton.style.color = "#ffffff";
    sendButton.style.fontSize = "20px";

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
    div.textContent = String(text);
    return div.innerHTML;
  }

  function addMessage(role, text) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "10px";
    row.style.marginBottom = "14px";
    row.style.justifyContent = role === "assistant" ? "flex-start" : "flex-end";

    const bubble = document.createElement("div");
    bubble.style.maxWidth = "78%";
    bubble.style.padding = "12px 16px";
    bubble.style.borderRadius = "18px";
    bubble.style.fontSize = "15px";
    bubble.style.lineHeight = "1.5";
    bubble.style.wordBreak = "break-word";
    bubble.style.whiteSpace = "pre-wrap";
    bubble.innerHTML = escapeHtml(text);

    if (role === "assistant") {
      bubble.style.background = state.assistantBubble;
      bubble.style.color = state.assistantText;
      bubble.style.border = `1px solid ${state.borderColor}`;
    } else {
      bubble.style.background = state.visitorBubble;
      bubble.style.color = state.visitorText;
      bubble.style.border = `1px solid ${state.visitorBubble}`;
    }

    row.appendChild(bubble);
    messagesContainer.appendChild(row);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addTypingMessage() {
    addMessage("assistant", isArabic ? "جاري الكتابة..." : "Typing...");
  }

  function removeTypingMessage() {
    const last = messagesContainer.lastChild;
    if (last) last.remove();
  }

  async function createSession() {
    const res = await fetch(`${apiBase}/public/widgets/session`, {
      method: "POST",
      headers: { "x-public-key": publicKey }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to create session");
    }

    sessionId = data.session_id;

    if (data.widget) {
      state.welcomeMessage = getWelcomeMessage(data.widget.welcome_message);
      state.position = data.widget.position || state.position;
      state.primaryColor =
        data.widget.theme_config?.primaryColor || state.primaryColor;
      state.visitorBubble = state.primaryColor;
      state.textColor = data.widget.theme_config?.textColor || state.textColor;
    }

    applyStyles();
    addMessage("assistant", state.welcomeMessage);
  }

  async function sendMessage(message) {
    const res = await fetch(`${apiBase}/public/widgets/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": publicKey
      },
      body: JSON.stringify({ session_id: sessionId, message })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send message");
    }

    return data;
  }

  async function handleOpen() {
    isOpen = !isOpen;
    applyStyles();

    if (!isInitialized) {
      isInitialized = true;
      try {
        await createSession();
      } catch (error) {
        console.error(error);
        addMessage("assistant", isArabic ? "فشل بدء المحادثة" : "Failed to start chat");
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

    addTypingMessage();

    try {
      const data = await sendMessage(text);
      removeTypingMessage();
      addMessage("assistant", data.answer || (isArabic ? "لا يوجد رد" : "No response"));
    } catch (error) {
      removeTypingMessage();
      addMessage("assistant", isArabic ? "حدث خطأ" : "Something went wrong");
    } finally {
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  chatButton.addEventListener("click", handleOpen);
  sendButton.addEventListener("click", handleSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
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