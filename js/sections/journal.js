'use strict';

window.JournalSection = (() => {

  let _initialized = false;
  let _activeMode = 'write';
  let _canvas = null;
  let _ctx = null;
  let _drawing = false;
  let _brushColor = '#C9886C';
  let _brushSize = 4;
  let _drawTool = 'pen';
  let _mediaRecorder = null;
  let _audioChunks = [];
  let _recordingBlob = null;
  let _isRecording = false;
  let _currentEntryId = null;

  const MOODS = [
    { id: 'glowing', emoji: '🌟', label: 'Glowing' },
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'focused', emoji: '🎯', label: 'Focused' },
    { id: 'tired', emoji: '😴', label: 'Tired' },
    { id: 'anxious', emoji: '😟', label: 'Anxious' },
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'grateful', emoji: '🙏', label: 'Grateful' }
  ];

  const PROMPTS = [
    "What made you smile today?",
    "Describe a moment of beauty you witnessed today.",
    "What are you grateful for right now?",
    "What's one thing you learned today?",
    "How did your body feel today? What did it need?",
    "What challenged you, and how did you respond?",
    "Describe your current mood in three words.",
    "What would make tomorrow perfect?",
    "Who inspired you recently, and why?",
    "What's one small win from today?",
    "If today were a color, what would it be?",
    "What coding concept clicked for you today?",
    "How are your IELTS students progressing?",
    "What does your ideal day in Vietnam look like?",
    "Write a loving message to your future self.",
    "What does your body need more of?",
    "Describe your skincare ritual today.",
    "What Vietnamese dish nourished you today?",
    "What coding concept are you excited to learn next?",
    "Write down three affirmations for tomorrow."
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  function render(container) {
    container.innerHTML = `
      <div class="section-header-wrap">
        <div class="section-header-text">
          <h2 class="section-title">Journal</h2>
          <p class="section-subtitle">Your inner world</p>
        </div>
        <button class="icon-btn" id="journal-entries-btn" title="Past entries">📖</button>
      </div>

      <!-- Mode switcher -->
      <div class="journal-mode-switcher">
        <button class="journal-mode-btn active" data-mode="write">✍️ Write</button>
        <button class="journal-mode-btn" data-mode="draw">🎨 Draw</button>
        <button class="journal-mode-btn" data-mode="voice">🎤 Voice</button>
      </div>

      <div id="journal-main"></div>
    `;
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  function init() {
    if (_initialized) { refresh(); return; }
    _initialized = true;

    document.querySelector('.journal-mode-switcher')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mode]');
      if (!btn) return;
      document.querySelectorAll('.journal-mode-switcher .journal-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeMode = btn.dataset.mode;
      _renderMode();
    });

    document.getElementById('journal-entries-btn')?.addEventListener('click', _showEntries);

    _renderMode();
  }

  function refresh() {
    _renderMode();
  }

  function _renderMode() {
    const modes = {
      write: _renderWriteMode,
      draw: _renderDrawMode,
      voice: _renderVoiceMode
    };
    (modes[_activeMode] || modes.write)();
  }

  // ─── Write Mode ───────────────────────────────────────────────────────────

  function _renderWriteMode() {
    const main = document.getElementById('journal-main');
    if (!main) return;

    const today = SovereignUtils.formatDate(new Date());
    const todayEntries = (SovereignStorage.get('journal_entries') || []).filter(e => e.date === today.slice(0, 10) && e.type === 'text');
    const existing = todayEntries[0] || null;
    _currentEntryId = existing?.id || null;

    const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    const currentMood = existing?.mood || null;

    main.innerHTML = `
      <div class="journal-write-panel">
        <!-- Date & Prompt -->
        <div class="journal-date">${today}</div>

        <!-- Mood Selector -->
        <div class="journal-mood-section">
          <span class="journal-mood-label">How are you feeling?</span>
          <div class="mood-selector" id="mood-selector">
            ${MOODS.map(m => `
              <button class="mood-btn ${currentMood === m.id ? 'selected' : ''}" data-mood="${m.id}" title="${m.label}">
                <span class="mood-emoji">${m.emoji}</span>
                <span class="mood-label">${m.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Prompt Suggestion -->
        <div class="journal-prompt-row">
          <span class="journal-prompt-text" id="journal-prompt">${SovereignUtils.sanitizeHtml(randomPrompt)}</span>
          <button class="icon-btn journal-refresh-prompt" id="journal-refresh-prompt" title="New prompt">🔀</button>
        </div>

        <!-- Main Text Area -->
        <textarea
          class="journal-textarea"
          id="journal-text"
          placeholder="Write freely... this is your safe space 🌸"
          spellcheck="true"
        >${SovereignUtils.sanitizeHtml(existing?.content || '')}</textarea>

        <!-- Tags -->
        <div class="journal-tags-row">
          <input type="text" class="form-input journal-tags-input" id="journal-tags"
            placeholder="Tags: gratitude, coding, wellness..."
            value="${existing?.tags ? existing.tags.join(', ') : ''}">
        </div>

        <!-- Actions -->
        <div class="journal-actions">
          <button class="btn btn-ghost" id="journal-ai-reflect">✨ AI Reflection</button>
          <button class="btn btn-primary" id="journal-save">Save Entry 💾</button>
        </div>

        <!-- AI Reflection -->
        <div class="journal-reflection hidden" id="journal-reflection">
          <div class="journal-reflection-header">
            <span>✨ Your AI Reflection</span>
            <button class="icon-btn" id="journal-reflection-close">✕</button>
          </div>
          <div class="journal-reflection-content" id="journal-reflection-content"></div>
        </div>
      </div>
    `;

    // Mood selection
    document.getElementById('mood-selector')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mood]');
      if (!btn) return;
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });

    // Refresh prompt
    document.getElementById('journal-refresh-prompt')?.addEventListener('click', () => {
      const el = document.getElementById('journal-prompt');
      if (el) el.textContent = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    });

    // Save
    document.getElementById('journal-save')?.addEventListener('click', _saveTextEntry);

    // AI Reflect
    document.getElementById('journal-ai-reflect')?.addEventListener('click', _aiReflect);

    // Reflection close
    document.getElementById('journal-reflection-close')?.addEventListener('click', () => {
      document.getElementById('journal-reflection')?.classList.add('hidden');
    });

    // Auto-save on type (debounced)
    const autoSave = SovereignUtils.debounce(_saveTextEntry, 3000);
    document.getElementById('journal-text')?.addEventListener('input', autoSave);
  }

  function _saveTextEntry() {
    const content = document.getElementById('journal-text')?.value.trim();
    const moodBtn = document.querySelector('.mood-btn.selected');
    const mood = moodBtn?.dataset.mood || null;
    const tagsRaw = document.getElementById('journal-tags')?.value.trim();
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!content) return;

    const today = new Date().toISOString().slice(0, 10);
    const entry = {
      id: _currentEntryId || SovereignUtils.generateId(),
      type: 'text',
      date: today,
      content,
      mood,
      tags,
      createdAt: _currentEntryId
        ? (SovereignStorage.get('journal_entries') || []).find(e => e.id === _currentEntryId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    SovereignStorage.update('journal_entries', (prev = []) => {
      const filtered = (prev || []).filter(e => e.id !== entry.id);
      return [entry, ...filtered];
    });

    if (!_currentEntryId) {
      _currentEntryId = entry.id;
      SovereignUtils.toast('Entry saved ✓', 'success');
    }
  }

  async function _aiReflect() {
    if (!ClaudeAI.isReady()) {
      SovereignUtils.toast('Add your Claude API key in Settings for AI reflections', 'info');
      return;
    }

    const content = document.getElementById('journal-text')?.value.trim();
    if (!content || content.length < 20) {
      SovereignUtils.toast('Write more before asking for a reflection', 'info');
      return;
    }

    const panel = document.getElementById('journal-reflection');
    const contentEl = document.getElementById('journal-reflection-content');
    if (!panel || !contentEl) return;

    panel.classList.remove('hidden');
    contentEl.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';

    const moodBtn = document.querySelector('.mood-btn.selected');
    const mood = moodBtn?.dataset.mood || 'not specified';

    try {
      let reflection = '';
      await ClaudeAI.stream(
        [{ role: 'user', content: `My journal entry today:\n\n${content}\n\nMood: ${mood}` }],
        `You are a compassionate journaling coach for Soukaina. Provide a warm, insightful reflection on her journal entry.
         Be empathetic, encouraging, and mention specific things she wrote.
         End with one thoughtful question for deeper reflection. Keep it to 2-3 short paragraphs.`,
        (chunk) => {
          reflection += chunk;
          contentEl.innerHTML = `<p>${SovereignUtils.sanitizeHtml(reflection)}</p>`;
        },
        () => {
          // Save reflection with entry
          if (_currentEntryId) {
            SovereignStorage.update('journal_entries', (prev = []) =>
              (prev || []).map(e => e.id === _currentEntryId ? { ...e, aiReflection: reflection } : e)
            );
          }
        }
      );
    } catch {
      contentEl.innerHTML = '<p class="error-text">Could not generate reflection. Please try again.</p>';
    }
  }

  // ─── Draw Mode ────────────────────────────────────────────────────────────

  function _renderDrawMode() {
    const main = document.getElementById('journal-main');
    if (!main) return;

    const COLORS = ['#C9886C', '#B8768A', '#9B7BAE', '#7BAE9B', '#7B9BAE', '#AE9B7B', '#E8DDD4', '#2D1B14', '#ffffff', '#000000'];

    main.innerHTML = `
      <div class="journal-canvas-wrap">
        <!-- Canvas Toolbar -->
        <div class="canvas-toolbar">
          <div class="canvas-tools">
            <button class="canvas-tool-btn active" data-tool="pen" title="Pen">✏️</button>
            <button class="canvas-tool-btn" data-tool="marker" title="Marker">🖊️</button>
            <button class="canvas-tool-btn" data-tool="eraser" title="Eraser">⬜</button>
          </div>

          <div class="canvas-colors">
            ${COLORS.map(c => `<button class="color-dot ${c === _brushColor ? 'active' : ''}" data-color="${c}" style="background: ${c}"></button>`).join('')}
          </div>

          <div class="canvas-size">
            <input type="range" class="range-input canvas-size-slider" id="brush-size" min="1" max="20" value="${_brushSize}">
          </div>

          <div class="canvas-actions">
            <button class="btn btn-ghost btn-sm" id="canvas-clear">Clear</button>
            <button class="btn btn-primary btn-sm" id="canvas-save">Save 💾</button>
          </div>
        </div>

        <!-- Canvas -->
        <canvas id="journal-canvas" class="journal-canvas" width="800" height="500"></canvas>
      </div>
    `;

    _initCanvas();

    // Toolbar listeners
    document.querySelector('.canvas-tools')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tool]');
      if (!btn) return;
      document.querySelectorAll('.canvas-tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _drawTool = btn.dataset.tool;
    });

    document.querySelector('.canvas-colors')?.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-color]');
      if (!dot) return;
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      _brushColor = dot.dataset.color;
    });

    document.getElementById('brush-size')?.addEventListener('input', (e) => {
      _brushSize = parseInt(e.target.value);
    });

    document.getElementById('canvas-clear')?.addEventListener('click', () => {
      if (_canvas && _ctx) {
        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
      }
    });

    document.getElementById('canvas-save')?.addEventListener('click', _saveCanvasEntry);
  }

  function _initCanvas() {
    _canvas = document.getElementById('journal-canvas');
    if (!_canvas) return;
    _ctx = _canvas.getContext('2d');

    // Responsive canvas
    const wrap = _canvas.parentElement;
    if (wrap) {
      const resize = () => {
        const w = wrap.clientWidth - 32;
        const scale = window.devicePixelRatio || 1;
        _canvas.style.width = w + 'px';
        _canvas.style.height = (w * 0.625) + 'px';
        _canvas.width = w * scale;
        _canvas.height = (w * 0.625) * scale;
        _ctx.scale(scale, scale);
      };
      resize();
    }

    // Fill white background
    _ctx.fillStyle = '#FDF6F0';
    _ctx.fillRect(0, 0, _canvas.width, _canvas.height);

    // Mouse events
    _canvas.addEventListener('mousedown', _startDraw);
    _canvas.addEventListener('mousemove', _draw);
    _canvas.addEventListener('mouseup', _endDraw);
    _canvas.addEventListener('mouseleave', _endDraw);

    // Touch events
    _canvas.addEventListener('touchstart', _touchStart, { passive: false });
    _canvas.addEventListener('touchmove', _touchMove, { passive: false });
    _canvas.addEventListener('touchend', _endDraw);
  }

  function _getCanvasPos(e) {
    const rect = _canvas.getBoundingClientRect();
    const scaleX = _canvas.width / rect.width / (window.devicePixelRatio || 1);
    const scaleY = _canvas.height / rect.height / (window.devicePixelRatio || 1);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function _startDraw(e) {
    _drawing = true;
    const pos = _getCanvasPos(e);
    _ctx.beginPath();
    _ctx.moveTo(pos.x, pos.y);
  }

  function _draw(e) {
    if (!_drawing || !_ctx) return;
    const pos = _getCanvasPos(e);

    if (_drawTool === 'eraser') {
      _ctx.clearRect(pos.x - _brushSize, pos.y - _brushSize, _brushSize * 2, _brushSize * 2);
      return;
    }

    _ctx.lineTo(pos.x, pos.y);
    _ctx.strokeStyle = _brushColor;
    _ctx.lineWidth = _drawTool === 'marker' ? _brushSize * 2 : _brushSize;
    _ctx.lineCap = 'round';
    _ctx.lineJoin = 'round';
    _ctx.globalAlpha = _drawTool === 'marker' ? 0.5 : 1;
    _ctx.stroke();
  }

  function _endDraw() {
    _drawing = false;
    if (_ctx) _ctx.globalAlpha = 1;
  }

  function _touchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    _startDraw({ clientX: touch.clientX, clientY: touch.clientY });
  }

  function _touchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    _draw({ clientX: touch.clientX, clientY: touch.clientY });
  }

  async function _saveCanvasEntry() {
    if (!_canvas) return;
    try {
      _canvas.toBlob(async (blob) => {
        if (!blob) { SovereignUtils.toast('Could not save drawing', 'error'); return; }
        const id = SovereignUtils.generateId();
        await SovereignStorage.saveBlob(`canvas_${id}`, blob);

        const entry = {
          id,
          type: 'canvas',
          date: new Date().toISOString().slice(0, 10),
          blobId: `canvas_${id}`,
          createdAt: new Date().toISOString()
        };

        SovereignStorage.update('journal_entries', (prev = []) => [entry, ...(prev || [])]);
        SovereignUtils.toast('Drawing saved! 🎨', 'success');
      }, 'image/png');
    } catch {
      SovereignUtils.toast('Could not save drawing', 'error');
    }
  }

  // ─── Voice Mode ───────────────────────────────────────────────────────────

  function _renderVoiceMode() {
    const main = document.getElementById('journal-main');
    if (!main) return;

    const voiceEntries = (SovereignStorage.get('journal_entries') || []).filter(e => e.type === 'voice');

    main.innerHTML = `
      <div class="journal-voice-panel">
        <div class="voice-record-section">
          <div class="voice-record-visual" id="voice-visual">
            <div class="voice-waveform">
              ${Array.from({ length: 20 }, () => '<div class="voice-bar"></div>').join('')}
            </div>
          </div>

          <div class="voice-timer" id="voice-timer">00:00</div>

          <button class="voice-record-btn ${_isRecording ? 'recording' : ''}" id="voice-record-btn">
            ${_isRecording ? '⏹ Stop' : '🎤 Start Recording'}
          </button>

          ${_recordingBlob ? `
            <div class="voice-preview-section">
              <audio id="voice-preview" controls></audio>
              <div class="voice-preview-actions">
                <button class="btn btn-ghost btn-sm" id="voice-discard">Discard</button>
                <button class="btn btn-primary btn-sm" id="voice-save">Save Recording 💾</button>
              </div>
            </div>
          ` : ''}
        </div>

        ${voiceEntries.length > 0 ? `
          <div class="voice-entries-section">
            <h4 class="voice-entries-label">Past Voice Notes</h4>
            <div class="voice-entries-list">
              ${voiceEntries.slice(0, 5).map(e => `
                <div class="voice-entry-item" data-entry-id="${e.id}">
                  <span class="voice-entry-icon">🎤</span>
                  <div class="voice-entry-info">
                    <span class="voice-entry-date">${SovereignUtils.formatRelativeDate(e.createdAt)}</span>
                    <span class="voice-entry-duration">${e.duration ? SovereignUtils.formatDuration(Math.round(e.duration / 60)) : ''}</span>
                  </div>
                  <button class="icon-btn voice-play-btn" data-id="${e.id}">▶</button>
                  <button class="icon-btn voice-delete-btn" data-id="${e.id}">🗑️</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    _setupVoiceRecorder();
    _attachVoiceListeners();
  }

  let _voiceTimerInterval = null;
  let _voiceSeconds = 0;

  function _setupVoiceRecorder() {
    const btn = document.getElementById('voice-record-btn');
    btn?.addEventListener('click', async () => {
      if (_isRecording) {
        _stopRecording();
      } else {
        await _startRecording();
      }
    });
  }

  async function _startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      _audioChunks = [];
      _mediaRecorder = new MediaRecorder(stream);

      _mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) _audioChunks.push(e.data);
      };

      _mediaRecorder.onstop = () => {
        _recordingBlob = new Blob(_audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        _renderVoiceMode();

        // Set audio src
        setTimeout(() => {
          const preview = document.getElementById('voice-preview');
          if (preview && _recordingBlob) {
            preview.src = URL.createObjectURL(_recordingBlob);
          }
        }, 100);
      };

      _mediaRecorder.start(100);
      _isRecording = true;

      // Timer
      _voiceSeconds = 0;
      _voiceTimerInterval = setInterval(() => {
        _voiceSeconds++;
        const m = String(Math.floor(_voiceSeconds / 60)).padStart(2, '0');
        const s = String(_voiceSeconds % 60).padStart(2, '0');
        const timer = document.getElementById('voice-timer');
        if (timer) timer.textContent = `${m}:${s}`;

        // Animate waveform
        document.querySelectorAll('.voice-bar').forEach(bar => {
          bar.style.height = (Math.random() * 30 + 5) + 'px';
        });
      }, 1000);

      const btn = document.getElementById('voice-record-btn');
      if (btn) { btn.textContent = '⏹ Stop'; btn.classList.add('recording'); }

    } catch (err) {
      SovereignUtils.toast('Microphone access denied. Allow microphone in browser settings.', 'error');
    }
  }

  function _stopRecording() {
    _isRecording = false;
    clearInterval(_voiceTimerInterval);
    _mediaRecorder?.stop();
  }

  function _attachVoiceListeners() {
    document.getElementById('voice-discard')?.addEventListener('click', () => {
      _recordingBlob = null;
      _renderVoiceMode();
    });

    document.getElementById('voice-save')?.addEventListener('click', async () => {
      if (!_recordingBlob) return;
      const id = SovereignUtils.generateId();
      try {
        await SovereignStorage.saveBlob(`voice_${id}`, _recordingBlob);
        const entry = {
          id,
          type: 'voice',
          date: new Date().toISOString().slice(0, 10),
          blobId: `voice_${id}`,
          duration: _voiceSeconds * 1000,
          createdAt: new Date().toISOString()
        };
        SovereignStorage.update('journal_entries', (prev = []) => [entry, ...(prev || [])]);
        _recordingBlob = null;
        _voiceSeconds = 0;
        SovereignUtils.toast('Voice note saved! 🎤', 'success');
        _renderVoiceMode();
      } catch {
        SovereignUtils.toast('Could not save voice note', 'error');
      }
    });

    document.querySelector('.voice-entries-list')?.addEventListener('click', async (e) => {
      const playBtn = e.target.closest('.voice-play-btn');
      if (playBtn) {
        const blob = await SovereignStorage.loadBlob(`voice_${playBtn.dataset.id}`);
        if (blob) {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play();
        }
        return;
      }

      const deleteBtn = e.target.closest('.voice-delete-btn');
      if (deleteBtn) {
        await SovereignStorage.deleteBlob(`voice_${deleteBtn.dataset.id}`);
        SovereignStorage.update('journal_entries', (prev = []) => (prev || []).filter(e => e.id !== deleteBtn.dataset.id));
        SovereignUtils.toast('Recording deleted', 'success');
        _renderVoiceMode();
      }
    });
  }

  // ─── Past Entries ─────────────────────────────────────────────────────────

  function _showEntries() {
    const entries = (SovereignStorage.get('journal_entries') || [])
      .filter(e => e.type === 'text')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const moodMap = Object.fromEntries(MOODS.map(m => [m.id, m.emoji]));

    SovereignUtils.showModal(
      'Journal Entries',
      entries.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📖</div>
          <div class="empty-state-title">No entries yet</div>
          <div class="empty-state-text">Start writing today!</div>
        </div>
      ` : `
        <div class="journal-entries-list">
          ${entries.slice(0, 20).map(e => `
            <div class="journal-entry-item" data-entry-id="${e.id}">
              <div class="journal-entry-meta">
                <span class="journal-entry-date">${SovereignUtils.formatRelativeDate(e.createdAt)}</span>
                ${e.mood ? `<span class="journal-entry-mood">${moodMap[e.mood] || ''}</span>` : ''}
              </div>
              <p class="journal-entry-preview">${SovereignUtils.sanitizeHtml(SovereignUtils.truncate(e.content, 120))}</p>
              ${e.tags?.length ? `<div class="journal-entry-tags">${e.tags.slice(0, 3).map(t => `<span class="tag-chip">${SovereignUtils.sanitizeHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `,
      [{ label: 'Close', action: () => SovereignUtils.closeModal() }]
    );

    setTimeout(() => {
      document.querySelectorAll('.journal-entry-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.entryId;
          const entry = entries.find(e => e.id === id);
          if (!entry) return;
          SovereignUtils.closeModal();
          _currentEntryId = entry.id;
          _activeMode = 'write';
          document.querySelectorAll('.journal-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'write'));
          _renderWriteMode();
          setTimeout(() => {
            const textarea = document.getElementById('journal-text');
            if (textarea) textarea.value = entry.content;
            const moodBtn = document.querySelector(`[data-mood="${entry.mood}"]`);
            if (moodBtn) moodBtn.classList.add('selected');
          }, 100);
        });
      });
    }, 100);
  }

  return { render, init, refresh };

})();
