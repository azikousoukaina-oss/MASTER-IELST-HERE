'use strict';

window.OnboardingSection = (() => {

  const APP_NAME_OPTIONS = [
    { id: 'sovereign', name: 'Sovereign', subtitle: 'Your life, your rules', emoji: '👑' },
    { id: 'luminary', name: 'Luminary', subtitle: 'Let your light guide you', emoji: '✨' },
    { id: 'meridian', name: 'Meridian', subtitle: 'The highest point of your journey', emoji: '🌅' },
    { id: 'soleil', name: 'Soleil', subtitle: 'Radiant and unstoppable', emoji: '☀️' },
    { id: 'zenith', name: 'Zenith', subtitle: 'At the peak of everything', emoji: '🏔️' },
    { id: 'aura', name: 'Aura', subtitle: 'Your energy, amplified', emoji: '🌸' }
  ];

  const GOAL_OPTIONS = [
    { id: 'coding', label: 'Become a Full-Stack Developer', icon: '💻', desc: 'Master web development in 130 weeks' },
    { id: 'ielts', label: 'Excel at IELTS Teaching', icon: '📚', desc: 'Organize classes, students & lessons' },
    { id: 'wellness', label: 'Glow Up My Wellness', icon: '🌿', desc: 'Skincare, nutrition, fitness & habits' },
    { id: 'productivity', label: 'Master My Time', icon: '⏰', desc: 'Tasks, schedules & goal tracking' },
    { id: 'journal', label: 'Reflect & Journal Daily', icon: '📓', desc: 'Voice notes, drawings & AI reflection' },
    { id: 'vault', label: 'Organize My Knowledge', icon: '🗂️', desc: 'Documents, notes & code snippets' }
  ];

  const SCHEDULE_OPTIONS = [
    {
      id: 'early',
      label: 'Early Bird',
      wake: '06:00',
      sleep: '22:00',
      desc: 'Wake 6am — Fresh mornings, focused days',
      emoji: '🌅'
    },
    {
      id: 'standard',
      label: 'Standard',
      wake: '07:30',
      sleep: '23:00',
      desc: 'Wake 7:30am — Balanced rhythm',
      emoji: '☀️'
    },
    {
      id: 'moderate',
      label: 'Moderate',
      wake: '08:00',
      sleep: '23:30',
      desc: 'Wake 8am — Soukaina\'s current schedule',
      emoji: '🌸'
    },
    {
      id: 'night',
      label: 'Night Owl',
      wake: '09:00',
      sleep: '01:00',
      desc: 'Wake 9am — Peak creativity at night',
      emoji: '🌙'
    }
  ];

  let _currentSlide = 0;
  let _selections = {
    appName: 'sovereign',
    goals: ['coding', 'wellness'],
    schedule: 'moderate',
    skincareType: 'combination',
    apiKey: ''
  };
  let _onComplete = null;

  // ─── Main Init ────────────────────────────────────────────────────────────

  function init(onComplete) {
    _onComplete = onComplete;
    _currentSlide = 0;

    const container = document.getElementById('onboarding');
    if (!container) return;

    container.innerHTML = _renderOnboarding();
    container.classList.remove('hidden');

    _attachListeners();
    _goToSlide(0);
  }

  // ─── Render Onboarding Shell ─────────────────────────────────────────────

  function _renderOnboarding() {
    return `
      <div class="onboarding-wrap">
        <div class="onboarding-progress-bar">
          <div class="onboarding-progress-fill" id="ob-progress"></div>
        </div>

        <div class="onboarding-track" id="ob-track">
          ${_renderSlide0()}
          ${_renderSlide1()}
          ${_renderSlide2()}
          ${_renderSlide3()}
          ${_renderSlide4()}
        </div>

        <div class="onboarding-actions">
          <button class="btn btn-ghost ob-back-btn hidden" id="ob-back">← Back</button>
          <button class="btn btn-primary ob-next-btn" id="ob-next">Continue →</button>
        </div>
      </div>
    `;
  }

  // ─── Slide 0: Welcome ─────────────────────────────────────────────────────

  function _renderSlide0() {
    return `
      <div class="ob-slide" data-slide="0">
        <div class="ob-slide-inner">
          <div class="ob-welcome-logo">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="url(#ob-grad)"/>
              <defs>
                <linearGradient id="ob-grad" x1="0" y1="0" x2="80" y2="80">
                  <stop stop-color="#C9886C"/>
                  <stop offset="1" stop-color="#B8768A"/>
                </linearGradient>
              </defs>
              <text x="40" y="50" text-anchor="middle" font-size="36" fill="white">👑</text>
            </svg>
          </div>
          <h1 class="ob-welcome-title">Welcome, Soukaina</h1>
          <p class="ob-welcome-subtitle">Your personal life operating system is about to come alive. Tailored just for you — IELTS teacher, coding student, wellness warrior, and unstoppable woman. 🌸</p>
          <div class="ob-welcome-facts">
            <div class="ob-fact">
              <span class="ob-fact-icon">📅</span>
              <span class="ob-fact-text">Starting your coding journey <strong>May 27, 2026</strong></span>
            </div>
            <div class="ob-fact">
              <span class="ob-fact-icon">🇻🇳</span>
              <span class="ob-fact-text">Designed for life in <strong>Vietnam</strong>, tropical climate & all</span>
            </div>
            <div class="ob-fact">
              <span class="ob-fact-icon">⏱️</span>
              <span class="ob-fact-text">Setup takes <strong>2 minutes</strong>. Let's make it perfect.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Slide 1: App Name ────────────────────────────────────────────────────

  function _renderSlide1() {
    const options = APP_NAME_OPTIONS.map(opt => `
      <button class="ob-name-card ${_selections.appName === opt.id ? 'selected' : ''}" data-name="${opt.id}">
        <span class="ob-name-emoji">${opt.emoji}</span>
        <span class="ob-name-title">${opt.name}</span>
        <span class="ob-name-sub">${opt.subtitle}</span>
      </button>
    `).join('');

    return `
      <div class="ob-slide" data-slide="1">
        <div class="ob-slide-inner">
          <h2 class="ob-slide-title">What shall we call your space?</h2>
          <p class="ob-slide-desc">This name will greet you every day. Choose the one that resonates with your soul.</p>
          <div class="ob-name-grid" id="ob-name-grid">
            ${options}
          </div>
        </div>
      </div>
    `;
  }

  // ─── Slide 2: Goals ───────────────────────────────────────────────────────

  function _renderSlide2() {
    const options = GOAL_OPTIONS.map(g => `
      <label class="ob-goal-item ${_selections.goals.includes(g.id) ? 'checked' : ''}" data-goal="${g.id}">
        <div class="ob-goal-check">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l4 4 6-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="ob-goal-icon">${g.icon}</span>
        <div class="ob-goal-text">
          <span class="ob-goal-label">${g.label}</span>
          <span class="ob-goal-desc">${g.desc}</span>
        </div>
      </label>
    `).join('');

    return `
      <div class="ob-slide" data-slide="2">
        <div class="ob-slide-inner">
          <h2 class="ob-slide-title">What are your goals?</h2>
          <p class="ob-slide-desc">Select all that matter to you. Your app will be organized around these.</p>
          <div class="ob-goal-list" id="ob-goal-list">
            ${options}
          </div>
        </div>
      </div>
    `;
  }

  // ─── Slide 3: Schedule ────────────────────────────────────────────────────

  function _renderSlide3() {
    const options = SCHEDULE_OPTIONS.map(s => `
      <button class="ob-schedule-card ${_selections.schedule === s.id ? 'selected' : ''}" data-schedule="${s.id}">
        <span class="ob-schedule-emoji">${s.emoji}</span>
        <div class="ob-schedule-info">
          <span class="ob-schedule-label">${s.label}</span>
          <span class="ob-schedule-desc">${s.desc}</span>
        </div>
        <div class="ob-schedule-time">
          <span>${s.wake}</span>
          <span class="ob-schedule-arrow">→</span>
          <span>${s.sleep}</span>
        </div>
      </button>
    `).join('');

    return `
      <div class="ob-slide" data-slide="3">
        <div class="ob-slide-inner">
          <h2 class="ob-slide-title">What's your daily rhythm?</h2>
          <p class="ob-slide-desc">This shapes your reminders, study blocks, and daily planning.</p>
          <div class="ob-schedule-list" id="ob-schedule-list">
            ${options}
          </div>
          <div class="ob-skincare-section">
            <h3 class="ob-section-label">Your skin type (for routine recommendations)</h3>
            <div class="ob-skintype-row">
              ${['oily', 'dry', 'combination', 'sensitive', 'normal'].map(type => `
                <button class="ob-skintype-btn ${_selections.skincareType === type ? 'selected' : ''}" data-skin="${type}">
                  ${type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Slide 4: AI Key ─────────────────────────────────────────────────────

  function _renderSlide4() {
    return `
      <div class="ob-slide" data-slide="4">
        <div class="ob-slide-inner">
          <h2 class="ob-slide-title">Unlock AI superpowers</h2>
          <p class="ob-slide-desc">Add your Claude API key to enable smart daily planning, lesson generation, code review, and personalized wellness tips.</p>

          <div class="ob-ai-features">
            <div class="ob-ai-feature">🗓️ <span>AI-generated daily plans</span></div>
            <div class="ob-ai-feature">📖 <span>Interactive coding lessons</span></div>
            <div class="ob-ai-feature">🍜 <span>Vietnamese meal suggestions</span></div>
            <div class="ob-ai-feature">💬 <span>Personal AI assistant</span></div>
          </div>

          <div class="ob-api-wrap">
            <label class="ob-api-label" for="ob-api-key">
              Claude API Key
              <span class="ob-api-optional">(optional — skip to add later in Settings)</span>
            </label>
            <div class="ob-api-input-wrap">
              <input
                type="password"
                id="ob-api-key"
                class="form-input"
                placeholder="sk-ant-api03-..."
                autocomplete="off"
                spellcheck="false"
              >
              <button class="ob-api-toggle" id="ob-api-toggle" type="button">👁️</button>
            </div>
            <p class="ob-api-note">🔒 Stored only in your device. Never sent to anyone but Anthropic.</p>
          </div>

          <div class="ob-api-help">
            <p>Don't have a key? <strong>Skip for now</strong> — you can add it later in Settings. All non-AI features work without it.</p>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  function _goToSlide(n) {
    _currentSlide = n;
    const track = document.getElementById('ob-track');
    if (!track) return;

    const slides = track.querySelectorAll('.ob-slide');
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === n);
      slide.classList.toggle('past', i < n);
    });

    const progress = document.getElementById('ob-progress');
    if (progress) {
      progress.style.width = `${((n) / (slides.length - 1)) * 100}%`;
    }

    const backBtn = document.getElementById('ob-back');
    const nextBtn = document.getElementById('ob-next');

    if (backBtn) backBtn.classList.toggle('hidden', n === 0);
    if (nextBtn) {
      nextBtn.textContent = n === slides.length - 1 ? 'Start My Journey ✨' : 'Continue →';
    }
  }

  function _next() {
    const totalSlides = 5;
    if (_currentSlide < totalSlides - 1) {
      _goToSlide(_currentSlide + 1);
    } else {
      _finish();
    }
  }

  function _back() {
    if (_currentSlide > 0) {
      _goToSlide(_currentSlide - 1);
    }
  }

  // ─── Finish ───────────────────────────────────────────────────────────────

  function _finish() {
    const apiKeyInput = document.getElementById('ob-api-key');
    const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';

    const selectedName = APP_NAME_OPTIONS.find(n => n.id === _selections.appName);
    const selectedSchedule = SCHEDULE_OPTIONS.find(s => s.id === _selections.schedule);

    const settings = {
      appName: selectedName ? selectedName.name : 'Sovereign',
      appNameId: _selections.appName,
      goals: _selections.goals,
      schedule: _selections.schedule,
      wakeTime: selectedSchedule ? selectedSchedule.wake : '08:00',
      sleepTime: selectedSchedule ? selectedSchedule.sleep : '23:00',
      skincareType: _selections.skincareType,
      remindersOn: true,
      soundEnabled: true,
      soundType: 'crystal-bell',
      volume: 0.6,
      theme: 'light',
      apiKey: apiKey
    };

    SovereignStorage.set('settings', settings);
    SovereignStorage.set('onboarding_complete', true);

    if (apiKey && window.ClaudeAI) {
      ClaudeAI.init(apiKey);
    }

    // Play a welcome sound
    if (window.SovereignReminders) {
      SovereignReminders.init();
      setTimeout(() => SovereignReminders.playSound('crystal-bell'), 300);
    }

    // Animate out
    const wrap = document.querySelector('.onboarding-wrap');
    if (wrap) {
      wrap.style.opacity = '0';
      wrap.style.transform = 'scale(0.95)';
      wrap.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    setTimeout(() => {
      const container = document.getElementById('onboarding');
      if (container) {
        container.classList.add('hidden');
        container.innerHTML = '';
      }
      _onComplete?.();
    }, 600);
  }

  // ─── Event Listeners ──────────────────────────────────────────────────────

  function _attachListeners() {
    const container = document.getElementById('onboarding');
    if (!container) return;

    container.addEventListener('click', (e) => {
      // Next / Back buttons
      if (e.target.id === 'ob-next' || e.target.closest('#ob-next')) {
        _next();
        return;
      }
      if (e.target.id === 'ob-back' || e.target.closest('#ob-back')) {
        _back();
        return;
      }

      // App name selection
      const nameCard = e.target.closest('[data-name]');
      if (nameCard) {
        const nameId = nameCard.dataset.name;
        _selections.appName = nameId;
        container.querySelectorAll('[data-name]').forEach(el => {
          el.classList.toggle('selected', el.dataset.name === nameId);
        });
        return;
      }

      // Goal toggle
      const goalItem = e.target.closest('[data-goal]');
      if (goalItem) {
        const goalId = goalItem.dataset.goal;
        const idx = _selections.goals.indexOf(goalId);
        if (idx >= 0) {
          _selections.goals.splice(idx, 1);
          goalItem.classList.remove('checked');
        } else {
          _selections.goals.push(goalId);
          goalItem.classList.add('checked');
        }
        return;
      }

      // Schedule selection
      const schedCard = e.target.closest('[data-schedule]');
      if (schedCard) {
        const schedId = schedCard.dataset.schedule;
        _selections.schedule = schedId;
        container.querySelectorAll('[data-schedule]').forEach(el => {
          el.classList.toggle('selected', el.dataset.schedule === schedId);
        });
        return;
      }

      // Skin type
      const skinBtn = e.target.closest('[data-skin]');
      if (skinBtn) {
        const skinType = skinBtn.dataset.skin;
        _selections.skincareType = skinType;
        container.querySelectorAll('[data-skin]').forEach(el => {
          el.classList.toggle('selected', el.dataset.skin === skinType);
        });
        return;
      }

      // API key toggle visibility
      if (e.target.id === 'ob-api-toggle') {
        const input = document.getElementById('ob-api-key');
        if (input) {
          input.type = input.type === 'password' ? 'text' : 'password';
        }
        return;
      }
    });

    // Allow pressing Enter to advance
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id !== 'ob-api-key') {
        _next();
      }
    });
  }

  return { init };

})();
