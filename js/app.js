'use strict';

const SECTION_META = {
  today:    { title: 'Today',              subtitle: '',                           module: () => window.TodaySection },
  academy:  { title: 'Developer Academy',  subtitle: 'Full-Stack Curriculum',      module: () => window.AcademySection },
  work:     { title: 'IELTS Studio',       subtitle: 'Lesson workspace',           module: () => window.WorkSection },
  wellness: { title: 'Wellness & Care',    subtitle: 'Mind, body & skin',          module: () => window.WellnessSection },
  tasks:    { title: 'My Tasks',           subtitle: '',                           module: () => window.TasksSection },
  vault:    { title: 'The Vault',          subtitle: 'Documents & notes',          module: () => window.VaultSection },
  codelab:  { title: 'Code Lab',           subtitle: 'Practice & build',           module: () => window.CodeLabSection },
  journal:  { title: 'Journal & Fun',      subtitle: 'Your creative space',        module: () => window.JournalSection },
  settings: { title: 'Settings',           subtitle: 'Preferences & API key',      module: () => window.SettingsSection }
};

const SECTION_ACCENT_COLORS = {
  today:    '#C9886C',
  academy:  '#6B5B95',
  work:     '#4A8B7B',
  wellness: '#7A9B6C',
  tasks:    '#D4954A',
  vault:    '#9B7E8C',
  codelab:  '#3A7BD5',
  journal:  '#9B8EC4',
  settings: '#9B7E8C'
};

window.SovereignApp = {
  currentSection: 'today',
  initialized: new Set(),
  _sectionsReady: false,

  async init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./sw.js');
      } catch (e) {
        console.warn('[App] SW registration failed:', e);
      }
    }

    // Load settings and init Claude
    const settings = SovereignStorage.get('settings') || {};
    if (settings.apiKey) {
      ClaudeAI.init(settings.apiKey);
    }

    // Apply theme
    const theme = settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // Apply saved app name
    const user = SovereignStorage.get('user') || {};
    if (user.appName) {
      document.title = `${user.appName} — Your Life OS`;
      const splashName = document.getElementById('splash-appname');
      if (splashName) splashName.textContent = user.appName;
    }

    // Init reminders
    SovereignReminders.init();

    // Splash screen
    await this._showSplash();

    // Onboarding or main app
    const onboardingDone = SovereignStorage.get('onboarding_complete');
    if (!onboardingDone) {
      this._showOnboarding();
    } else {
      this._showMainApp();
    }
  },

  _showSplash() {
    return new Promise(resolve => {
      const splash = document.getElementById('splash-screen');
      const loader = splash?.querySelector('.splash-loader-bar');

      // Animate loader bar
      if (loader) {
        setTimeout(() => { loader.style.width = '60%'; }, 200);
        setTimeout(() => { loader.style.width = '85%'; }, 800);
        setTimeout(() => { loader.style.width = '100%'; }, 1800);
      }

      setTimeout(() => {
        splash?.classList.add('splash-fade-out');
        setTimeout(() => {
          if (splash) splash.style.display = 'none';
          resolve();
        }, 600);
      }, 2400);
    });
  },

  _showOnboarding() {
    const onboarding = document.getElementById('onboarding');
    if (onboarding) onboarding.classList.remove('hidden');

    if (window.OnboardingSection) {
      OnboardingSection.init(() => {
        const onboardingEl = document.getElementById('onboarding');
        if (onboardingEl) {
          onboardingEl.classList.add('fade-out');
          setTimeout(() => onboardingEl.classList.add('hidden'), 500);
        }
        this._showMainApp();
      });
    }
  },

  _showMainApp() {
    const app = document.getElementById('app');
    if (app) {
      app.classList.remove('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => app.classList.add('app-visible'));
      });
    }

    this._renderAllSections();
    this._setupEventListeners();
    this.navigate('today');
    this._sectionsReady = true;

    // Schedule reminders for today
    SovereignReminders.scheduleAllForToday();

    // Update profile avatar
    const user = SovereignStorage.get('user') || {};
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
      avatarEl.textContent = SovereignUtils.getInitials(user.name || 'Soukaina');
    }

    // Update app name in header
    if (user.appName) {
      const nameEl = document.querySelector('.app-name-text');
      if (nameEl) nameEl.textContent = user.appName;
    }
  },

  _renderAllSections() {
    const sections = Object.keys(SECTION_META);
    sections.forEach(name => {
      const container = document.getElementById(`section-${name}`);
      const module = SECTION_META[name]?.module?.();
      if (container && module?.render) {
        try {
          module.render(container);
        } catch (e) {
          console.warn(`[App] Failed to render section "${name}":`, e);
          container.innerHTML = `
            <div class="section-loading-state">
              <div class="loading-shimmer"></div>
              <div class="loading-shimmer loading-shimmer-sm"></div>
              <div class="loading-shimmer loading-shimmer-lg"></div>
            </div>
          `;
        }
      }
    });
  },

  navigate(section) {
    if (!SECTION_META[section]) return;

    const prev = this.currentSection;
    this.currentSection = section;

    // Hide all sections
    document.querySelectorAll('.app-section').forEach(el => {
      el.classList.remove('active');
    });

    // Show target section
    const target = document.getElementById(`section-${section}`);
    if (target) {
      target.classList.add('active');
      // Smooth scroll to top
      target.scrollTop = 0;
    }

    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Update header
    const meta = SECTION_META[section];
    const titleEl = document.getElementById('header-section-title');
    const subtitleEl = document.querySelector('.header-subtitle');

    if (titleEl) {
      if (section === 'today') {
        const user = SovereignStorage.get('user') || {};
        titleEl.textContent = `${SovereignUtils.getGreeting()}, ${user.name || 'Soukaina'} ✦`;
      } else {
        titleEl.textContent = meta.title;
      }
    }
    if (subtitleEl) {
      subtitleEl.textContent = meta.subtitle || '';
    }

    // Update accent color
    const color = SECTION_ACCENT_COLORS[section] || '#C9886C';
    document.documentElement.style.setProperty('--section-accent', color);
    document.getElementById('theme-color-meta')?.setAttribute('content', color);

    // Init or refresh section module
    const module = meta.module?.();
    if (module) {
      if (!this.initialized.has(section)) {
        this.initialized.add(section);
        try { module.init?.(); } catch (e) {
          console.warn(`[App] Section "${section}" init error:`, e);
        }
      } else {
        try { module.refresh?.(); } catch (e) {
          console.warn(`[App] Section "${section}" refresh error:`, e);
        }
      }
    }

    this._closeSheets();
  },

  getCurrentSection() {
    return this.currentSection;
  },

  refresh() {
    const section = this.currentSection;
    const module = SECTION_META[section]?.module?.();
    try { module?.refresh?.(); } catch (e) {}
  },

  _setupEventListeners() {
    // Bottom nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.section === 'more') {
          this._toggleMoreSheet();
        } else {
          this.navigate(btn.dataset.section);
        }
      });
    });

    // More sheet items
    document.querySelectorAll('.more-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigate(btn.dataset.section);
        this._closeSheets();
      });
    });

    // Sheet backdrop
    document.getElementById('sheet-backdrop')?.addEventListener('click', () => {
      this._closeSheets();
    });

    // AI FAB
    document.getElementById('ai-fab')?.addEventListener('click', () => {
      const panel = document.getElementById('ai-panel');
      const panelInner = document.getElementById('ai-panel-inner');
      const fab = document.getElementById('ai-fab');

      if (!panel) return;

      const isOpen = !panel.classList.contains('open');
      panel.classList.toggle('open', isOpen);
      panel.classList.toggle('hidden', !isOpen);
      fab?.classList.toggle('fab-active', isOpen);

      if (isOpen && panelInner && window.AssistantSection) {
        if (!panelInner.hasChildNodes()) {
          AssistantSection.render(panelInner);
          AssistantSection.init?.();
        } else {
          AssistantSection.refresh?.();
        }
      }
    });

    // Profile → settings
    document.getElementById('profile-btn')?.addEventListener('click', () => {
      this.navigate('settings');
    });

    // Pull to refresh
    this._setupPullToRefresh();

    // SW messages
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'reminder-click') {
          const section = event.data?.data?.section || 'today';
          if (SECTION_META[section]) this.navigate(section);
        }
      });
    }

    // Handle hash navigation (shortcuts)
    if (window.location.hash) {
      const section = window.location.hash.slice(1);
      if (SECTION_META[section]) {
        setTimeout(() => this.navigate(section), 200);
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        SovereignUtils.closeModal();
        this._closeSheets();
        const panel = document.getElementById('ai-panel');
        panel?.classList.remove('open');
        panel?.classList.add('hidden');
        document.getElementById('ai-fab')?.classList.remove('fab-active');
      }
    });
  },

  _toggleMoreSheet() {
    const sheet = document.getElementById('more-sheet');
    const backdrop = document.getElementById('sheet-backdrop');
    const isOpen = sheet?.classList.toggle('open');
    backdrop?.classList.toggle('hidden', !isOpen);
    sheet?.setAttribute('aria-hidden', String(!isOpen));
  },

  _closeSheets() {
    document.getElementById('more-sheet')?.classList.remove('open');
    document.getElementById('sheet-backdrop')?.classList.add('hidden');
    document.getElementById('more-sheet')?.setAttribute('aria-hidden', 'true');
  },

  _setupPullToRefresh() {
    const main = document.getElementById('main-content');
    if (!main) return;

    let startY = 0;
    let pulling = false;
    let pullIndicator = null;
    const PULL_THRESHOLD = 70;

    main.addEventListener('touchstart', e => {
      if (main.scrollTop <= 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });

    main.addEventListener('touchmove', e => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0 && dy < 120) {
        if (!pullIndicator) {
          pullIndicator = document.createElement('div');
          pullIndicator.className = 'pull-refresh-indicator';
          pullIndicator.innerHTML = '<div class="pull-spinner">↻</div><span>Release to refresh</span>';
          document.getElementById(`section-${this.currentSection}`)?.prepend(pullIndicator);
        }
        const height = Math.min(dy * 0.55, 64);
        pullIndicator.style.height = height + 'px';
        pullIndicator.style.opacity = String(Math.min(dy / PULL_THRESHOLD, 1));
        pullIndicator.classList.toggle('pull-ready', dy >= PULL_THRESHOLD);
      }
    }, { passive: true });

    main.addEventListener('touchend', e => {
      if (!pulling) return;
      const dy = e.changedTouches[0].clientY - startY;
      if (dy >= PULL_THRESHOLD) {
        this.refresh();
        SovereignUtils.toast('Refreshed ✦', 'info', 1500);
      }
      if (pullIndicator) {
        pullIndicator.style.height = '0';
        pullIndicator.style.opacity = '0';
        setTimeout(() => { pullIndicator?.remove(); pullIndicator = null; }, 300);
      }
      pulling = false;
    }, { passive: true });
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
  SovereignApp.init().catch(e => {
    console.error('[App] Initialization failed:', e);
    // Show minimal error state
    document.getElementById('splash-screen').innerHTML = `
      <div style="text-align:center;color:#C9886C;padding:2rem;">
        <p style="font-size:1.2rem">Loading Sovereign...</p>
        <p style="font-size:0.9rem;opacity:0.7;margin-top:0.5rem">Please refresh if this persists</p>
      </div>
    `;
  });
});
