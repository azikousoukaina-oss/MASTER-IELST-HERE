'use strict';

window.CodelabSection = (() => {

  let _initialized = false;
  let _monacoReady = false;
  let _editor = null;
  let _previewDoc = null;
  let _timerInterval = null;
  let _timerSeconds = 0;
  let _timerRunning = false;
  let _currentLang = 'html';

  const STARTER_TEMPLATES = {
    html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n  <style>\n    body {\n      font-family: 'Inter', sans-serif;\n      background: #1a1a2e;\n      color: #eee;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      min-height: 100vh;\n      margin: 0;\n    }\n    h1 { color: #C9886C; }\n  </style>\n</head>\n<body>\n  <h1>Hello, Soukaina! 🌸</h1>\n  <p>Edit this code and see the preview update live.</p>\n</body>\n</html>`,
    css: `/* CSS Playground */\nbody {\n  font-family: sans-serif;\n  padding: 24px;\n  background: #f9f5f2;\n}\n\n.card {\n  background: white;\n  border-radius: 16px;\n  padding: 24px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.1);\n  max-width: 400px;\n  margin: 0 auto;\n}\n\nh1 {\n  color: #C9886C;\n  margin-bottom: 8px;\n}`,
    javascript: `// JavaScript Playground\nconsole.log('Hello from Code Lab!');\n\n// Try some JS:\nconst greet = (name) => {\n  return \`Hello, \${name}! You are amazing. 🌸\`;\n};\n\nconsole.log(greet('Soukaina'));\n\n// Array practice:\nconst skills = ['HTML', 'CSS', 'JavaScript'];\nskills.forEach((skill, i) => {\n  console.log(\`\${i + 1}. \${skill}\`);\n});`
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  function render(container) {
    container.innerHTML = `
      <div class="codelab-container">
        <!-- Toolbar -->
        <div class="codelab-toolbar">
          <div class="codelab-lang-switcher">
            <button class="lang-btn active" data-lang="html">HTML</button>
            <button class="lang-btn" data-lang="css">CSS</button>
            <button class="lang-btn" data-lang="javascript">JS</button>
          </div>

          <div class="codelab-toolbar-actions">
            <button class="icon-btn codelab-btn" id="cl-run" title="Run (⌘+Enter)">▶ Run</button>
            <button class="icon-btn codelab-btn" id="cl-format" title="Format code">⚙ Format</button>
            ${ClaudeAI.isReady() ? '<button class="icon-btn codelab-btn ai-review-btn" id="cl-ai-review" title="AI Review">✨ Review</button>' : ''}
            <button class="icon-btn codelab-btn" id="cl-save" title="Save snippet">💾 Save</button>
            <button class="icon-btn codelab-btn" id="cl-load" title="Load snippet">📂 Load</button>
          </div>

          <div class="codelab-timer">
            <button class="codelab-timer-btn" id="cl-timer-toggle">⏱ 00:00</button>
            <button class="icon-btn" id="cl-timer-reset" title="Reset timer">↺</button>
          </div>
        </div>

        <!-- Editor + Preview Panels -->
        <div class="codelab-panels" id="cl-panels">
          <div class="codelab-editor-panel">
            <div class="codelab-panel-header">
              <span id="cl-lang-label">HTML</span>
              <button class="icon-btn" id="cl-template" title="Reset to template">Template</button>
              <button class="icon-btn" id="cl-copy" title="Copy code">Copy</button>
            </div>
            <div id="monaco-editor-mount" class="monaco-mount"></div>
            <textarea id="cl-fallback-editor" class="codelab-fallback-editor" style="display:none"
              spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"
            >${STARTER_TEMPLATES.html}</textarea>
          </div>

          <div class="codelab-preview-panel">
            <div class="codelab-panel-header">
              <span>Preview</span>
              <button class="icon-btn" id="cl-open-new" title="Open in new tab">↗</button>
              <label class="toggle-switch codelab-auto-run-toggle" title="Auto-run on change">
                <input type="checkbox" id="cl-autorun" checked>
                <span class="toggle-track"></span>
                <span class="toggle-label">Auto</span>
              </label>
            </div>
            <iframe id="code-preview" class="code-preview-frame" sandbox="allow-scripts allow-same-origin" title="Code Preview"></iframe>
          </div>
        </div>

        <!-- AI Review Panel (hidden by default) -->
        <div class="codelab-ai-panel hidden" id="cl-ai-panel">
          <div class="codelab-ai-header">
            <span>✨ AI Code Review</span>
            <button class="icon-btn" id="cl-ai-close">✕</button>
          </div>
          <div class="codelab-ai-content" id="cl-ai-content">
            <div class="ai-typing"><span></span><span></span><span></span></div>
          </div>
        </div>

        <!-- Console Output -->
        <div class="codelab-console" id="cl-console">
          <div class="codelab-console-header">
            <span>Console</span>
            <button class="icon-btn" id="cl-console-clear">Clear</button>
          </div>
          <div class="codelab-console-output" id="cl-console-output">
            <span class="console-welcome">// Ready. Run your code to see output here.</span>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  function init() {
    if (_initialized) { refresh(); return; }
    _initialized = true;

    _loadMonaco();
    _attachToolbarListeners();
    _runPreview(); // Initial preview
  }

  function refresh() {
    // Update AI review button visibility
    const aiBtn = document.getElementById('cl-ai-review');
    if (aiBtn && !ClaudeAI.isReady()) aiBtn.style.display = 'none';
    else if (!aiBtn && ClaudeAI.isReady()) {
      const actions = document.querySelector('.codelab-toolbar-actions');
      if (actions) {
        const btn = document.createElement('button');
        btn.className = 'icon-btn codelab-btn ai-review-btn';
        btn.id = 'cl-ai-review';
        btn.title = 'AI Review';
        btn.textContent = '✨ Review';
        btn.addEventListener('click', _handleAIReview);
        actions.insertBefore(btn, document.getElementById('cl-save'));
      }
    }
  }

  // ─── Monaco Loading ───────────────────────────────────────────────────────

  function _loadMonaco() {
    const mount = document.getElementById('monaco-editor-mount');
    const fallback = document.getElementById('cl-fallback-editor');
    if (!mount) return;

    if (window.require) {
      _initMonaco(mount, fallback);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
    script.onload = () => _initMonaco(mount, fallback);
    script.onerror = () => {
      mount.style.display = 'none';
      if (fallback) fallback.style.display = 'block';
      _setupFallbackEditor(fallback);
    };
    document.head.appendChild(script);
  }

  function _initMonaco(mount, fallback) {
    try {
      window.require.config({
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
      });

      window.require(['vs/editor/editor.main'], () => {
        try {
          const savedCode = SovereignStorage.get('codelab_code') || {};
          const initialCode = savedCode[_currentLang] || STARTER_TEMPLATES[_currentLang];

          // Define dark theme matching the app
          window.monaco.editor.defineTheme('sovereign-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '6A7E8E', fontStyle: 'italic' },
              { token: 'string', foreground: 'E5C08E' },
              { token: 'keyword', foreground: 'C9886C' },
              { token: 'number', foreground: 'B8D4E8' }
            ],
            colors: {
              'editor.background': '#0D1520',
              'editor.foreground': '#E8DDD4',
              'editor.lineHighlightBackground': '#1A2535',
              'editorLineNumber.foreground': '#4A5568',
              'editorCursor.foreground': '#C9886C',
              'editor.selectionBackground': '#C9886C30'
            }
          });

          _editor = window.monaco.editor.create(mount, {
            value: initialCode,
            language: _currentLang === 'javascript' ? 'javascript' : _currentLang,
            theme: 'sovereign-dark',
            fontSize: 14,
            lineHeight: 22,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            suggest: { showKeywords: true }
          });

          _monacoReady = true;
          if (fallback) fallback.style.display = 'none';
          mount.style.display = 'block';

          // Auto-run on change (debounced)
          const debouncedRun = SovereignUtils.debounce(() => {
            if (document.getElementById('cl-autorun')?.checked) {
              _saveCurrentCode();
              _runPreview();
            }
          }, 800);

          _editor.onDidChangeModelContent(debouncedRun);

          // Cmd/Ctrl+Enter to run
          _editor.addCommand(
            window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter,
            _runPreview
          );

        } catch (err) {
          console.warn('[CodeLab] Monaco init failed:', err);
          mount.style.display = 'none';
          if (fallback) { fallback.style.display = 'block'; _setupFallbackEditor(fallback); }
        }
      });
    } catch (err) {
      mount.style.display = 'none';
      if (fallback) { fallback.style.display = 'block'; _setupFallbackEditor(fallback); }
    }
  }

  function _setupFallbackEditor(textarea) {
    if (!textarea) return;
    const savedCode = SovereignStorage.get('codelab_code') || {};
    textarea.value = savedCode[_currentLang] || STARTER_TEMPLATES[_currentLang];

    const debouncedRun = SovereignUtils.debounce(() => {
      _saveCurrentCode();
      if (document.getElementById('cl-autorun')?.checked) _runPreview();
    }, 800);

    textarea.addEventListener('input', debouncedRun);

    // Tab key in textarea
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.slice(0, start) + '  ' + textarea.value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }
    });
  }

  // ─── Code Helpers ─────────────────────────────────────────────────────────

  function _getCode() {
    if (_monacoReady && _editor) return _editor.getValue();
    const fallback = document.getElementById('cl-fallback-editor');
    return fallback?.value || '';
  }

  function _setCode(code) {
    if (_monacoReady && _editor) {
      _editor.setValue(code);
    } else {
      const fallback = document.getElementById('cl-fallback-editor');
      if (fallback) fallback.value = code;
    }
  }

  function _saveCurrentCode() {
    const code = _getCode();
    SovereignStorage.update('codelab_code', (prev = {}) => ({ ...prev, [_currentLang]: code }));
  }

  function _switchLanguage(lang) {
    _saveCurrentCode();
    _currentLang = lang;

    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));

    const label = document.getElementById('cl-lang-label');
    if (label) label.textContent = lang.toUpperCase();

    const savedCode = SovereignStorage.get('codelab_code') || {};
    const code = savedCode[lang] || STARTER_TEMPLATES[lang] || '';

    if (_monacoReady && _editor && window.monaco) {
      const langMap = { html: 'html', css: 'css', javascript: 'javascript' };
      window.monaco.editor.setModelLanguage(_editor.getModel(), langMap[lang] || lang);
      _editor.setValue(code);
    } else {
      const fallback = document.getElementById('cl-fallback-editor');
      if (fallback) fallback.value = code;
    }

    _runPreview();
  }

  // ─── Preview ──────────────────────────────────────────────────────────────

  function _runPreview() {
    const iframe = document.getElementById('code-preview');
    if (!iframe) return;

    const code = _getCode();
    let htmlContent = '';

    switch (_currentLang) {
      case 'html':
        htmlContent = code;
        break;
      case 'css':
        htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${code}</style></head><body><div class="card"><h1>Preview</h1><p>Your styles are applied here.</p></div></body></html>`;
        break;
      case 'javascript':
        htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><script>
          // Override console to show in app
          const _log = console.log.bind(console);
          console.log = (...args) => { _log(...args); window.parent.postMessage({ type: 'console', level: 'log', data: args.map(String).join(' ') }, '*'); };
          console.error = (...args) => { window.parent.postMessage({ type: 'console', level: 'error', data: args.map(String).join(' ') }, '*'); };
          try { ${code} } catch(e) { window.parent.postMessage({ type: 'console', level: 'error', data: e.message }, '*'); }
        <\/script></body></html>`;
        break;
    }

    try {
      iframe.srcdoc = htmlContent;
    } catch {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      iframe.src = URL.createObjectURL(blob);
    }

    _logConsole('// Ran ' + new Date().toLocaleTimeString(), 'info');
  }

  // ─── Console ──────────────────────────────────────────────────────────────

  function _logConsole(message, level = 'log') {
    const output = document.getElementById('cl-console-output');
    if (!output) return;
    const colors = { log: '#E8DDD4', error: '#E85D5D', warn: '#C9886C', info: '#7B9BAE' };
    const line = document.createElement('div');
    line.className = 'console-line';
    line.style.color = colors[level] || colors.log;
    line.textContent = message;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  // ─── Timer ────────────────────────────────────────────────────────────────

  function _formatTimer(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `⏱ ${m}:${s}`;
  }

  function _toggleTimer() {
    const btn = document.getElementById('cl-timer-toggle');
    if (_timerRunning) {
      clearInterval(_timerInterval);
      _timerRunning = false;
      if (btn) btn.style.color = '';
    } else {
      _timerRunning = true;
      if (btn) btn.style.color = '#C9886C';
      _timerInterval = setInterval(() => {
        _timerSeconds++;
        if (btn) btn.textContent = _formatTimer(_timerSeconds);
      }, 1000);
    }
  }

  // ─── Toolbar Listeners ────────────────────────────────────────────────────

  function _attachToolbarListeners() {
    // Language switcher
    document.querySelector('.codelab-lang-switcher')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang]');
      if (btn) _switchLanguage(btn.dataset.lang);
    });

    // Run
    document.getElementById('cl-run')?.addEventListener('click', () => {
      _saveCurrentCode();
      _runPreview();
    });

    // Format
    document.getElementById('cl-format')?.addEventListener('click', async () => {
      if (_monacoReady && _editor) {
        await _editor.getAction('editor.action.formatDocument')?.run();
      }
      SovereignUtils.toast('Formatted', 'success');
    });

    // AI Review
    document.getElementById('cl-ai-review')?.addEventListener('click', _handleAIReview);

    // Save snippet
    document.getElementById('cl-save')?.addEventListener('click', () => {
      _saveCurrentCode();
      SovereignUtils.showModal(
        'Save Snippet to Vault',
        `
          <div class="form-group">
            <label class="form-label">Snippet Name</label>
            <input type="text" class="form-input" id="snippet-name" placeholder="My Code Snippet">
          </div>
        `,
        [
          { label: 'Cancel', action: () => SovereignUtils.closeModal() },
          {
            label: 'Save',
            primary: true,
            action: () => {
              const name = document.getElementById('snippet-name')?.value.trim();
              if (!name) { SovereignUtils.toast('Enter a name', 'error'); return; }

              const item = {
                id: SovereignUtils.generateId(),
                title: name,
                type: 'code',
                content: _getCode(),
                tags: [_currentLang, 'code-lab'],
                folder: 'code',
                createdAt: new Date().toISOString()
              };

              SovereignStorage.update('vault_items', (prev = []) => [item, ...(prev || [])]);
              if (!SovereignStorage.get('vault_items')) SovereignStorage.set('vault_items', [item]);

              SovereignUtils.closeModal();
              SovereignUtils.toast('Saved to Vault!', 'success');
            }
          }
        ]
      );
    });

    // Load snippet
    document.getElementById('cl-load')?.addEventListener('click', () => {
      const items = (SovereignStorage.get('vault_items') || []).filter(i => i.type === 'code');
      if (items.length === 0) {
        SovereignUtils.toast('No saved snippets yet. Write some code and save it first!', 'info');
        return;
      }

      SovereignUtils.showModal(
        'Load Snippet',
        `
          <div class="vault-snippet-list">
            ${items.map(item => `
              <button class="vault-snippet-btn" data-item-id="${item.id}">
                <strong>${SovereignUtils.sanitizeHtml(item.title)}</strong>
                <span>${SovereignUtils.truncate(item.content, 60)}</span>
              </button>
            `).join('')}
          </div>
        `,
        [{ label: 'Cancel', action: () => SovereignUtils.closeModal() }]
      );

      setTimeout(() => {
        document.querySelectorAll('.vault-snippet-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const item = items.find(i => i.id === btn.dataset.itemId);
            if (item) {
              _setCode(item.content);
              SovereignUtils.closeModal();
              SovereignUtils.toast(`Loaded: ${item.title}`, 'success');
            }
          });
        });
      }, 100);
    });

    // Template reset
    document.getElementById('cl-template')?.addEventListener('click', () => {
      if (confirm('Reset to template? Your changes will be lost.')) {
        _setCode(STARTER_TEMPLATES[_currentLang] || '');
        _runPreview();
      }
    });

    // Copy code
    document.getElementById('cl-copy')?.addEventListener('click', () => {
      SovereignUtils.copyToClipboard(_getCode());
      SovereignUtils.toast('Copied!', 'success');
    });

    // Open preview in new tab
    document.getElementById('cl-open-new')?.addEventListener('click', () => {
      const code = _getCode();
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });

    // Timer
    document.getElementById('cl-timer-toggle')?.addEventListener('click', _toggleTimer);
    document.getElementById('cl-timer-reset')?.addEventListener('click', () => {
      clearInterval(_timerInterval);
      _timerRunning = false;
      _timerSeconds = 0;
      const btn = document.getElementById('cl-timer-toggle');
      if (btn) { btn.textContent = _formatTimer(0); btn.style.color = ''; }
    });

    // Console clear
    document.getElementById('cl-console-clear')?.addEventListener('click', () => {
      const output = document.getElementById('cl-console-output');
      if (output) output.innerHTML = '<span class="console-welcome">// Console cleared</span>';
    });

    // AI panel close
    document.getElementById('cl-ai-close')?.addEventListener('click', () => {
      document.getElementById('cl-ai-panel')?.classList.add('hidden');
    });

    // Capture console messages from iframe
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'console') {
        _logConsole(`> ${e.data.data}`, e.data.level);
      }
    });
  }

  // ─── AI Code Review ───────────────────────────────────────────────────────

  async function _handleAIReview() {
    if (!ClaudeAI.isReady()) {
      SovereignUtils.toast('Add your Claude API key in Settings to use AI review', 'info');
      return;
    }

    const code = _getCode();
    if (!code.trim()) {
      SovereignUtils.toast('Write some code first', 'info');
      return;
    }

    const panel = document.getElementById('cl-ai-panel');
    const content = document.getElementById('cl-ai-content');
    if (!panel || !content) return;

    panel.classList.remove('hidden');
    content.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';

    const weekNum = window.SovereignCurriculum?.getCurrentWeek() || 1;

    try {
      const result = await ClaudeAI.gradeCode(code, `Code Lab exercise — Week ${weekNum}`, `Week ${weekNum} of the curriculum`);

      const score = result.score || 0;
      const feedback = result.feedback || result.toString();
      const suggestions = result.suggestions || [];

      content.innerHTML = `
        <div class="ai-review-result">
          <div class="ai-review-score">
            <div class="score-ring-wrap">${SovereignUtils.createProgressRing(score, 80, 8, '#C9886C')}</div>
            <div class="score-label">${score}/100</div>
          </div>
          <div class="ai-review-feedback">
            <p>${SovereignUtils.sanitizeHtml(feedback)}</p>
            ${suggestions.length > 0 ? `
              <h4>Suggestions:</h4>
              <ul>${suggestions.map(s => `<li>${SovereignUtils.sanitizeHtml(s)}</li>`).join('')}</ul>
            ` : ''}
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = `<p class="ai-error">Could not generate review. Please try again.</p>`;
    }
  }

  return { render, init, refresh };

})();
