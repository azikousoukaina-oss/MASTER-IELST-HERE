'use strict';

window.AssistantSection = (() => {

  let _initialized = false;
  let _conversationHistory = [];
  let _isStreaming = false;
  let _currentStreamDiv = null;

  const QUICK_ACTIONS = [
    { id: 'plan', label: '🗓️ Plan my day', prompt: 'Generate my optimal schedule for today based on my goals and current progress.' },
    { id: 'meal', label: '🍜 Meal ideas', prompt: 'Suggest a healthy, delicious Vietnamese meal plan for today that fits my wellness goals.' },
    { id: 'ielts', label: '📚 IELTS tips', prompt: 'Give me 3 advanced IELTS teaching tips I can use with my students this week.' },
    { id: 'code', label: '💻 Code help', prompt: `I'm on Week ${window.SovereignCurriculum?.getCurrentWeek() || 1} of my coding journey. Help me understand the key concepts I should be mastering.` },
    { id: 'wellness', label: '🌿 Wellness check', prompt: 'Give me a personalized wellness tip for today covering skincare, nutrition, or movement.' },
    { id: 'motivate', label: '✨ Motivate me', prompt: 'I need some motivation and encouragement for my coding and personal development journey today.' }
  ];

  const SYSTEM_PROMPT = `You are the AI assistant built into Sovereign, a personal life-organizer app for Soukaina.

About Soukaina:
- 31-year-old IELTS teacher based in Vietnam (Ho Chi Minh City area)
- Started her full-stack web development journey on May 27, 2026
- Following a 130-week curriculum (HTML → CSS → JS → React → Node.js → Full-Stack → Job-ready)
- Tropical climate, loves Vietnamese food, dedicated to skincare and wellness
- Goals: become a full-stack developer, excel at IELTS teaching, maintain glowing health
- Schedule: balance between work (IELTS classes) and personal development

Your role:
- Be her warm, knowledgeable personal AI companion
- Give practical, specific advice tailored to her situation
- For coding: explain clearly, use real examples, encourage without condescending
- For IELTS: share genuine teaching strategies, student engagement ideas
- For wellness: tropical-climate appropriate, Vietnamese food focus, gentle encouragement
- Keep responses conversational and encouraging
- Use emojis thoughtfully — she appreciates warmth
- Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

  // ─── Render (Panel Chat) ──────────────────────────────────────────────────

  function render(container) {
    container.innerHTML = `
      <div class="section-header-wrap">
        <div class="section-header-text">
          <h2 class="section-title">Assistant</h2>
          <p class="section-subtitle">Your AI companion</p>
        </div>
        <button class="icon-btn" id="chat-clear-btn" title="Clear conversation">🗑️</button>
      </div>
      <div id="assistant-main">
        ${_buildChatUI()}
      </div>
    `;
  }

  function _buildChatUI() {
    const history = SovereignStorage.get('chat_history') || [];
    _conversationHistory = [...history];

    return `
      <div class="chat-container" id="chat-container">
        <div class="chat-messages" id="chat-messages">
          ${history.length === 0 ? _renderWelcome() : history.map(msg => _renderMessage(msg)).join('')}
        </div>
      </div>

      <div class="chat-input-area">
        <div class="quick-actions-row" id="chat-quick-actions">
          ${QUICK_ACTIONS.map(a => `
            <button class="quick-action-chip" data-action="${a.id}">${a.label}</button>
          `).join('')}
        </div>

        <div class="chat-input-row">
          <textarea
            class="chat-input"
            id="chat-input"
            placeholder="Ask me anything..."
            rows="1"
            maxlength="4000"
          ></textarea>
          <button class="chat-send-btn" id="chat-send" ${!ClaudeAI.isReady() ? 'disabled' : ''}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M18 10L2 2l4 8-4 8 16-8z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        ${!ClaudeAI.isReady() ? `
          <div class="chat-api-notice">
            <span>Add your Claude API key in <button class="link-btn" id="chat-goto-settings">Settings</button> to chat</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  function init() {
    if (_initialized) { refresh(); return; }
    _initialized = true;

    _attachChatListeners();
    _scrollToBottom();
  }

  // Also used for the floating AI panel
  function initPanel(container) {
    container.innerHTML = _buildChatUI();
    _attachChatListeners(container);
    _scrollToBottom();
  }

  function refresh() {
    const sendBtn = document.getElementById('chat-send');
    if (sendBtn) sendBtn.disabled = !ClaudeAI.isReady();

    const notice = document.querySelector('.chat-api-notice');
    if (notice && ClaudeAI.isReady()) notice.remove();
  }

  // ─── Render Messages ──────────────────────────────────────────────────────

  function _renderWelcome() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return `
      <div class="chat-welcome">
        <div class="chat-welcome-avatar">✨</div>
        <h3 class="chat-welcome-title">${greeting}, Soukaina!</h3>
        <p class="chat-welcome-text">I'm here to help you with coding, IELTS, wellness, planning, and anything else on your mind. What shall we explore today?</p>
      </div>
    `;
  }

  function _renderMessage(msg) {
    const isUser = msg.role === 'user';
    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return `
      <div class="chat-message-wrap ${isUser ? 'user' : 'assistant'}">
        ${!isUser ? '<div class="chat-avatar">✨</div>' : ''}
        <div class="chat-bubble ${isUser ? 'user' : 'assistant'}">
          <div class="chat-bubble-content">${_formatMessage(msg.content)}</div>
          ${time ? `<div class="chat-bubble-time">${time}</div>` : ''}
        </div>
      </div>
    `;
  }

  function _formatMessage(text) {
    // Basic markdown-like formatting
    return SovereignUtils.sanitizeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  function _appendMessage(role, content, streamable = false) {
    const msgs = document.getElementById('chat-messages');
    if (!msgs) return null;

    // Remove welcome if present
    const welcome = msgs.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const wrap = document.createElement('div');
    wrap.className = `chat-message-wrap ${role === 'user' ? 'user' : 'assistant'}`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    wrap.innerHTML = `
      ${role !== 'user' ? '<div class="chat-avatar">✨</div>' : ''}
      <div class="chat-bubble ${role === 'user' ? 'user' : 'assistant'}">
        <div class="chat-bubble-content" id="${streamable ? 'streaming-content' : ''}">
          ${streamable ? '<div class="ai-typing"><span></span><span></span><span></span></div>' : _formatMessage(content)}
        </div>
        <div class="chat-bubble-time">${time}</div>
      </div>
    `;

    msgs.appendChild(wrap);
    _scrollToBottom();

    if (streamable) {
      return wrap.querySelector('#streaming-content');
    }
    return null;
  }

  function _scrollToBottom() {
    requestAnimationFrame(() => {
      const msgs = document.getElementById('chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  }

  // ─── Send Message ─────────────────────────────────────────────────────────

  async function _sendMessage(userText) {
    if (!userText.trim() || _isStreaming) return;
    if (!ClaudeAI.isReady()) {
      SovereignUtils.toast('Add your Claude API key in Settings', 'info');
      return;
    }

    const input = document.getElementById('chat-input');
    if (input) input.value = '';

    // Add to history
    const userMsg = { role: 'user', content: userText, timestamp: new Date().toISOString() };
    _conversationHistory.push(userMsg);
    _appendMessage('user', userText);

    // Show typing indicator
    const streamDiv = _appendMessage('assistant', '', true);
    _currentStreamDiv = streamDiv;
    _isStreaming = true;

    // Disable send
    const sendBtn = document.getElementById('chat-send');
    if (sendBtn) sendBtn.disabled = true;

    let fullResponse = '';

    try {
      // Build messages for API (without timestamps, just role/content)
      const apiMessages = _conversationHistory.map(m => ({ role: m.role, content: m.content }));

      await ClaudeAI.stream(
        apiMessages,
        SYSTEM_PROMPT,
        (chunk) => {
          fullResponse += chunk;
          if (_currentStreamDiv) {
            _currentStreamDiv.innerHTML = _formatMessage(fullResponse);
            _scrollToBottom();
          }
        },
        () => {
          // Done
          const assistantMsg = { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() };
          _conversationHistory.push(assistantMsg);

          // Persist (keep last 50 messages)
          const toSave = _conversationHistory.slice(-50);
          SovereignStorage.set('chat_history', toSave);

          _isStreaming = false;
          _currentStreamDiv = null;
          if (sendBtn && ClaudeAI.isReady()) sendBtn.disabled = false;
        }
      );
    } catch (err) {
      if (_currentStreamDiv) {
        _currentStreamDiv.innerHTML = '<em>Sorry, I had trouble responding. Please try again.</em>';
      }
      _isStreaming = false;
      _currentStreamDiv = null;
      if (sendBtn && ClaudeAI.isReady()) sendBtn.disabled = false;
    }
  }

  // ─── Listeners ────────────────────────────────────────────────────────────

  function _attachChatListeners(root = document) {
    const sendBtn = root.getElementById ? root.getElementById('chat-send') : root.querySelector('#chat-send');
    const input = root.getElementById ? root.getElementById('chat-input') : root.querySelector('#chat-input');
    const clearBtn = root.getElementById ? root.getElementById('chat-clear-btn') : root.querySelector('#chat-clear-btn');
    const quickActions = root.getElementById ? root.getElementById('chat-quick-actions') : root.querySelector('#chat-quick-actions');
    const gotoSettings = root.getElementById ? root.getElementById('chat-goto-settings') : root.querySelector('#chat-goto-settings');

    sendBtn?.addEventListener('click', () => {
      const text = input?.value.trim();
      if (text) _sendMessage(text);
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = input.value.trim();
        if (text) _sendMessage(text);
      }
    });

    // Auto-resize textarea
    input?.addEventListener('input', () => {
      if (!input) return;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    // Quick actions
    quickActions?.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-action]');
      if (!chip) return;
      const action = QUICK_ACTIONS.find(a => a.id === chip.dataset.action);
      if (action) {
        _sendMessage(action.prompt);
        // Hide quick actions after use
        quickActions.style.display = 'none';
      }
    });

    // Clear conversation
    clearBtn?.addEventListener('click', () => {
      SovereignUtils.showModal(
        'Clear Conversation?',
        '<p style="text-align:center;padding:16px 0">This will delete the current conversation history.</p>',
        [
          { label: 'Cancel', action: () => SovereignUtils.closeModal() },
          {
            label: 'Clear',
            danger: true,
            action: () => {
              _conversationHistory = [];
              SovereignStorage.remove('chat_history');
              const msgs = document.getElementById('chat-messages');
              if (msgs) msgs.innerHTML = _renderWelcome();
              SovereignUtils.closeModal();
            }
          }
        ]
      );
    });

    // Go to settings
    gotoSettings?.addEventListener('click', () => {
      if (window.SovereignApp) SovereignApp.navigate('settings');
    });
  }

  // ─── Floating Panel API ───────────────────────────────────────────────────

  function setupFloatingPanel() {
    const panel = document.getElementById('ai-panel');
    if (!panel || panel.dataset.chatInitialized) return;
    panel.dataset.chatInitialized = 'true';

    // Panel has #ai-chat-messages and #ai-chat-input from index.html
    // Reuse the same conversation history
    const panelMsgs = panel.querySelector('#ai-chat-messages') || panel.querySelector('.ai-chat-messages');
    const panelInput = panel.querySelector('#ai-chat-input') || panel.querySelector('.ai-chat-input');
    const panelSend = panel.querySelector('#ai-chat-send') || panel.querySelector('.ai-chat-send');
    const panelActions = panel.querySelector('.quick-actions') || panel.querySelector('#ai-quick-actions');

    if (!panelMsgs || !panelInput || !panelSend) return;

    // Populate with history
    const history = SovereignStorage.get('chat_history') || [];
    _conversationHistory = [...history];

    if (history.length === 0) {
      panelMsgs.innerHTML = _renderWelcome();
    } else {
      panelMsgs.innerHTML = history.slice(-10).map(m => _renderMessage(m)).join('');
    }
    panelMsgs.scrollTop = panelMsgs.scrollHeight;

    // Quick actions in panel
    panelActions?.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-action]');
      if (!chip) return;
      const action = QUICK_ACTIONS.find(a => a.id === chip.dataset.action);
      if (action) _sendFromPanel(action.prompt, panelMsgs, panelInput);
    });

    panelSend.addEventListener('click', () => {
      const text = panelInput.value.trim();
      if (text) _sendFromPanel(text, panelMsgs, panelInput);
    });

    panelInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = panelInput.value.trim();
        if (text) _sendFromPanel(text, panelMsgs, panelInput);
      }
    });
  }

  async function _sendFromPanel(text, msgsEl, inputEl) {
    if (!text || _isStreaming) return;
    if (!ClaudeAI.isReady()) {
      SovereignUtils.toast('Add API key in Settings', 'info');
      return;
    }

    inputEl.value = '';

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    _conversationHistory.push(userMsg);

    // Append user message
    const userWrap = document.createElement('div');
    userWrap.className = 'chat-message-wrap user';
    userWrap.innerHTML = `<div class="chat-bubble user"><div class="chat-bubble-content">${_formatMessage(text)}</div></div>`;
    msgsEl.appendChild(userWrap);

    // Typing indicator
    const assistantWrap = document.createElement('div');
    assistantWrap.className = 'chat-message-wrap assistant';
    assistantWrap.innerHTML = `<div class="chat-avatar">✨</div><div class="chat-bubble assistant"><div class="chat-bubble-content streaming-content"><div class="ai-typing"><span></span><span></span><span></span></div></div></div>`;
    msgsEl.appendChild(assistantWrap);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    const streamContent = assistantWrap.querySelector('.streaming-content');
    _isStreaming = true;

    let fullResponse = '';
    try {
      const apiMessages = _conversationHistory.map(m => ({ role: m.role, content: m.content }));
      await ClaudeAI.stream(apiMessages, SYSTEM_PROMPT,
        (chunk) => {
          fullResponse += chunk;
          if (streamContent) {
            streamContent.innerHTML = _formatMessage(fullResponse);
            msgsEl.scrollTop = msgsEl.scrollHeight;
          }
        },
        () => {
          const assistantMsg = { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() };
          _conversationHistory.push(assistantMsg);
          SovereignStorage.set('chat_history', _conversationHistory.slice(-50));
          _isStreaming = false;
        }
      );
    } catch {
      if (streamContent) streamContent.innerHTML = '<em>Error. Please try again.</em>';
      _isStreaming = false;
    }
  }

  return { render, init, refresh, setupFloatingPanel, initPanel };

})();
