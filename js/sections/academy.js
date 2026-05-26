'use strict';

window.AcademySection = (() => {

  // ─── Curriculum Data ───────────────────────────────────────────────────────

  const PHASES = [
    {
      id: 1, title: 'HTML & CSS Mastery', color: '#E8734A',
      weeks: [1, 12],
      description: 'Master the building blocks of the web. Learn semantic HTML5, modern CSS3, Flexbox, Grid, and responsive design.',
      skills: ['HTML5', 'CSS3', 'Flexbox', 'Grid', 'Responsive Design', 'Accessibility']
    },
    {
      id: 2, title: 'JavaScript Fundamentals', color: '#F0C040',
      weeks: [13, 28],
      description: 'Learn the language of the web from scratch — variables, functions, DOM manipulation, events, and async programming.',
      skills: ['Variables', 'Functions', 'Arrays', 'Objects', 'DOM', 'Events', 'Fetch API', 'Async/Await']
    },
    {
      id: 3, title: 'Advanced JS & Tooling', color: '#4A8B7B',
      weeks: [29, 44],
      description: 'Level up with Git version control, npm, ES6+ features, and modern JavaScript patterns.',
      skills: ['ES6+', 'Git', 'npm', 'Modules', 'Closures', 'Promises', 'Webpack']
    },
    {
      id: 4, title: 'React.js', color: '#61DAFB',
      weeks: [45, 60],
      description: 'Build dynamic user interfaces with the world\'s most popular front-end library.',
      skills: ['Components', 'Hooks', 'State', 'Props', 'Router', 'Context', 'Redux']
    },
    {
      id: 5, title: 'Node.js & Express', color: '#8CC84B',
      weeks: [61, 76],
      description: 'Move to the server side — build REST APIs, handle authentication, and manage server-side logic.',
      skills: ['Node.js', 'Express', 'REST APIs', 'JWT', 'Middleware', 'File Uploads']
    },
    {
      id: 6, title: 'Databases', color: '#336791',
      weeks: [77, 92],
      description: 'Store and query data with SQL (PostgreSQL) and NoSQL (MongoDB). Design schemas and optimize queries.',
      skills: ['SQL', 'PostgreSQL', 'MongoDB', 'Mongoose', 'Prisma', 'Database Design']
    },
    {
      id: 7, title: 'Full-Stack Projects', color: '#9B8EC4',
      weeks: [93, 108],
      description: 'Build 4 complete full-stack applications that showcase your skills to employers.',
      skills: ['Full-Stack', 'Deployment', 'Authentication', 'Real Projects', 'Portfolio']
    },
    {
      id: 8, title: 'Job Prep & Beyond', color: '#C9886C',
      weeks: [109, 130],
      description: 'TypeScript, Next.js, system design, coding interviews, and launching your developer career.',
      skills: ['TypeScript', 'Next.js', 'Interviews', 'System Design', 'Resume', 'Portfolio']
    }
  ];

  const WEEK_TOPICS = {
    1:  { title: 'HTML Foundations', objectives: 'Learn what HTML is, how documents are structured, and write your first webpage.' },
    2:  { title: 'HTML Elements & Semantics', objectives: 'Master semantic tags, forms, tables, and accessible markup.' },
    3:  { title: 'CSS Basics', objectives: 'Selectors, properties, box model, colors, and typography.' },
    4:  { title: 'CSS Layout', objectives: 'Flexbox, Grid, positioning, and responsive units.' },
    5:  { title: 'Responsive Design', objectives: 'Media queries, mobile-first design, and viewport.' },
    6:  { title: 'CSS Animations', objectives: 'Transitions, keyframes, and interactive effects.' },
    7:  { title: 'CSS Variables & Themes', objectives: 'Custom properties, theming, and design systems.' },
    8:  { title: 'HTML Forms & Validation', objectives: 'Complex forms, input types, and native validation.' },
    9:  { title: 'Accessibility & SEO', objectives: 'ARIA, semantic HTML, meta tags, and screen readers.' },
    10: { title: 'CSS Frameworks', objectives: 'Tailwind CSS basics and utility-first workflow.' },
    11: { title: 'Project: Portfolio Page', objectives: 'Build a complete personal portfolio page with HTML & CSS.' },
    12: { title: 'HTML & CSS Review', objectives: 'Consolidate knowledge, fill gaps, and take Phase 1 assessment.' },
    13: { title: 'JS Intro & Variables', objectives: 'What is JavaScript? Variables, data types, and basic operators.' },
    14: { title: 'Functions & Scope', objectives: 'Declaring functions, parameters, return values, and scope.' },
    15: { title: 'Arrays', objectives: 'Create, access, and manipulate arrays with built-in methods.' },
    16: { title: 'Objects', objectives: 'Object literals, properties, methods, and destructuring.' },
    17: { title: 'Control Flow', objectives: 'If/else, switch, ternary, and logical operators.' },
    18: { title: 'Loops', objectives: 'for, while, forEach, and iteration patterns.' },
    19: { title: 'DOM Manipulation', objectives: 'Query, create, modify, and delete DOM elements.' },
    20: { title: 'Events', objectives: 'Event listeners, bubbling, delegation, and the event object.' },
    21: { title: 'Fetch API & JSON', objectives: 'HTTP requests, fetch, JSON parsing, and API integration.' },
    22: { title: 'Promises & Async/Await', objectives: 'Asynchronous JavaScript, Promises, and async/await syntax.' },
    23: { title: 'Error Handling', objectives: 'try/catch, error types, and defensive programming.' },
    24: { title: 'Local Storage & Browser APIs', objectives: 'Web Storage, URL, History, and browser APIs.' },
    25: { title: 'Regular Expressions', objectives: 'Pattern matching, validation, and text manipulation.' },
    26: { title: 'Dates & Math', objectives: 'Date object, Math methods, and number formatting.' },
    27: { title: 'Project: Interactive App', objectives: 'Build a JavaScript-powered interactive web app.' },
    28: { title: 'JS Fundamentals Review', objectives: 'Consolidate JS knowledge and prepare for advanced topics.' }
  };

  function _getWeekTopic(weekNum) {
    if (WEEK_TOPICS[weekNum]) return WEEK_TOPICS[weekNum];
    const phase = PHASES.find(p => weekNum >= p.weeks[0] && weekNum <= p.weeks[1]);
    return {
      title: `Week ${weekNum}${phase ? ' — ' + phase.title : ''}`,
      objectives: `Continue your ${phase ? phase.title : 'development'} journey with Week ${weekNum} content.`
    };
  }

  function _getPhaseForWeek(weekNum) {
    return PHASES.find(p => weekNum >= p.weeks[0] && weekNum <= p.weeks[1]) || PHASES[0];
  }

  const DAY_TOPICS = [
    'Introduction & Theory',
    'Core Concepts Deep Dive',
    'Hands-On Practice',
    'Advanced Application',
    'Real-World Project Work',
    'Review & Consolidation',
    'Weekly Test'
  ];

  // ─── State ─────────────────────────────────────────────────────────────────

  let _container = null;
  let _view = 'dashboard'; // dashboard | phase | week | lesson | test | results
  let _selectedPhase = null;
  let _selectedWeek = null;
  let _selectedDay = null;
  let _currentLesson = null;
  let _testData = null;
  let _testAnswers = {};
  let _testTimer = null;
  let _testSecondsLeft = 30 * 60;
  let _testResults = null;
  let _gradeInProgress = new Set(); // exercise ids being graded

  // ─── Storage Helpers ───────────────────────────────────────────────────────

  function _getProgress() {
    return SovereignStorage.get('curriculum_progress') || {
      currentWeek: 1,
      currentDay: 1,
      completedDays: [],
      scores: {},
      xp: 0,
      streak: 0,
      lastStudyDate: null
    };
  }

  function _saveProgress(updates) {
    SovereignStorage.update('curriculum_progress', prev => ({ ...(_getProgress()), ...updates }));
  }

  function _isDayCompleted(week, day) {
    const p = _getProgress();
    return (p.completedDays || []).includes(`w${week}d${day}`);
  }

  function _isDayAvailable(week, day) {
    const p = _getProgress();
    if (week < p.currentWeek) return true;
    if (week > p.currentWeek) return false;
    if (day === 1) return true;
    // Day 7 only if all 1-6 done
    if (day === 7) {
      for (let d = 1; d <= 6; d++) {
        if (!_isDayCompleted(week, d)) return false;
      }
      return true;
    }
    return _isDayCompleted(week, day - 1);
  }

  function _isTestPassed(week) {
    const p = _getProgress();
    const score = (p.scores || {})[`w${week}-test`];
    return score !== undefined && score >= 60;
  }

  function _getWeekProgress(week) {
    let done = 0;
    for (let d = 1; d <= 6; d++) {
      if (_isDayCompleted(week, d)) done++;
    }
    if (_isTestPassed(week)) done++;
    return { done, total: 7 };
  }

  function _getPhaseProgress(phase) {
    let totalDone = 0, totalPossible = 0;
    for (let w = phase.weeks[0]; w <= phase.weeks[1]; w++) {
      const wp = _getWeekProgress(w);
      totalDone += wp.done;
      totalPossible += wp.total;
    }
    return totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  }

  // ─── XP & Streak ───────────────────────────────────────────────────────────

  function _awardXP(amount, reason) {
    _saveProgress({
      xp: (_getProgress().xp || 0) + amount,
      lastStudyDate: new Date().toISOString().slice(0, 10)
    });
    SovereignUtils.toast(`+${amount} XP — ${reason} ✦`, 'success');
  }

  function _updateStreak() {
    const p = _getProgress();
    const today = new Date().toISOString().slice(0, 10);
    const last = p.lastStudyDate;
    if (!last) {
      _saveProgress({ streak: 1, lastStudyDate: today });
      return;
    }
    const daysSince = Math.floor((new Date(today) - new Date(last)) / 86400000);
    if (daysSince === 0) return; // already counted today
    if (daysSince === 1) {
      const newStreak = (p.streak || 0) + 1;
      _saveProgress({ streak: newStreak, lastStudyDate: today });
      if (newStreak % 7 === 0) {
        _awardXP(100, `${newStreak}-day streak bonus`);
      }
    } else {
      _saveProgress({ streak: 1, lastStudyDate: today }); // reset
    }
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  function _navigateTo(view, data = {}) {
    _view = view;
    if (data.phase !== undefined) _selectedPhase = data.phase;
    if (data.week !== undefined) _selectedWeek = data.week;
    if (data.day !== undefined) _selectedDay = data.day;
    if (data.lesson !== undefined) _currentLesson = data.lesson;
    if (data.testData !== undefined) _testData = data.testData;
    if (data.testResults !== undefined) _testResults = data.testResults;
    if (_container) _renderCurrentView();
  }

  function _renderCurrentView() {
    if (!_container) return;
    const views = {
      dashboard: _renderDashboard,
      phase: _renderPhaseView,
      week: _renderWeekView,
      lesson: _renderLessonView,
      test: _renderTestView,
      results: _renderResultsView
    };
    const fn = views[_view] || _renderDashboard;
    _container.innerHTML = _getBaseStyles() + fn();
    _attachViewEvents();
  }

  // ─── Base Styles ───────────────────────────────────────────────────────────

  function _getBaseStyles() {
    return `<style>
/* ─── Academy Styles ──────────────────────────────── */
.academy-container { padding-bottom: 120px; }

.academy-hero {
  background: linear-gradient(145deg, #1A0D1A 0%, #2D1040 50%, #1A0D1A 100%);
  border-radius: 0 0 28px 28px;
  padding: 24px 20px 28px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.academy-hero::before {
  content: '';
  position: absolute;
  bottom: -50px; right: -30px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(107,91,149,0.25) 0%, transparent 70%);
  border-radius: 50%;
}
.academy-hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 700;
  color: #F5D0C8;
  margin-bottom: 4px;
}
.academy-hero-subtitle {
  font-size: 13px; color: rgba(245,208,200,0.6);
  letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px;
}
.academy-stats-row {
  display: flex; gap: 10px; flex-wrap: wrap;
}
.acad-stat-pill {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(107,91,149,0.3);
  border-radius: 20px;
  padding: 8px 14px;
  display: flex; align-items: center; gap: 6px;
  flex-shrink: 0;
}
.asp-icon { font-size: 14px; }
.asp-value { font-size: 16px; font-weight: 700; color: #F5D0C8; }
.asp-label { font-size: 10px; color: rgba(245,208,200,0.5); text-transform: uppercase; letter-spacing: 0.5px; }

.acad-overall-progress { margin-top: 16px; }
.aop-label { font-size: 12px; color: rgba(245,208,200,0.65); margin-bottom: 6px; display: flex; justify-content: space-between; }
.aop-bar { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.1); overflow: hidden; }
.aop-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #6B5B95, #9B8EC4); transition: width 0.8s ease; }

.acad-section { padding: 0 16px; margin-bottom: 24px; }
.acad-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 600;
  color: var(--text-primary, #3D1F2D);
  margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}
.acad-section-title::after {
  content: '';
  flex: 1; height: 1px;
  background: linear-gradient(90deg, rgba(107,91,149,0.3), transparent);
}

/* Continue card */
.continue-card {
  background: linear-gradient(135deg, rgba(107,91,149,0.12), rgba(155,142,196,0.06));
  border: 1px solid rgba(107,91,149,0.25);
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.continue-card:active { transform: scale(0.98); }
.continue-card::before {
  content: '▶';
  position: absolute; right: 20px; top: 50%;
  transform: translateY(-50%);
  color: #6B5B95; font-size: 20px; opacity: 0.5;
}
.cc-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6B5B95; font-weight: 600; margin-bottom: 6px; }
.cc-title { font-size: 18px; font-weight: 700; color: var(--text-primary, #3D1F2D); margin-bottom: 4px; }
.cc-meta { font-size: 13px; color: var(--text-muted, #9B7E8C); }
.cc-day-label { margin-top: 10px; display: inline-block; background: rgba(107,91,149,0.15); color: #6B5B95; padding: 4px 12px; border-radius: 10px; font-size: 12px; font-weight: 600; }

/* Phase cards */
.phase-list { display: flex; flex-direction: column; gap: 12px; }
.phase-card {
  border-radius: 16px;
  padding: 16px 18px;
  cursor: pointer;
  transition: transform 0.15s;
  border: 1px solid rgba(107,91,149,0.15);
  background: var(--glass-bg, rgba(250,246,241,0.7));
  position: relative;
}
.phase-card:active { transform: scale(0.98); }
.phase-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.phase-num-badge {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: white; flex-shrink: 0;
}
.phase-title { font-size: 15px; font-weight: 700; color: var(--text-primary, #3D1F2D); }
.phase-weeks-range { font-size: 12px; color: var(--text-muted, #9B7E8C); }
.phase-skills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.phase-skill-tag { font-size: 10px; background: rgba(107,91,149,0.1); color: #6B5B95; padding: 2px 8px; border-radius: 8px; font-weight: 500; }
.phase-progress-bar { height: 4px; border-radius: 2px; background: rgba(107,91,149,0.1); margin-top: 10px; overflow: hidden; }
.phase-progress-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.phase-pct-label { font-size: 11px; text-align: right; margin-top: 4px; color: var(--text-muted, #9B7E8C); }

/* Achievement chips */
.achievement-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
.achievement-row::-webkit-scrollbar { display: none; }
.achievement-chip {
  background: var(--glass-bg, rgba(250,246,241,0.7));
  border: 1px solid rgba(201,136,108,0.2);
  border-radius: 14px; padding: 12px 14px;
  display: flex; flex-direction: column; align-items: center;
  min-width: 80px; gap: 4px; flex-shrink: 0;
  transition: transform 0.15s;
}
.achievement-chip.earned { background: rgba(201,136,108,0.1); border-color: rgba(201,136,108,0.4); }
.ach-icon { font-size: 24px; }
.ach-name { font-size: 10px; font-weight: 600; text-align: center; color: var(--text-primary, #3D1F2D); }
.ach-locked { opacity: 0.35; filter: grayscale(1); }

/* Recent activity */
.activity-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(107,91,149,0.08); }
.activity-icon { font-size: 20px; flex-shrink: 0; }
.activity-text { flex: 1; }
.activity-title { font-size: 14px; font-weight: 500; color: var(--text-primary, #3D1F2D); }
.activity-sub { font-size: 12px; color: var(--text-muted, #9B7E8C); }
.activity-xp { font-size: 13px; font-weight: 700; color: #7A9B6C; }

/* Phase view */
.phase-view-header {
  padding: 20px 20px 0;
  margin-bottom: 16px;
}
.phase-view-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700;
  color: var(--text-primary, #3D1F2D);
  margin-bottom: 6px;
}
.phase-view-desc { font-size: 14px; color: var(--text-secondary, #6B5565); line-height: 1.6; margin-bottom: 12px; }
.phase-view-skills { display: flex; gap: 6px; flex-wrap: wrap; }
.pvs-tag { font-size: 11px; padding: 3px 10px; border-radius: 10px; font-weight: 500; color: white; }

.weeks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 16px; }
.week-card {
  border-radius: 16px; padding: 14px;
  cursor: pointer;
  border: 1px solid rgba(107,91,149,0.15);
  background: var(--glass-bg, rgba(250,246,241,0.7));
  transition: transform 0.15s;
}
.week-card:active { transform: scale(0.97); }
.week-card.week-locked { opacity: 0.5; cursor: not-allowed; }
.wc-num { font-size: 11px; color: var(--text-muted, #9B7E8C); margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.wc-title { font-size: 13px; font-weight: 700; color: var(--text-primary, #3D1F2D); line-height: 1.3; margin-bottom: 8px; }
.wc-dots { display: flex; gap: 4px; flex-wrap: wrap; }
.wc-dot { width: 10px; height: 10px; border-radius: 50%; }
.wc-dot.done { background: #7A9B6C; }
.wc-dot.available { background: #6B5B95; }
.wc-dot.locked { background: rgba(107,91,149,0.2); }
.wc-dot.test { border-radius: 2px; }

/* Week view */
.week-view-header { padding: 20px 20px 16px; }
.week-view-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--text-primary, #3D1F2D); }
.week-objectives { font-size: 14px; color: var(--text-secondary, #6B5565); line-height: 1.6; background: rgba(107,91,149,0.06); border-radius: 12px; padding: 12px 14px; margin: 10px 0 0; }
.days-list { display: flex; flex-direction: column; gap: 10px; padding: 0 16px; }
.day-card {
  border-radius: 16px; padding: 16px 18px;
  cursor: pointer;
  border: 1px solid rgba(107,91,149,0.15);
  background: var(--glass-bg, rgba(250,246,241,0.7));
  display: flex; align-items: center; gap: 14px;
  transition: transform 0.15s;
}
.day-card:active { transform: scale(0.98); }
.day-card.locked { opacity: 0.45; cursor: not-allowed; }
.day-card.completed { border-color: rgba(122,155,108,0.4); background: rgba(122,155,108,0.06); }
.day-card.test-card { border-color: rgba(201,136,108,0.35); background: rgba(201,136,108,0.07); }
.day-num-badge {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: white; flex-shrink: 0;
}
.day-card-text { flex: 1; }
.day-card-title { font-size: 15px; font-weight: 600; color: var(--text-primary, #3D1F2D); }
.day-card-sub { font-size: 12px; color: var(--text-muted, #9B7E8C); margin-top: 2px; }
.day-card-status { font-size: 12px; font-weight: 600; flex-shrink: 0; }
.day-card-score { font-size: 18px; font-weight: 800; color: #7A9B6C; flex-shrink: 0; }

/* Lesson view */
.lesson-container { padding: 0 16px 120px; }
.lesson-header { margin-bottom: 20px; padding-top: 10px; }
.lesson-day-badge { font-size: 11px; color: #6B5B95; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.lesson-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--text-primary, #3D1F2D); margin-bottom: 10px; }
.lesson-objectives { display: flex; flex-wrap: wrap; gap: 6px; }
.lesson-obj-chip { font-size: 11px; background: rgba(107,91,149,0.1); color: #6B5B95; padding: 4px 10px; border-radius: 10px; font-weight: 500; }

.lesson-section-head {
  font-family: 'Playfair Display', serif;
  font-size: 17px; font-weight: 600;
  color: var(--text-primary, #3D1F2D);
  margin: 22px 0 12px;
  display: flex; align-items: center; gap: 8px;
}
.lesson-theory {
  font-size: 14px; line-height: 1.75;
  color: var(--text-secondary, #6B5565);
}
.lesson-theory p { margin-bottom: 12px; }
.lesson-theory strong { color: var(--text-primary, #3D1F2D); }
.lesson-theory code {
  background: rgba(107,91,149,0.1); color: #6B5B95;
  padding: 1px 5px; border-radius: 4px; font-size: 12.5px;
  font-family: 'Courier New', monospace;
}
.lesson-theory ul { margin: 8px 0 12px 20px; }
.lesson-theory li { margin-bottom: 6px; }

.code-block-wrap {
  background: #1a1a2e;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
}
.code-block-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px;
  background: rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.code-lang-badge { font-size: 11px; color: #9B8EC4; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
.code-copy-btn { font-size: 11px; color: rgba(255,255,255,0.5); cursor: pointer; background: none; border: none; padding: 4px 8px; border-radius: 6px; }
.code-copy-btn:hover { background: rgba(255,255,255,0.1); color: white; }
pre.lesson-code {
  margin: 0; padding: 16px;
  font-size: 13px; line-height: 1.6;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  color: #abb2bf;
  white-space: pre;
}

.ai-lesson-btn {
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, rgba(107,91,149,0.15), rgba(155,142,196,0.1));
  border: 1px solid rgba(107,91,149,0.3);
  border-radius: 14px; color: #6B5B95;
  font-size: 14px; font-weight: 600;
  cursor: pointer; margin-bottom: 16px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: transform 0.15s;
}
.ai-lesson-btn:active { transform: scale(0.98); }
.ai-lesson-btn:disabled { opacity: 0.5; pointer-events: none; }
.ai-lesson-content {
  background: rgba(107,91,149,0.05);
  border-left: 3px solid #6B5B95;
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 14px; line-height: 1.7;
  color: var(--text-secondary, #6B5565);
  margin-bottom: 16px;
  white-space: pre-wrap;
}

/* Exercises */
.exercise-card {
  border-radius: 16px; padding: 18px;
  border: 1px solid rgba(107,91,149,0.2);
  background: var(--glass-bg, rgba(250,246,241,0.7));
  margin-bottom: 14px;
}
.exercise-num { font-size: 11px; color: #6B5B95; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.exercise-title { font-size: 16px; font-weight: 700; color: var(--text-primary, #3D1F2D); margin-bottom: 8px; }
.exercise-instructions { font-size: 14px; color: var(--text-secondary, #6B5565); line-height: 1.6; margin-bottom: 12px; }
.exercise-hint { font-size: 13px; color: var(--text-muted, #9B7E8C); font-style: italic; margin-bottom: 12px; padding: 8px 12px; background: rgba(201,136,108,0.06); border-radius: 8px; }
.exercise-code-area {
  width: 100%; min-height: 120px;
  font-family: 'Courier New', monospace;
  font-size: 13px; line-height: 1.6;
  background: #1a1a2e; color: #abb2bf;
  border: 1px solid rgba(107,91,149,0.2);
  border-radius: 10px;
  padding: 12px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}
.exercise-code-area:focus { border-color: #6B5B95; }
.exercise-submit-btn {
  margin-top: 10px; width: 100%; padding: 13px;
  background: linear-gradient(135deg, #6B5B95, #9B8EC4);
  border: none; border-radius: 12px;
  color: white; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: transform 0.15s;
}
.exercise-submit-btn:active { transform: scale(0.98); }
.exercise-submit-btn:disabled { opacity: 0.5; pointer-events: none; }

.exercise-result {
  margin-top: 12px; border-radius: 12px;
  border: 1px solid rgba(122,155,108,0.3);
  background: rgba(122,155,108,0.06);
  overflow: hidden;
}
.er-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  background: rgba(122,155,108,0.1);
}
.er-score { font-size: 28px; font-weight: 800; color: #7A9B6C; }
.er-grade { font-size: 13px; font-weight: 600; color: #7A9B6C; }
.er-body { padding: 14px 16px; }
.er-summary { font-size: 14px; font-weight: 500; color: var(--text-primary, #3D1F2D); margin-bottom: 10px; }
.er-list { font-size: 13px; color: var(--text-secondary, #6B5565); line-height: 1.7; }
.er-list li { margin-bottom: 4px; }
.er-encourage { font-size: 13px; font-style: italic; color: #7A9B6C; margin-top: 10px; padding: 8px 12px; border-radius: 8px; background: rgba(122,155,108,0.08); }

.mark-complete-btn {
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, #7A9B6C, #5C8A58);
  border: none; border-radius: 16px;
  color: white; font-size: 16px; font-weight: 700;
  cursor: pointer; margin-top: 20px;
  letter-spacing: 0.5px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(122,155,108,0.3);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.mark-complete-btn:active { transform: scale(0.97); }
.mark-complete-btn:disabled { opacity: 0.6; pointer-events: none; }

/* Confetti */
@keyframes confetti-fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
.confetti-particle {
  position: fixed; top: 0; width: 8px; height: 8px;
  border-radius: 2px; pointer-events: none; z-index: 9999;
  animation: confetti-fall linear forwards;
}

/* Test view */
.test-container { padding: 0 16px 120px; }
.test-header { padding-top: 10px; margin-bottom: 20px; }
.test-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--text-primary, #3D1F2D); }
.test-sub { font-size: 14px; color: var(--text-muted, #9B7E8C); margin-top: 4px; }

.timer-ring-wrap { display: flex; justify-content: center; margin: 16px 0; }
.timer-ring-svg text { font-family: 'Inter', sans-serif; }

.mc-question { margin-bottom: 24px; }
.mc-q-num { font-size: 11px; font-weight: 700; color: #C9886C; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.mc-q-text { font-size: 15px; font-weight: 600; color: var(--text-primary, #3D1F2D); margin-bottom: 12px; line-height: 1.5; }
.mc-options { display: flex; flex-direction: column; gap: 8px; }
.mc-option {
  padding: 12px 16px; border-radius: 12px;
  border: 1.5px solid rgba(107,91,149,0.2);
  background: var(--glass-bg, rgba(250,246,241,0.7));
  cursor: pointer; font-size: 14px;
  color: var(--text-primary, #3D1F2D);
  display: flex; align-items: center; gap: 10px;
  transition: border-color 0.15s, background 0.15s;
  text-align: left;
}
.mc-option.selected { border-color: #6B5B95; background: rgba(107,91,149,0.1); color: #6B5B95; font-weight: 600; }
.mc-option:active { transform: scale(0.99); }
.mc-option-letter { width: 24px; height: 24px; border-radius: 50%; background: rgba(107,91,149,0.1); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #6B5B95; flex-shrink: 0; }
.mc-option.selected .mc-option-letter { background: #6B5B95; color: white; }

.practical-section { margin: 24px 0; }
.practical-label { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; color: var(--text-primary, #3D1F2D); margin-bottom: 8px; }
.practical-desc { font-size: 14px; color: var(--text-secondary, #6B5565); line-height: 1.6; margin-bottom: 12px; }

.test-submit-btn {
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, #C9886C, #D4954A);
  border: none; border-radius: 16px;
  color: white; font-size: 16px; font-weight: 700;
  cursor: pointer; margin-top: 8px;
  box-shadow: 0 4px 16px rgba(201,136,108,0.35);
  transition: transform 0.2s;
}
.test-submit-btn:active { transform: scale(0.97); }
.test-submit-btn:disabled { opacity: 0.5; pointer-events: none; }

/* Results view */
.results-container { padding: 0 16px 120px; }
.results-score-hero {
  text-align: center; padding: 32px 20px;
  background: linear-gradient(145deg, #1A0D1A, #2D1040);
  border-radius: 20px; margin-bottom: 20px;
  position: relative; overflow: hidden;
}
.results-score-hero::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 50% 30%, rgba(107,91,149,0.3) 0%, transparent 60%);
}
.results-score-num { font-size: 72px; font-weight: 900; color: #F5D0C8; line-height: 1; position: relative; z-index: 1; }
.results-score-label { font-size: 14px; color: rgba(245,208,200,0.6); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; position: relative; z-index: 1; }
.results-grade { display: inline-block; font-size: 28px; font-weight: 800; padding: 6px 20px; border-radius: 14px; margin: 12px 0; position: relative; z-index: 1; }
.results-pass-badge { display: inline-block; padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; position: relative; z-index: 1; }
.results-pass-badge.passed { background: rgba(122,155,108,0.3); color: #A8D4A0; border: 1px solid rgba(122,155,108,0.5); }
.results-pass-badge.failed { background: rgba(201,100,100,0.3); color: #F0A0A0; border: 1px solid rgba(201,100,100,0.4); }
.results-xp { font-size: 22px; font-weight: 700; color: #C9886C; position: relative; z-index: 1; margin-top: 8px; }

.feedback-section { margin-bottom: 20px; }
.feedback-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; color: var(--text-primary, #3D1F2D); margin-bottom: 12px; }
.mc-result-item {
  padding: 12px 14px; border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid transparent;
}
.mc-result-item.correct { background: rgba(122,155,108,0.08); border-color: rgba(122,155,108,0.25); }
.mc-result-item.incorrect { background: rgba(201,100,100,0.06); border-color: rgba(201,100,100,0.2); }
.mc-result-q { font-size: 13px; font-weight: 600; color: var(--text-primary, #3D1F2D); margin-bottom: 4px; }
.mc-result-indicator { font-size: 12px; margin-bottom: 4px; font-weight: 600; }
.mc-result-indicator.correct { color: #7A9B6C; }
.mc-result-indicator.incorrect { color: #C87070; }
.mc-result-explanation { font-size: 12px; color: var(--text-muted, #9B7E8C); line-height: 1.5; }

.practical-feedback {
  font-size: 14px; color: var(--text-secondary, #6B5565);
  line-height: 1.7; background: rgba(107,91,149,0.06);
  border-left: 3px solid #6B5B95;
  padding: 12px 14px; border-radius: 8px;
}

.share-btn {
  width: 100%; padding: 14px;
  background: rgba(201,136,108,0.12);
  border: 1px solid rgba(201,136,108,0.3);
  border-radius: 14px;
  color: #C9886C; font-size: 14px; font-weight: 600;
  cursor: pointer; margin-top: 12px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}

/* Back button */
.acad-back-btn {
  display: flex; align-items: center; gap: 8px;
  color: #6B5B95; font-size: 14px; font-weight: 600;
  background: none; border: none; cursor: pointer;
  padding: 12px 16px;
  margin-bottom: 4px;
}
.acad-back-btn:active { opacity: 0.7; }
</style>`;
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  function _renderDashboard() {
    const p = _getProgress();
    const week = p.currentWeek || 1;
    const day = p.currentDay || 1;
    const xp = p.xp || 0;
    const streak = p.streak || 0;
    const weekTopic = _getWeekTopic(week);
    const phase = _getPhaseForWeek(week);
    const overallPct = Math.round((((week - 1) * 7 + (day - 1)) / 910) * 100);

    const startDate = new Date('2026-05-27');
    const weeksLeft = 130 - week;
    const estCompletion = new Date(startDate.getTime() + 130 * 7 * 24 * 3600 * 1000);
    const estStr = estCompletion.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const achievements = _getAchievements(p);
    const recentActivity = _getRecentActivity(p);

    return `<div class="academy-container">
  <div class="academy-hero">
    <div class="academy-hero-title">Developer Academy ✦</div>
    <div class="academy-hero-subtitle">Full-Stack Curriculum — 130 Weeks</div>
    <div class="academy-stats-row">
      <div class="acad-stat-pill">
        <span class="asp-icon">📍</span>
        <div>
          <div class="asp-value">Phase ${phase.id}</div>
          <div class="asp-label">Current Phase</div>
        </div>
      </div>
      <div class="acad-stat-pill">
        <span class="asp-icon">📅</span>
        <div>
          <div class="asp-value" id="xp-counter">Week ${week}</div>
          <div class="asp-label">of 130 weeks</div>
        </div>
      </div>
      <div class="acad-stat-pill">
        <span class="asp-icon">⚡</span>
        <div>
          <div class="asp-value" id="xp-display">${xp.toLocaleString()}</div>
          <div class="asp-label">XP Earned</div>
        </div>
      </div>
      <div class="acad-stat-pill">
        <span class="asp-icon">🔥</span>
        <div>
          <div class="asp-value">${streak}</div>
          <div class="asp-label">Day Streak</div>
        </div>
      </div>
    </div>
    <div class="acad-overall-progress">
      <div class="aop-label">
        <span>Overall Progress</span>
        <span>${overallPct}% · Est. ${estStr}</span>
      </div>
      <div class="aop-bar">
        <div class="aop-bar-fill" style="width:${overallPct}%"></div>
      </div>
    </div>
  </div>

  <div class="acad-section">
    <div class="acad-section-title">Continue Learning</div>
    <div class="continue-card" id="continue-card">
      <div class="cc-label">Week ${week} · ${phase.title}</div>
      <div class="cc-title">${SovereignUtils.sanitizeHtml(weekTopic.title)}</div>
      <div class="cc-meta">${SovereignUtils.sanitizeHtml(weekTopic.objectives.slice(0, 80))}${weekTopic.objectives.length > 80 ? '…' : ''}</div>
      <div class="cc-day-label">Day ${day} — ${SovereignUtils.sanitizeHtml(DAY_TOPICS[day - 1] || 'Lesson')}</div>
    </div>
  </div>

  <div class="acad-section">
    <div class="acad-section-title">Achievements</div>
    <div class="achievement-row">
      ${achievements.map(a => `
        <div class="achievement-chip ${a.earned ? 'earned' : 'ach-locked'}">
          <span class="ach-icon">${a.icon}</span>
          <span class="ach-name">${a.name}</span>
        </div>`).join('')}
    </div>
  </div>

  <div class="acad-section">
    <div class="acad-section-title">Curriculum Phases</div>
    <div class="phase-list">
      ${PHASES.map(ph => {
        const pct = _getPhaseProgress(ph);
        const isActive = ph.id === phase.id;
        const isLocked = ph.weeks[0] > week;
        return `
        <div class="phase-card" data-phase="${ph.id}" style="${isLocked ? 'opacity:0.5' : ''}">
          <div class="phase-card-header">
            <div class="phase-num-badge" style="background:${ph.color}">P${ph.id}</div>
            <div>
              <div class="phase-title">${SovereignUtils.sanitizeHtml(ph.title)}</div>
              <div class="phase-weeks-range">Weeks ${ph.weeks[0]}–${ph.weeks[1]}${isActive ? ' · In Progress' : isLocked ? ' · Locked' : ' · Completed'}</div>
            </div>
            ${isActive ? `<span style="margin-left:auto;font-size:10px;background:rgba(107,91,149,0.15);color:#6B5B95;padding:4px 10px;border-radius:10px;font-weight:600">ACTIVE</span>` : ''}
          </div>
          <div class="phase-skills">
            ${ph.skills.slice(0, 4).map(s => `<span class="phase-skill-tag">${SovereignUtils.sanitizeHtml(s)}</span>`).join('')}
          </div>
          <div class="phase-progress-bar">
            <div class="phase-progress-fill" style="width:${pct}%;background:${ph.color}"></div>
          </div>
          <div class="phase-pct-label">${pct}% complete</div>
        </div>`;
      }).join('')}
    </div>
  </div>

  ${recentActivity.length ? `
  <div class="acad-section">
    <div class="acad-section-title">Recent Activity</div>
    <div class="activity-list">
      ${recentActivity.map(a => `
        <div class="activity-item">
          <span class="activity-icon">${a.icon}</span>
          <div class="activity-text">
            <div class="activity-title">${SovereignUtils.sanitizeHtml(a.title)}</div>
            <div class="activity-sub">${SovereignUtils.sanitizeHtml(a.sub)}</div>
          </div>
          <span class="activity-xp">+${a.xp} XP</span>
        </div>`).join('')}
    </div>
  </div>` : ''}
</div>`;
  }

  function _getAchievements(p) {
    const xp = p.xp || 0;
    const streak = p.streak || 0;
    const days = (p.completedDays || []).length;
    const tests = Object.values(p.scores || {}).filter(s => s >= 60).length;
    return [
      { icon: '🌱', name: 'First Step', earned: days >= 1 },
      { icon: '🔥', name: '7-Day Streak', earned: streak >= 7 },
      { icon: '⚡', name: '500 XP', earned: xp >= 500 },
      { icon: '🎯', name: '10 Days Done', earned: days >= 10 },
      { icon: '🏆', name: 'First Test Pass', earned: tests >= 1 },
      { icon: '💎', name: '1000 XP', earned: xp >= 1000 },
      { icon: '🌟', name: '30 Days Done', earned: days >= 30 },
      { icon: '👑', name: '30-Day Streak', earned: streak >= 30 }
    ];
  }

  function _getRecentActivity(p) {
    const completed = (p.completedDays || []).slice(-5).reverse();
    return completed.map(key => {
      const m = key.match(/w(\d+)d(\d+)/);
      if (!m) return null;
      const [, w, d] = m;
      const isTest = d === '7';
      return {
        icon: isTest ? '🏆' : '📚',
        title: isTest ? `Week ${w} Test Passed` : `Week ${w}, Day ${d} Completed`,
        sub: _getWeekTopic(+w).title,
        xp: isTest ? 150 : 50
      };
    }).filter(Boolean);
  }

  // ─── Phase View ────────────────────────────────────────────────────────────

  function _renderPhaseView() {
    const phase = PHASES.find(p => p.id === _selectedPhase);
    if (!phase) return _renderDashboard();
    const progress = _getProgress();
    const currentWeek = progress.currentWeek || 1;
    const phasePct = _getPhaseProgress(phase);

    return `<div class="academy-container">
  <button class="acad-back-btn" id="back-to-dashboard">← Back to Dashboard</button>
  <div class="phase-view-header" style="border-left:4px solid ${phase.color};padding-left:16px;margin-left:16px">
    <div style="font-size:12px;color:${phase.color};font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Phase ${phase.id} · Weeks ${phase.weeks[0]}–${phase.weeks[1]}</div>
    <div class="phase-view-title">${SovereignUtils.sanitizeHtml(phase.title)}</div>
    <div class="phase-view-desc">${SovereignUtils.sanitizeHtml(phase.description)}</div>
    <div class="phase-view-skills">
      ${phase.skills.map(s => `<span class="pvs-tag" style="background:${phase.color}">${SovereignUtils.sanitizeHtml(s)}</span>`).join('')}
    </div>
    <div style="margin-top:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted,#9B7E8C);margin-bottom:6px">
        <span>Phase Progress</span><span>${phasePct}%</span>
      </div>
      <div style="height:6px;background:rgba(107,91,149,0.1);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${phasePct}%;background:${phase.color};border-radius:3px;transition:width 0.8s"></div>
      </div>
    </div>
  </div>

  <div style="padding:0 16px">
    <div class="acad-section-title">Weeks</div>
  </div>
  <div class="weeks-grid">
    ${(() => {
      const rows = [];
      for (let w = phase.weeks[0]; w <= phase.weeks[1]; w++) {
        const topic = _getWeekTopic(w);
        const wp = _getWeekProgress(w);
        const locked = w > currentWeek;
        const dots = [1,2,3,4,5,6].map(d => {
          const done = _isDayCompleted(w, d);
          const avail = _isDayAvailable(w, d);
          return `<div class="wc-dot ${done ? 'done' : avail ? 'available' : 'locked'}"></div>`;
        });
        const testDone = _isTestPassed(w);
        const testAvail = _isDayAvailable(w, 7);
        dots.push(`<div class="wc-dot test ${testDone ? 'done' : testAvail ? 'available' : 'locked'}" title="Test"></div>`);
        rows.push(`
          <div class="week-card${locked ? ' week-locked' : ''}" data-week="${w}">
            <div class="wc-num">Week ${w}</div>
            <div class="wc-title">${SovereignUtils.sanitizeHtml(topic.title)}</div>
            <div class="wc-dots">${dots.join('')}</div>
          </div>`);
      }
      return rows.join('');
    })()}
  </div>
</div>`;
  }

  // ─── Week View ─────────────────────────────────────────────────────────────

  function _renderWeekView() {
    const week = _selectedWeek;
    const topic = _getWeekTopic(week);
    const phase = _getPhaseForWeek(week);

    const days = [1, 2, 3, 4, 5, 6].map(d => {
      const done = _isDayCompleted(week, d);
      const avail = _isDayAvailable(week, d);
      const score = (_getProgress().scores || {})[`w${week}d${d}`];
      return `
        <div class="day-card${done ? ' completed' : ''}${!avail ? ' locked' : ''}" data-day="${d}" ${!avail ? 'aria-disabled="true"' : ''}>
          <div class="day-num-badge" style="background:${avail ? phase.color : '#ccc'}">D${d}</div>
          <div class="day-card-text">
            <div class="day-card-title">Day ${d} — ${SovereignUtils.sanitizeHtml(DAY_TOPICS[d - 1])}</div>
            <div class="day-card-sub">${SovereignUtils.sanitizeHtml(topic.title)}</div>
          </div>
          ${done ? `<span class="day-card-status" style="color:#7A9B6C">✓ Done</span>` :
            avail ? `<span class="day-card-status" style="color:${phase.color}">→ Start</span>` :
            `<span class="day-card-status" style="color:#ccc">🔒</span>`}
        </div>`;
    });

    // Test card (Day 7)
    const testDone = _isTestPassed(week);
    const testAvail = _isDayAvailable(week, 7);
    const testScore = (_getProgress().scores || {})[`w${week}-test`];
    days.push(`
      <div class="day-card test-card${testDone ? ' completed' : ''}${!testAvail ? ' locked' : ''}" id="day-7-test" ${!testAvail ? 'aria-disabled="true"' : ''}>
        <div class="day-num-badge" style="background:${testAvail ? '#C9886C' : '#ccc'}">T</div>
        <div class="day-card-text">
          <div class="day-card-title">Weekly Test</div>
          <div class="day-card-sub">30-min test · All 6 topics · +150 XP</div>
        </div>
        ${testDone ? `<span class="day-card-score">${testScore}%</span>` :
          testAvail ? `<span class="day-card-status" style="color:#C9886C">Start</span>` :
          `<span class="day-card-status" style="color:#ccc">🔒</span>`}
      </div>`);

    return `<div class="academy-container">
  <button class="acad-back-btn" id="back-to-phase">← Phase ${phase.id}: ${SovereignUtils.sanitizeHtml(phase.title)}</button>
  <div class="week-view-header acad-section">
    <div style="font-size:11px;color:${phase.color};font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Week ${week} of 130</div>
    <div class="week-view-title">${SovereignUtils.sanitizeHtml(topic.title)}</div>
    <div class="week-objectives">${SovereignUtils.sanitizeHtml(topic.objectives)}</div>
  </div>
  <div class="days-list">${days.join('')}</div>
</div>`;
  }

  // ─── Lesson View ───────────────────────────────────────────────────────────

  function _renderLessonView() {
    const week = _selectedWeek;
    const day = _selectedDay;
    const lesson = _currentLesson;
    const topic = _getWeekTopic(week);
    const phase = _getPhaseForWeek(week);
    const isDone = _isDayCompleted(week, day);

    let theoryHtml = '';
    let codeHtml = '';
    let exercisesHtml = '';

    if (lesson) {
      theoryHtml = lesson.theory || `<p>Loading lesson content for Week ${week}, Day ${day}...</p>`;
      if (lesson.codeExample) {
        const lang = lesson.language || 'html';
        const escaped = SovereignUtils.sanitizeHtml(lesson.codeExample);
        codeHtml = `
          <div class="code-block-wrap">
            <div class="code-block-header">
              <span class="code-lang-badge">${lang}</span>
              <button class="code-copy-btn" id="copy-code-btn">Copy</button>
            </div>
            <pre class="lesson-code"><code>${escaped}</code></pre>
          </div>`;
      }
      if (lesson.exercises && lesson.exercises.length > 0) {
        exercisesHtml = lesson.exercises.map((ex, i) => `
          <div class="exercise-card" id="exercise-${ex.id || i}">
            <div class="exercise-num">Exercise ${i + 1}</div>
            <div class="exercise-title">${SovereignUtils.sanitizeHtml(ex.title)}</div>
            <div class="exercise-instructions">${SovereignUtils.sanitizeHtml(ex.instructions)}</div>
            ${ex.hint ? `<div class="exercise-hint">💡 Hint: ${SovereignUtils.sanitizeHtml(ex.hint)}</div>` : ''}
            <textarea class="exercise-code-area" id="ex-code-${ex.id || i}" placeholder="Write your code here...">${SovereignUtils.sanitizeHtml(ex.starterCode || '')}</textarea>
            <button class="exercise-submit-btn" data-ex-id="${ex.id || i}" data-ex-idx="${i}">
              ✦ Submit Exercise
            </button>
            <div id="ex-result-${ex.id || i}" class="exercise-result" style="display:none"></div>
          </div>`).join('');
      }
    } else {
      // Placeholder while lesson loads
      theoryHtml = `<div class="shimmer-loading" style="height:120px;border-radius:12px;margin-bottom:12px"></div><div class="shimmer-loading" style="height:80px;border-radius:12px"></div>`;
    }

    const funFact = lesson && lesson.funFact ? `
      <div style="background:rgba(201,136,108,0.08);border-left:3px solid #C9886C;border-radius:10px;padding:12px 14px;margin:16px 0">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#C9886C;margin-bottom:6px">Fun Fact ✦</div>
        <div style="font-size:14px;color:var(--text-secondary,#6B5565);line-height:1.6">${SovereignUtils.sanitizeHtml(lesson.funFact)}</div>
      </div>` : '';

    const nextPreview = lesson && lesson.nextPreview ? `
      <div style="background:rgba(107,91,149,0.06);border-radius:12px;padding:12px 14px;margin-top:16px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6B5B95;margin-bottom:4px">Coming Up Next</div>
        <div style="font-size:14px;color:var(--text-secondary,#6B5565)">${SovereignUtils.sanitizeHtml(lesson.nextPreview)}</div>
      </div>` : '';

    const objectives = (lesson && lesson.objectives) || [topic.objectives];

    return `<div class="academy-container">
  <button class="acad-back-btn" id="back-to-week">← Week ${week}</button>
  <div class="lesson-container">
    <div class="lesson-header">
      <div class="lesson-day-badge">Week ${week} · Day ${day} of 6 · ${SovereignUtils.sanitizeHtml(phase.title)}</div>
      <div class="lesson-title">${SovereignUtils.sanitizeHtml(lesson ? lesson.topic : topic.title)}</div>
      <div class="lesson-objectives">
        ${objectives.map(o => `<span class="lesson-obj-chip">${SovereignUtils.sanitizeHtml(o)}</span>`).join('')}
      </div>
    </div>

    <button class="ai-lesson-btn" id="ai-lesson-btn"${!ClaudeAI.isReady() ? ' title="Add API key in Settings"' : ''}>
      <span>✦</span>
      <span id="ai-lesson-btn-label">${lesson ? 'Load AI Lesson Enhancement' : '✦ Generate Lesson with AI'}</span>
    </button>
    <div id="ai-lesson-content" style="display:none" class="ai-lesson-content"></div>

    <div class="lesson-section-head">📖 Theory</div>
    <div class="lesson-theory" id="lesson-theory">${theoryHtml}</div>

    ${codeHtml ? `<div class="lesson-section-head">💻 Code Example</div>${codeHtml}` : ''}

    ${funFact}

    ${exercisesHtml ? `<div class="lesson-section-head">✏️ Exercises</div>${exercisesHtml}` : ''}

    ${nextPreview}

    <button class="mark-complete-btn" id="mark-complete-btn"${isDone ? ' disabled' : ''}>
      ${isDone ? '✓ Already Completed' : '✓ Mark Day Complete (+50 XP)'}
    </button>
  </div>
</div>`;
  }

  // ─── Test View ─────────────────────────────────────────────────────────────

  function _renderTestView() {
    const week = _selectedWeek;
    const topic = _getWeekTopic(week);
    const test = _testData;

    _testAnswers = { multipleChoice: {}, practicalCode: '' };

    const timerR = 52;
    const timerCirc = 2 * Math.PI * timerR;
    const timerPct = _testSecondsLeft / (30 * 60);
    const timerDash = timerPct * timerCirc;
    const minutes = Math.floor(_testSecondsLeft / 60);
    const seconds = _testSecondsLeft % 60;

    // Use AI-generated test data or fallback to static questions
    const questions = (test && test.questions) || _getStaticTestQuestions(week);
    const practical = (test && test.practical) || _getStaticPractical(week);

    const questionsHtml = questions.map((q, qi) => `
      <div class="mc-question" id="mc-q-${qi}">
        <div class="mc-q-num">Question ${qi + 1} of ${questions.length}</div>
        <div class="mc-q-text">${SovereignUtils.sanitizeHtml(q.question)}</div>
        <div class="mc-options">
          ${q.options.map((opt, oi) => {
            const letter = ['A','B','C','D'][oi];
            return `<button class="mc-option" data-qi="${qi}" data-oi="${oi}" role="radio" aria-checked="false">
              <span class="mc-option-letter">${letter}</span>
              <span>${SovereignUtils.sanitizeHtml(opt)}</span>
            </button>`;
          }).join('')}
        </div>
      </div>`).join('');

    return `<div class="academy-container">
  <button class="acad-back-btn" id="back-to-week-from-test">← Week ${week}</button>
  <div class="test-container">
    <div class="test-header">
      <div class="test-title">Week ${week} — Weekly Test</div>
      <div class="test-sub">${SovereignUtils.sanitizeHtml(topic.title)} · 30 minutes · ${questions.length} questions + practical</div>
    </div>

    <div class="timer-ring-wrap">
      <svg viewBox="0 0 120 120" width="120" height="120" id="timer-svg">
        <circle cx="60" cy="60" r="${timerR}" fill="none" stroke="rgba(201,136,108,0.15)" stroke-width="8"/>
        <circle cx="60" cy="60" r="${timerR}" fill="none" stroke="#C9886C" stroke-width="8"
          stroke-linecap="round"
          stroke-dasharray="${timerDash.toFixed(1)} ${timerCirc.toFixed(1)}"
          stroke-dashoffset="${timerCirc / 4}"
          id="timer-arc"/>
        <text x="60" y="56" text-anchor="middle" fill="#3D1F2D" font-size="18" font-weight="800" id="timer-minutes">${String(minutes).padStart(2,'0')}</text>
        <text x="60" y="72" text-anchor="middle" fill="#9B7E8C" font-size="11" id="timer-seconds">:${String(seconds).padStart(2,'0')}</text>
        <text x="60" y="85" text-anchor="middle" fill="#9B7E8C" font-size="9">remaining</text>
      </svg>
    </div>

    <div id="mc-section">
      <div class="acad-section-title" style="padding:0;margin-bottom:16px">Multiple Choice</div>
      ${questionsHtml}
    </div>

    <div class="practical-section">
      <div class="practical-label">Practical Challenge</div>
      <div class="practical-desc">${SovereignUtils.sanitizeHtml(practical.description)}</div>
      <textarea class="exercise-code-area" id="practical-code" style="min-height:160px" placeholder="Write your solution here...">${SovereignUtils.sanitizeHtml(practical.starterCode || '')}</textarea>
    </div>

    <button class="test-submit-btn" id="test-submit-btn">
      Submit Test ✦
    </button>
  </div>
</div>`;
  }

  function _getStaticTestQuestions(week) {
    // Provide sensible fallback questions based on week/phase
    const phase = _getPhaseForWeek(week);
    const base = [
      {
        question: `What is the correct HTML tag for a paragraph?`,
        options: ['<para>', '<p>', '<paragraph>', '<text>'],
        correct: 1
      },
      {
        question: 'Which CSS property controls text color?',
        options: ['text-color', 'font-color', 'color', 'foreground'],
        correct: 2
      },
      {
        question: 'What does CSS stand for?',
        options: ['Computer Style Sheets', 'Creative Style Syntax', 'Cascading Style Sheets', 'Coded Style Sheets'],
        correct: 2
      },
      {
        question: 'Which HTML attribute specifies an alternate text for an image?',
        options: ['title', 'src', 'alt', 'longdesc'],
        correct: 2
      },
      {
        question: 'Which CSS display value makes an element a flex container?',
        options: ['block', 'inline', 'flex', 'grid'],
        correct: 2
      }
    ];
    return base;
  }

  function _getStaticPractical(week) {
    return {
      description: `Create a simple webpage layout for Week ${week}. Apply the concepts you have learned this week. Your solution should be clean, semantic, and demonstrate your understanding of the topics covered.`,
      starterCode: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Week ${week} Project</title>\n  <style>\n    /* Add your styles here */\n  </style>\n</head>\n<body>\n  <!-- Add your content here -->\n</body>\n</html>`
    };
  }

  // ─── Test Results View ─────────────────────────────────────────────────────

  function _renderResultsView() {
    const results = _testResults;
    if (!results) return _renderDashboard();

    const week = _selectedWeek;
    const passed = results.passed !== false && (results.score >= 60);
    const score = results.score || 0;
    const grade = results.grade || _scoreToGrade(score);
    const xpEarned = passed ? (score >= 90 ? 200 : 150) : 25;
    const gradeColor = score >= 90 ? '#7A9B6C' : score >= 70 ? '#C9886C' : score >= 60 ? '#D4954A' : '#C87070';

    const mcFeedback = (results.questionFeedback || []).map((f, i) => `
      <div class="mc-result-item ${f.correct ? 'correct' : 'incorrect'}">
        <div class="mc-q-num">Question ${i + 1}</div>
        <div class="mc-result-q">${SovereignUtils.sanitizeHtml(f.question || '')}</div>
        <div class="mc-result-indicator ${f.correct ? 'correct' : 'incorrect'}">
          ${f.correct ? '✓ Correct' : '✗ Incorrect'}${!f.correct && f.correctAnswer ? ` · Correct: ${SovereignUtils.sanitizeHtml(f.correctAnswer)}` : ''}
        </div>
        ${f.explanation ? `<div class="mc-result-explanation">${SovereignUtils.sanitizeHtml(f.explanation)}</div>` : ''}
      </div>`).join('');

    return `<div class="academy-container">
  <div class="results-container">
    <div class="results-score-hero">
      <div class="results-pass-badge ${passed ? 'passed' : 'failed'}">${passed ? '✓ PASSED' : '✗ FAILED'}</div>
      <div class="results-score-num" id="results-score-num">0</div>
      <div class="results-score-label">Score</div>
      <div class="results-grade" style="background:rgba(255,255,255,0.1);color:${gradeColor}">${grade}</div>
      <div class="results-xp">+${xpEarned} XP earned</div>
    </div>

    ${results.summary ? `
    <div class="acad-section">
      <div class="feedback-title">Overall Feedback</div>
      <div class="practical-feedback">${SovereignUtils.sanitizeHtml(results.summary)}</div>
    </div>` : ''}

    ${mcFeedback ? `
    <div class="acad-section">
      <div class="feedback-title">Question Review</div>
      ${mcFeedback}
    </div>` : ''}

    ${results.practicalFeedback ? `
    <div class="acad-section">
      <div class="feedback-title">Practical Feedback</div>
      <div class="practical-feedback">${SovereignUtils.sanitizeHtml(results.practicalFeedback)}</div>
    </div>` : ''}

    ${results.encouragement ? `
    <div style="padding:16px;text-align:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16px;color:#C9886C;line-height:1.6">
      "${SovereignUtils.sanitizeHtml(results.encouragement)}"
    </div>` : ''}

    <div style="padding:0 0 8px">
      ${passed
        ? `<button class="mark-complete-btn" id="continue-to-next-btn" style="background:linear-gradient(135deg,#7A9B6C,#5C8A58)">
            Continue to Week ${week + 1} →
           </button>`
        : `<button class="mark-complete-btn" id="retry-test-btn" style="background:linear-gradient(135deg,#C9886C,#D4954A)">
            Retry Test
           </button>`}
      <button class="share-btn" id="share-achievement-btn">
        <span>📤</span> Share Achievement
      </button>
    </div>
  </div>
</div>`;
  }

  function _scoreToGrade(score) {
    if (score >= 93) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 60) return 'D';
    return 'F';
  }

  // ─── Attach View Events ────────────────────────────────────────────────────

  function _attachViewEvents() {
    if (!_container) return;
    const c = _container;

    // Dashboard events
    c.querySelector('#continue-card')?.addEventListener('click', () => {
      const p = _getProgress();
      const week = p.currentWeek || 1;
      const day = p.currentDay || 1;
      _navigateTo('lesson', { week, day, lesson: null });
      _loadLesson(week, day);
    });

    c.querySelectorAll('.phase-card').forEach(card => {
      card.addEventListener('click', () => {
        const pid = parseInt(card.dataset.phase);
        const phase = PHASES.find(ph => ph.id === pid);
        if (!phase) return;
        const p = _getProgress();
        if (phase.weeks[0] > (p.currentWeek || 1)) {
          SovereignUtils.toast('Complete earlier phases to unlock this one.', 'info');
          return;
        }
        _navigateTo('phase', { phase: pid });
      });
    });

    // Phase view events
    c.querySelector('#back-to-dashboard')?.addEventListener('click', () => _navigateTo('dashboard'));

    c.querySelectorAll('.week-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('week-locked')) {
          SovereignUtils.toast('Complete the current week to unlock this one.', 'info');
          return;
        }
        _navigateTo('week', { week: parseInt(card.dataset.week) });
      });
    });

    // Week view events
    c.querySelector('#back-to-phase')?.addEventListener('click', () => {
      _navigateTo('phase', { phase: _getPhaseForWeek(_selectedWeek).id });
    });

    c.querySelectorAll('.day-card:not(.locked)').forEach(card => {
      if (card.id === 'day-7-test') {
        card.addEventListener('click', () => {
          if (card.classList.contains('locked') || card.getAttribute('aria-disabled') === 'true') {
            SovereignUtils.toast('Complete all 6 lessons first to unlock the test.', 'info');
            return;
          }
          _startTest();
        });
      } else {
        const day = parseInt(card.dataset.day);
        card.addEventListener('click', () => {
          if (card.getAttribute('aria-disabled') === 'true') {
            SovereignUtils.toast('Complete the previous day first.', 'info');
            return;
          }
          _navigateTo('lesson', { week: _selectedWeek, day, lesson: null });
          _loadLesson(_selectedWeek, day);
        });
      }
    });

    // Lesson view events
    c.querySelector('#back-to-week')?.addEventListener('click', () => _navigateTo('week'));

    c.querySelector('#ai-lesson-btn')?.addEventListener('click', _handleAiLessonEnhancement);

    c.querySelector('#copy-code-btn')?.addEventListener('click', () => {
      const code = _currentLesson && _currentLesson.codeExample;
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => SovereignUtils.toast('Code copied!', 'success'));
      }
    });

    c.querySelectorAll('.exercise-submit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.dataset.exId;
        const exIdx = parseInt(btn.dataset.exIdx);
        _handleExerciseSubmit(exId, exIdx, btn);
      });
    });

    c.querySelector('#mark-complete-btn')?.addEventListener('click', _handleMarkComplete);

    // Test view events
    c.querySelector('#back-to-week-from-test')?.addEventListener('click', () => {
      _stopTimer();
      _navigateTo('week');
    });

    c.querySelectorAll('.mc-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const qi = parseInt(opt.dataset.qi);
        const oi = parseInt(opt.dataset.oi);
        // Deselect all in same question
        c.querySelectorAll(`.mc-option[data-qi="${qi}"]`).forEach(o => {
          o.classList.remove('selected');
          o.setAttribute('aria-checked', 'false');
        });
        opt.classList.add('selected');
        opt.setAttribute('aria-checked', 'true');
        _testAnswers.multipleChoice[qi] = oi;
      });
    });

    const practicalArea = c.querySelector('#practical-code');
    if (practicalArea) {
      practicalArea.addEventListener('input', () => {
        _testAnswers.practicalCode = practicalArea.value;
      });
    }

    c.querySelector('#test-submit-btn')?.addEventListener('click', _handleTestSubmit);

    // Results view events
    c.querySelector('#continue-to-next-btn')?.addEventListener('click', () => {
      const nextWeek = _selectedWeek + 1;
      _saveProgress({
        currentWeek: nextWeek,
        currentDay: 1
      });
      _navigateTo('week', { week: nextWeek });
    });

    c.querySelector('#retry-test-btn')?.addEventListener('click', () => {
      _testSecondsLeft = 30 * 60;
      _startTest();
    });

    c.querySelector('#share-achievement-btn')?.addEventListener('click', _handleShareAchievement);

    // Start animating score counter
    if (_view === 'results' && _testResults) {
      setTimeout(() => {
        const el = document.getElementById('results-score-num');
        if (el) {
          SovereignUtils.animateValue(el, 0, _testResults.score || 0, 1200, v => `${Math.round(v)}`);
        }
      }, 300);
    }
  }

  // ─── Lesson Loading ─────────────────────────────────────────────────────────

  async function _loadLesson(week, day) {
    // Try cache first
    const cacheKey = `lesson_w${week}d${day}`;
    const cached = SovereignStorage.get(cacheKey);
    if (cached) {
      _currentLesson = cached;
      _renderCurrentView();
      return;
    }

    // If no AI, render with placeholder
    if (!ClaudeAI.isReady()) {
      _currentLesson = _getStaticLesson(week, day);
      _renderCurrentView();
      return;
    }

    // Generate with AI
    try {
      const lesson = await ClaudeAI.generateStudyLesson(week, day);
      if (lesson) {
        _currentLesson = lesson;
        SovereignStorage.set(cacheKey, lesson);
        _renderCurrentView();
        _attachViewEvents();
      }
    } catch (err) {
      console.warn('[Academy] lesson load failed:', err);
      _currentLesson = _getStaticLesson(week, day);
      _renderCurrentView();
    }
  }

  function _getStaticLesson(week, day) {
    const topic = _getWeekTopic(week);
    return {
      topic: `${topic.title} — Day ${day}`,
      objectives: [
        'Understand today\'s core concept',
        'Practice with hands-on exercises',
        'Build your coding vocabulary'
      ],
      theory: `<p>Welcome to <strong>Week ${week}, Day ${day}</strong> of your Developer Academy journey, Soukaina!</p>
<p>Today we're continuing with <strong>${topic.title}</strong>. ${topic.objectives}</p>
<p>To get the most out of this lesson, <strong>add your Claude API key</strong> in Settings to unlock AI-generated lesson content, exercises, and personalized feedback tailored specifically for you.</p>
<p>Every concept you master brings you one step closer to becoming a job-ready full-stack developer. The journey of 130 weeks begins with one line of code at a time. <strong>You've got this, Soukaina. ✦</strong></p>
<ul>
  <li>Read the theory carefully and take notes</li>
  <li>Try the exercises without looking at solutions first</li>
  <li>If stuck, re-read the theory or check the hint</li>
</ul>`,
      codeExample: `<!-- Example code for Week ${week}, Day ${day} -->\n<!-- Add your Claude API key in Settings for AI-generated code examples -->`,
      language: 'html',
      exercises: [
        {
          id: 'ex-1',
          title: `Practice: ${topic.title}`,
          instructions: `Apply what you have learned today about ${topic.title}. Create a simple example that demonstrates the core concept. Add your Claude API key in Settings to get personalized, detailed exercises.`,
          starterCode: `<!-- Write your code here -->\n`,
          hint: 'Add your Claude API key in Settings to get detailed hints and AI grading.',
          solution: ''
        }
      ],
      funFact: `Did you know? The web was invented by Tim Berners-Lee in 1989. What you're learning today is the foundation of a technology used by billions of people worldwide. ✦`,
      nextPreview: `Tomorrow: Day ${day + 1 <= 6 ? day + 1 : 'Test'} continues building on today's concepts.`
    };
  }

  // ─── AI Lesson Enhancement ─────────────────────────────────────────────────

  async function _handleAiLessonEnhancement() {
    const btn = _container && _container.querySelector('#ai-lesson-btn');
    const label = _container && _container.querySelector('#ai-lesson-btn-label');
    const contentDiv = _container && _container.querySelector('#ai-lesson-content');

    if (!ClaudeAI.isReady()) {
      SovereignUtils.toast('Add your Claude API key in Settings to use AI features.', 'info');
      return;
    }

    if (btn) btn.disabled = true;
    if (label) label.textContent = '⟳ Generating AI enhancement…';
    if (contentDiv) { contentDiv.style.display = 'block'; contentDiv.textContent = 'Personalizing your lesson…'; }

    const topic = _getWeekTopic(_selectedWeek);

    try {
      let fullText = '';
      await ClaudeAI.stream(
        [{ role: 'user', content: `Give Soukaina a deeper, more personal explanation of "${topic.title}" for Week ${_selectedWeek}, Day ${_selectedDay}. Use 2-3 short paragraphs. Use a warm, encouraging tone. Include one real-world analogy that relates to her life (IELTS teaching, Vietnam, everyday objects). Do not use markdown symbols.` }],
        '',
        (chunk, full) => {
          if (contentDiv) contentDiv.textContent = full;
          fullText = full;
        },
        () => {
          if (btn) { btn.style.display = 'none'; }
        }
      );
    } catch (err) {
      if (contentDiv) contentDiv.textContent = 'Could not load AI enhancement right now. Try again shortly.';
      if (btn) btn.disabled = false;
      if (label) label.textContent = 'Load AI Lesson Enhancement';
    }
  }

  // ─── Exercise Submit ───────────────────────────────────────────────────────

  async function _handleExerciseSubmit(exId, exIdx, btn) {
    if (_gradeInProgress.has(exId)) return;
    _gradeInProgress.add(exId);

    const codeArea = _container && _container.querySelector(`#ex-code-${exId}`);
    const resultDiv = _container && _container.querySelector(`#ex-result-${exId}`);
    const code = codeArea ? codeArea.value : '';

    if (!code.trim()) {
      SovereignUtils.toast('Write some code before submitting!', 'warning');
      _gradeInProgress.delete(exId);
      return;
    }

    if (btn) btn.disabled = true;
    if (btn) btn.textContent = '⟳ Grading…';
    if (resultDiv) { resultDiv.style.display = 'block'; resultDiv.innerHTML = '<div class="shimmer-loading" style="height:80px;border-radius:10px"></div>'; }

    const exercise = _currentLesson && _currentLesson.exercises && _currentLesson.exercises[exIdx];

    if (!ClaudeAI.isReady() || !exercise) {
      // Basic pass
      const xp = 20;
      _awardXP(xp, 'exercise completed');
      if (resultDiv) resultDiv.innerHTML = _renderExerciseResult({
        score: 75, grade: 'B', passed: true,
        summary: 'Great effort! Add your Claude API key for detailed AI grading.',
        strengths: ['You attempted the exercise', 'Code was submitted'],
        improvements: ['Add your Claude API key for personalized feedback'],
        encouragement: 'Keep going, Soukaina! Every line of code you write is progress. ✦',
        xpEarned: xp
      });
      if (btn) btn.textContent = '✓ Submitted';
      _gradeInProgress.delete(exId);
      return;
    }

    try {
      const result = await ClaudeAI.gradeCode(code, exercise, `Week ${_selectedWeek}`);
      if (result) {
        if (result.xpEarned) _awardXP(result.xpEarned, 'exercise completed');
        if (resultDiv) resultDiv.innerHTML = _renderExerciseResult(result);
        if (btn) btn.textContent = '✓ Submitted';
      }
    } catch (err) {
      SovereignUtils.toast('Grading failed. Try again.', 'error');
      if (btn) btn.disabled = false;
      if (btn) btn.textContent = '✦ Submit Exercise';
    }

    _gradeInProgress.delete(exId);
  }

  function _renderExerciseResult(r) {
    const passColor = r.passed ? '#7A9B6C' : '#C87070';
    return `<div class="er-header">
      <div>
        <div class="er-score" style="color:${passColor}">${r.score}%</div>
        <div class="er-grade" style="color:${passColor}">${r.grade}</div>
      </div>
      <div style="font-size:22px">${r.passed ? '🎉' : '💪'}</div>
    </div>
    <div class="er-body">
      <div class="er-summary">${SovereignUtils.sanitizeHtml(r.summary || '')}</div>
      ${r.strengths && r.strengths.length ? `
        <div style="font-size:12px;font-weight:700;color:#7A9B6C;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Strengths</div>
        <ul class="er-list">${r.strengths.map(s => `<li>${SovereignUtils.sanitizeHtml(s)}</li>`).join('')}</ul>` : ''}
      ${r.improvements && r.improvements.length ? `
        <div style="font-size:12px;font-weight:700;color:#C9886C;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;margin-top:8px">To Improve</div>
        <ul class="er-list">${r.improvements.map(s => `<li>${SovereignUtils.sanitizeHtml(s)}</li>`).join('')}</ul>` : ''}
      ${r.encouragement ? `<div class="er-encourage">${SovereignUtils.sanitizeHtml(r.encouragement)}</div>` : ''}
    </div>`;
  }

  // ─── Mark Day Complete ─────────────────────────────────────────────────────

  function _handleMarkComplete() {
    const week = _selectedWeek;
    const day = _selectedDay;
    if (_isDayCompleted(week, day)) return;

    const key = `w${week}d${day}`;
    const p = _getProgress();
    const newCompleted = [...(p.completedDays || []), key];

    // Calculate next day
    let nextWeek = week, nextDay = day + 1;
    if (nextDay > 6) { nextDay = 7; } // test day

    _saveProgress({
      completedDays: newCompleted,
      currentWeek: Math.max(p.currentWeek || 1, nextDay > 7 ? week + 1 : week),
      currentDay: nextDay > 7 ? 1 : nextDay,
      scores: { ...(p.scores || {}), [`w${week}d${day}`]: 100 }
    });

    _updateStreak();
    _awardXP(50, `Day ${day} completed`);
    _spawnConfetti();
    SovereignUtils.toast(`Day ${day} complete! +50 XP ✦`, 'success');

    const btn = _container && _container.querySelector('#mark-complete-btn');
    if (btn) { btn.disabled = true; btn.textContent = '✓ Completed!'; }

    setTimeout(() => _navigateTo('week'), 1200);
  }

  // ─── Test Logic ─────────────────────────────────────────────────────────────

  function _startTest() {
    _testSecondsLeft = 30 * 60;
    _testAnswers = { multipleChoice: {}, practicalCode: '' };
    _navigateTo('test', { testData: null });
    _startTimer();
  }

  function _startTimer() {
    _stopTimer();
    _testTimer = setInterval(() => {
      _testSecondsLeft--;
      _updateTimerUI();
      if (_testSecondsLeft <= 0) {
        _stopTimer();
        SovereignUtils.toast('Time is up! Submitting automatically.', 'warning');
        _handleTestSubmit();
      }
    }, 1000);
  }

  function _stopTimer() {
    if (_testTimer) { clearInterval(_testTimer); _testTimer = null; }
  }

  function _updateTimerUI() {
    const timerR = 52;
    const timerCirc = 2 * Math.PI * timerR;
    const timerPct = _testSecondsLeft / (30 * 60);
    const dash = timerPct * timerCirc;
    const minutes = Math.floor(_testSecondsLeft / 60);
    const seconds = _testSecondsLeft % 60;

    const arc = document.getElementById('timer-arc');
    const mEl = document.getElementById('timer-minutes');
    const sEl = document.getElementById('timer-seconds');

    if (arc) arc.setAttribute('stroke-dasharray', `${dash.toFixed(1)} ${timerCirc.toFixed(1)}`);
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = `:${String(seconds).padStart(2, '0')}`;

    // Warn when under 5 minutes
    if (_testSecondsLeft <= 300 && arc) arc.setAttribute('stroke', '#C87070');
  }

  async function _handleTestSubmit() {
    _stopTimer();

    const btn = _container && _container.querySelector('#test-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⟳ Grading your test…'; }

    // Get practical code from textarea
    const practicalArea = _container && _container.querySelector('#practical-code');
    if (practicalArea) _testAnswers.practicalCode = practicalArea.value;

    const test = _testData;
    const questions = (test && test.questions) || _getStaticTestQuestions(_selectedWeek);

    if (ClaudeAI.isReady()) {
      try {
        const results = await ClaudeAI.gradeWeeklyTest(_testAnswers, { questions }, _selectedWeek);
        if (results) {
          _handleTestResults(results);
          return;
        }
      } catch (err) {
        console.warn('[Academy] Test grading failed:', err);
      }
    }

    // Fallback: local grading
    const mc = _testAnswers.multipleChoice || {};
    let correct = 0;
    questions.forEach((q, i) => {
      if (mc[i] === q.correct) correct++;
    });
    const mcScore = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 50;
    const practicalScore = _testAnswers.practicalCode && _testAnswers.practicalCode.trim().length > 20 ? 70 : 30;
    const finalScore = Math.round(mcScore * 0.6 + practicalScore * 0.4);

    _handleTestResults({
      score: finalScore,
      grade: _scoreToGrade(finalScore),
      passed: finalScore >= 60,
      summary: finalScore >= 60
        ? `Well done, Soukaina! You scored ${finalScore}% on the Week ${_selectedWeek} test. Add your Claude API key for detailed personalized feedback.`
        : `You scored ${finalScore}%. Don't be discouraged — review the lessons and try again! Add your Claude API key for detailed feedback.`,
      questionFeedback: questions.map((q, i) => ({
        question: q.question,
        correct: mc[i] === q.correct,
        correctAnswer: q.options[q.correct],
        explanation: 'Add your Claude API key for question-by-question explanations.'
      })),
      practicalFeedback: _testAnswers.practicalCode && _testAnswers.practicalCode.trim().length > 20
        ? 'Practical code submitted. Add your Claude API key for detailed code review.'
        : 'No practical code was submitted. Make sure to complete the coding challenge.',
      encouragement: finalScore >= 60
        ? 'Keep building on this momentum! Every test you pass is a milestone. ✦'
        : 'Setbacks are part of the journey. Review, rest, and come back stronger. ✦'
    });
  }

  function _handleTestResults(results) {
    const week = _selectedWeek;
    const passed = results.passed !== false && (results.score >= 60);
    const xpEarned = passed ? (results.score >= 90 ? 200 : 150) : 25;

    const p = _getProgress();
    const testKey = `w${week}-test`;
    _saveProgress({
      scores: { ...(p.scores || {}), [testKey]: results.score }
    });

    if (passed) {
      const testDayKey = `w${week}d7`;
      const existing = p.completedDays || [];
      if (!existing.includes(testDayKey)) {
        _saveProgress({
          completedDays: [...existing, testDayKey]
        });
      }
      _updateStreak();
      _awardXP(xpEarned, `Week ${week} test ${results.score >= 90 ? 'aced' : 'passed'}`);
      _spawnConfetti();
    } else {
      _awardXP(xpEarned, 'test attempted');
    }

    _navigateTo('results', { testResults: results });
  }

  // ─── Confetti ──────────────────────────────────────────────────────────────

  function _spawnConfetti() {
    const colors = ['#C9886C', '#6B5B95', '#F5D0C8', '#7A9B6C', '#9B8EC4', '#D4954A'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      p.style.cssText = `
        left: ${Math.random() * 100}vw;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration: ${1.2 + Math.random() * 1.5}s;
        animation-delay: ${Math.random() * 0.5}s;
        width: ${5 + Math.random() * 8}px;
        height: ${5 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }
  }

  // ─── Share Achievement ─────────────────────────────────────────────────────

  function _handleShareAchievement() {
    const week = _selectedWeek;
    const score = _testResults && _testResults.score;
    const p = _getProgress();
    const html = `
      <div style="background:linear-gradient(135deg,#1A0D1A,#2D1040);border-radius:20px;padding:28px 24px;text-align:center;color:#F5D0C8" id="share-card">
        <div style="font-size:28px;margin-bottom:12px">👑</div>
        <div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:4px">Sovereign Academy</div>
        <div style="font-size:14px;color:rgba(245,208,200,0.6);margin-bottom:20px">Developer Journey</div>
        <div style="font-size:48px;font-weight:900;margin-bottom:4px">${score}%</div>
        <div style="font-size:14px;color:rgba(245,208,200,0.7);margin-bottom:12px">Week ${week} Test Score</div>
        <div style="font-size:13px;color:#C9886C">Week ${week} of 130 · ${p.xp || 0} XP · ${p.streak || 0} day streak</div>
        <div style="margin-top:16px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:rgba(245,208,200,0.5)">"Building the future, one week at a time. ✦"</div>
      </div>`;

    SovereignUtils.showModal('Share Achievement', html, [
      { label: 'Close', class: 'btn-ghost', onclick: `() => SovereignUtils.closeModal()` }
    ]);
  }

  // ─── Highlight.js Injection ────────────────────────────────────────────────

  function _injectHighlightJS() {
    if (window.hljs) return Promise.resolve();
    return new Promise((resolve) => {
      if (!document.getElementById('hljs-css')) {
        const link = document.createElement('link');
        link.id = 'hljs-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
        document.head.appendChild(link);
      }
      if (document.getElementById('hljs-js')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'hljs-js';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
      script.onload = () => {
        if (window.hljs) window.hljs.highlightAll();
        resolve();
      };
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  function render(container) {
    _container = container;
    _view = 'dashboard';
    _renderCurrentView();
    _injectHighlightJS();
  }

  function init() {
    // Called once after first render
  }

  function refresh() {
    if (_container) _renderCurrentView();
  }

  return { render, init, refresh };
})();
