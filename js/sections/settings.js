'use strict';

window.SettingsSection = (() => {

  let _initialized = false;

  // ─── Render ───────────────────────────────────────────────────────────────

  function render(container) {
    container.innerHTML = `<div id="settings-content"></div>`;
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  function init() {
    if (_initialized) { refresh(); return; }
    _initialized = true;
    _renderSettings();
  }

  function refresh() {
    _renderSettings();
  }

  function _renderSettings() {
    const content = document.getElementById('settings-content');
    if (!content) return;

    const settings = SovereignStorage.get('settings') || {};
    const stats = window.SovereignCurriculum?.getOverallStats() || {};
    const appName = settings.appName || 'Sovereign';

    content.innerHTML = `
      <!-- Profile Banner -->
      <div class="settings-profile-banner">
        <div class="settings-profile-avatar">S</div>
        <div class="settings-profile-info">
          <h3 class="settings-profile-name">Soukaina</h3>
          <p class="settings-profile-role">IELTS Teacher & Coding Student</p>
          <p class="settings-profile-location">🇻🇳 Vietnam</p>
        </div>
      </div>

      <!-- Progress Stats -->
      <div class="settings-stats-row">
        <div class="settings-stat">
          <span class="settings-stat-num">${stats.completedWeeks || 0}</span>
          <span class="settings-stat-label">Weeks Done</span>
        </div>
        <div class="settings-stat">
          <span class="settings-stat-num">${stats.totalXP || 0}</span>
          <span class="settings-stat-label">Total XP</span>
        </div>
        <div class="settings-stat">
          <span class="settings-stat-num">${stats.percentComplete || 0}%</span>
          <span class="settings-stat-label">Academy</span>
        </div>
        <div class="settings-stat">
          <span class="settings-stat-num">${_getTasksCompleted()}</span>
          <span class="settings-stat-label">Tasks Done</span>
        </div>
      </div>

      <!-- AI API Key -->
      <div class="settings-section">
        <h4 class="settings-section-title">🤖 AI Assistant</h4>
        <div class="settings-list">
          <div class="settings-item settings-api-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Claude API Key</span>
              <span class="settings-item-desc">Powers AI planning, lessons, and chat</span>
            </div>
            <div class="settings-api-status ${ClaudeAI.isReady() ? 'connected' : 'disconnected'}">
              ${ClaudeAI.isReady() ? '✓ Connected' : '✗ Not set'}
            </div>
          </div>
          <div class="settings-api-input-wrap">
            <div class="api-key-wrap">
              <input
                type="password"
                class="form-input"
                id="settings-api-key"
                value="${settings.apiKey ? '•'.repeat(20) : ''}"
                placeholder="sk-ant-api03-..."
                autocomplete="off"
                spellcheck="false"
              >
              <button class="api-key-toggle-btn" id="settings-api-toggle">👁️</button>
            </div>
            <button class="btn btn-primary btn-sm" id="settings-save-key">Save Key</button>
          </div>
          <p class="settings-api-note">🔒 Stored on your device only. Never shared or transmitted anywhere except directly to Anthropic's API.</p>
        </div>
      </div>

      <!-- Appearance -->
      <div class="settings-section">
        <h4 class="settings-section-title">🎨 Appearance</h4>
        <div class="settings-list">
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">App Name</span>
              <span class="settings-item-desc">Currently: ${SovereignUtils.sanitizeHtml(appName)}</span>
            </div>
            <button class="btn btn-ghost btn-sm" id="settings-change-name">Change</button>
          </div>
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Dark Mode</span>
              <span class="settings-item-desc">Switch to dark theme</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="settings-dark-mode" ${settings.theme === 'dark' ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Reminders -->
      <div class="settings-section">
        <h4 class="settings-section-title">🔔 Reminders</h4>
        <div class="settings-list">
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Enable Reminders</span>
              <span class="settings-item-desc">Daily reminders for wellness & study</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="settings-reminders" ${settings.remindersOn !== false ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </label>
          </div>
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Sound Effects</span>
              <span class="settings-item-desc">Play sounds for reminders</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="settings-sound" ${settings.soundEnabled !== false ? 'checked' : ''}>
              <span class="toggle-track"></span>
            </label>
          </div>
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Sound Type</span>
              <span class="settings-item-desc">Choose your reminder tone</span>
            </div>
            <select class="form-input settings-sound-select" id="settings-sound-type">
              <option value="crystal-bell" ${(settings.soundType || 'crystal-bell') === 'crystal-bell' ? 'selected' : ''}>Crystal Bell</option>
              <option value="soft-gong" ${settings.soundType === 'soft-gong' ? 'selected' : ''}>Soft Gong</option>
              <option value="gentle-harp" ${settings.soundType === 'gentle-harp' ? 'selected' : ''}>Gentle Harp</option>
              <option value="zen-chime" ${settings.soundType === 'zen-chime' ? 'selected' : ''}>Zen Chime</option>
            </select>
          </div>
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Volume</span>
              <span class="settings-item-desc">${Math.round((settings.volume || 0.6) * 100)}%</span>
            </div>
            <input type="range" class="range-input" id="settings-volume"
              min="0" max="1" step="0.1"
              value="${settings.volume || 0.6}">
          </div>
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Test Sound</span>
              <span class="settings-item-desc">Preview the selected sound</span>
            </div>
            <button class="btn btn-ghost btn-sm" id="settings-test-sound">▶ Play</button>
          </div>
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Notification Permission</span>
              <span class="settings-item-desc" id="settings-notif-status">
                ${_getNotifStatus()}
              </span>
            </div>
            <button class="btn btn-ghost btn-sm" id="settings-request-notif">Request</button>
          </div>
        </div>
      </div>

      <!-- Schedule -->
      <div class="settings-section">
        <h4 class="settings-section-title">⏰ Schedule</h4>
        <div class="settings-list">
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Wake Time</span>
            </div>
            <input type="time" class="form-input settings-time-input" id="settings-wake" value="${settings.wakeTime || '08:00'}">
          </div>
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Sleep Time</span>
            </div>
            <input type="time" class="form-input settings-time-input" id="settings-sleep" value="${settings.sleepTime || '23:00'}">
          </div>
          <div class="settings-item">
            <button class="btn btn-primary btn-sm" id="settings-save-schedule">Save Schedule</button>
          </div>
        </div>
      </div>

      <!-- Data & Privacy -->
      <div class="settings-section">
        <h4 class="settings-section-title">🗂️ Data & Privacy</h4>
        <div class="settings-list">
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Export Data</span>
              <span class="settings-item-desc">Download all your data as JSON</span>
            </div>
            <button class="btn btn-ghost btn-sm" id="settings-export">Export</button>
          </div>
          <div class="settings-item">
            <div class="settings-item-text">
              <span class="settings-item-label">Import Data</span>
              <span class="settings-item-desc">Restore from a backup</span>
            </div>
            <label class="btn btn-ghost btn-sm" for="settings-import-file">Import</label>
            <input type="file" id="settings-import-file" accept=".json" style="display:none">
          </div>
          <div class="settings-item danger-zone">
            <div class="settings-item-text">
              <span class="settings-item-label">Clear All Data</span>
              <span class="settings-item-desc">⚠️ This cannot be undone</span>
            </div>
            <button class="btn btn-danger btn-sm" id="settings-clear-data">Clear</button>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <h4 class="settings-section-title">ℹ️ About</h4>
        <div class="settings-list">
          <div class="settings-item">
            <span class="settings-item-label">Version</span>
            <span class="settings-item-value">1.0.0</span>
          </div>
          <div class="settings-item">
            <span class="settings-item-label">Built for</span>
            <span class="settings-item-value">Soukaina 🌸</span>
          </div>
          <div class="settings-item">
            <span class="settings-item-label">Model</span>
            <span class="settings-item-value">Claude claude-sonnet-4-5</span>
          </div>
        </div>
      </div>
    `;

    _attachListeners();
  }

  // ─── Listeners ────────────────────────────────────────────────────────────

  function _attachListeners() {
    // API Key save
    document.getElementById('settings-save-key')?.addEventListener('click', () => {
      const input = document.getElementById('settings-api-key');
      if (!input) return;
      let key = input.value.trim();

      // If it's the masked value, don't overwrite
      if (key.match(/^•+$/)) {
        SovereignUtils.toast('API key unchanged', 'info');
        return;
      }

      if (key && !key.startsWith('sk-ant-')) {
        SovereignUtils.toast('Key should start with sk-ant-...', 'error');
        return;
      }

      SovereignStorage.update('settings', s => ({ ...s, apiKey: key }));
      if (key) {
        ClaudeAI.init(key);
        SovereignUtils.toast('API key saved & connected ✓', 'success');
      } else {
        SovereignUtils.toast('API key cleared', 'info');
      }
      _renderSettings();
    });

    // API key visibility toggle
    document.getElementById('settings-api-toggle')?.addEventListener('click', () => {
      const input = document.getElementById('settings-api-key');
      if (!input) return;
      const realKey = SovereignStorage.get('settings')?.apiKey || '';
      if (input.type === 'password') {
        input.type = 'text';
        input.value = realKey;
      } else {
        input.type = 'password';
        input.value = realKey ? '•'.repeat(20) : '';
      }
    });

    // Dark mode toggle
    document.getElementById('settings-dark-mode')?.addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      SovereignStorage.update('settings', s => ({ ...s, theme }));
      document.documentElement.setAttribute('data-theme', theme);
      SovereignUtils.toast(`Switched to ${theme} mode`, 'success');
    });

    // Reminders toggle
    document.getElementById('settings-reminders')?.addEventListener('change', (e) => {
      SovereignStorage.update('settings', s => ({ ...s, remindersOn: e.target.checked }));
      if (e.target.checked) {
        SovereignReminders.scheduleAllForToday();
        SovereignUtils.toast('Reminders enabled', 'success');
      } else {
        SovereignReminders.cancelAll();
        SovereignUtils.toast('Reminders disabled', 'info');
      }
    });

    // Sound toggle
    document.getElementById('settings-sound')?.addEventListener('change', (e) => {
      SovereignStorage.update('settings', s => ({ ...s, soundEnabled: e.target.checked }));
    });

    // Sound type
    document.getElementById('settings-sound-type')?.addEventListener('change', (e) => {
      SovereignStorage.update('settings', s => ({ ...s, soundType: e.target.value }));
    });

    // Volume
    const volumeSlider = document.getElementById('settings-volume');
    volumeSlider?.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      SovereignStorage.update('settings', s => ({ ...s, volume: vol }));
      // Update displayed percent
      const desc = volumeSlider.closest('.settings-item')?.querySelector('.settings-item-desc');
      if (desc) desc.textContent = `${Math.round(vol * 100)}%`;
    });

    // Test sound
    document.getElementById('settings-test-sound')?.addEventListener('click', () => {
      const type = document.getElementById('settings-sound-type')?.value || 'crystal-bell';
      SovereignReminders.playSound(type);
    });

    // Request notification
    document.getElementById('settings-request-notif')?.addEventListener('click', async () => {
      const perm = await SovereignReminders.requestPermission();
      const statusEl = document.getElementById('settings-notif-status');
      if (statusEl) statusEl.textContent = _getNotifStatus();
      SovereignUtils.toast(`Notifications: ${perm}`, perm === 'granted' ? 'success' : 'info');
    });

    // Change app name
    document.getElementById('settings-change-name')?.addEventListener('click', () => {
      SovereignUtils.showModal(
        'Change App Name',
        `
          <div class="form-group">
            <label class="form-label">App Name</label>
            <input type="text" class="form-input" id="new-app-name" value="${SovereignUtils.sanitizeHtml(SovereignStorage.get('settings')?.appName || 'Sovereign')}" maxlength="20">
          </div>
        `,
        [
          { label: 'Cancel', action: () => SovereignUtils.closeModal() },
          {
            label: 'Save',
            primary: true,
            action: () => {
              const name = document.getElementById('new-app-name')?.value.trim();
              if (!name) return;
              SovereignStorage.update('settings', s => ({ ...s, appName: name }));
              SovereignUtils.closeModal();
              SovereignUtils.toast('App name updated', 'success');
              _renderSettings();
            }
          }
        ]
      );
    });

    // Save schedule
    document.getElementById('settings-save-schedule')?.addEventListener('click', () => {
      const wake = document.getElementById('settings-wake')?.value;
      const sleep = document.getElementById('settings-sleep')?.value;
      SovereignStorage.update('settings', s => ({ ...s, wakeTime: wake, sleepTime: sleep }));
      SovereignReminders.scheduleAllForToday();
      SovereignUtils.toast('Schedule saved & reminders updated', 'success');
    });

    // Export
    document.getElementById('settings-export')?.addEventListener('click', () => {
      const data = SovereignStorage.getAll();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sovereign-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      SovereignUtils.toast('Data exported', 'success');
    });

    // Import
    document.getElementById('settings-import-file')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          Object.entries(data).forEach(([key, val]) => {
            const stripped = key.replace('sovereign_', '');
            SovereignStorage.set(stripped, val);
          });
          SovereignUtils.toast('Data imported — refresh to see changes', 'success');
        } catch {
          SovereignUtils.toast('Invalid backup file', 'error');
        }
      };
      reader.readAsText(file);
    });

    // Clear all data
    document.getElementById('settings-clear-data')?.addEventListener('click', () => {
      SovereignUtils.showModal(
        'Clear All Data?',
        `<p style="color: var(--color-error); text-align:center; padding: 16px 0;">
          This will delete <strong>all your tasks, journal entries, academy progress, wellness data, and settings</strong>.
          <br><br>This cannot be undone.
        </p>`,
        [
          { label: 'Cancel', action: () => SovereignUtils.closeModal() },
          {
            label: 'Yes, Delete Everything',
            danger: true,
            action: () => {
              SovereignStorage.clearAll();
              SovereignUtils.closeModal();
              SovereignUtils.toast('All data cleared. Refreshing...', 'info');
              setTimeout(() => location.reload(), 1500);
            }
          }
        ]
      );
    });
  }

  function _getNotifStatus() {
    if (!('Notification' in window)) return '❌ Not supported';
    const p = Notification.permission;
    if (p === 'granted') return '✅ Allowed';
    if (p === 'denied') return '❌ Blocked in browser';
    return '⏳ Not requested';
  }

  function _getTasksCompleted() {
    const tasks = SovereignStorage.get('tasks') || [];
    return tasks.filter(t => t.completed).length;
  }

  return { render, init, refresh };

})();
