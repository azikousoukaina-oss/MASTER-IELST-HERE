'use strict';

window.TodaySection = (() => {

  // ─── Constants ────────────────────────────────────────────────────────────

  const QUOTES = [
    "Every master was once a beginner. Your journey starts today, Soukaina. ✦",
    "Code is poetry. You're learning to write the most powerful language in the world.",
    "Small daily improvements lead to stunning results over time.",
    "The woman who wakes up with purpose is unstoppable.",
    "Discipline is choosing between what you want now and what you want most.",
    "You are building something extraordinary, one line of code at a time.",
    "Growth is uncomfortable — but so is staying the same. You chose growth. ✦",
    "She believed she could, so she did. And she does.",
    "Every day you study, you invest in the version of yourself you're becoming.",
    "The secret of getting ahead is getting started. You already did that.",
    "Stars can't shine without darkness. Every difficult day is making you brighter.",
    "Consistency over intensity. Show up today, and tomorrow. ✦",
    "You don't need to be perfect. You need to be persistent.",
    "Your future self is cheering you on right now. Don't let her down.",
    "Learning to code is learning to think — and you think beautifully.",
    "In Ho Chi Minh City's golden morning light, a developer is born. ✦",
    "Drink your water, write your code, glow your skin. You have everything.",
    "Success is the sum of small efforts repeated day in, day out.",
    "The best time to start was yesterday. The second best time is now.",
    "You are exactly where you need to be on this journey. Keep moving.",
    "Beauty, brains, and brilliant code — that's the Sovereign way. ✦",
    "Each block of code you write is a brick in the palace of your future.",
    "Rest when you must. Rise when you can. You are built for this.",
    "Challenge yourself because no one else is going to do it for you.",
    "Your dedication today is designing your life tomorrow.",
    "Great things never came from comfort zones.",
    "The woman who codes is the woman who creates her own opportunities. ✦",
    "You are becoming fluent in the language the future speaks.",
    "Today's struggle is tomorrow's strength. Trust the process.",
    "Be so good they can't ignore you. That's what you're doing. ✦",
    "Progress, not perfection. Every line counts.",
    "Soukaina, you are remarkable. Don't you forget it. ✦"
  ];

  const BLOCK_TYPE_CONFIG = {
    study:    { color: '#6B5B95', bg: 'rgba(107, 91, 149, 0.12)', icon: '📚', label: 'Study' },
    work:     { color: '#4A8B7B', bg: 'rgba(74, 139, 123, 0.12)', icon: '💼', label: 'Work' },
    wellness: { color: '#C9886C', bg: 'rgba(201, 136, 108, 0.12)', icon: '🌸', label: 'Wellness' },
    skincare: { color: '#E8A598', bg: 'rgba(232, 165, 152, 0.12)', icon: '✨', label: 'Skincare' },
    haircare: { color: '#D4954A', bg: 'rgba(212, 149, 74, 0.12)', icon: '💫', label: 'Hair Care' },
    meal:     { color: '#7A9B6C', bg: 'rgba(122, 155, 108, 0.12)', icon: '🍜', label: 'Meal' },
    break:    { color: '#9B7E8C', bg: 'rgba(155, 126, 140, 0.12)', icon: '☕', label: 'Break' },
    sleep:    { color: '#3D1F2D', bg: 'rgba(61, 31, 45, 0.12)', icon: '🌙', label: 'Sleep' },
    journal:  { color: '#9B8EC4', bg: 'rgba(155, 142, 196, 0.12)', icon: '📔', label: 'Journal' },
    water:    { color: '#4A90D9', bg: 'rgba(74, 144, 217, 0.12)', icon: '💧', label: 'Hydration' }
  };

  const STATIC_AI_TIPS = [
    "Start each study session with a 2-minute review of yesterday's notes. This activates your memory and accelerates learning by 40%.",
    "In Vietnam's heat, your brain performs best when well-hydrated. Aim for a glass of water every 90 minutes during study.",
    "The Pomodoro technique — 25 min focus, 5 min break — is proven to combat the mental fatigue of coding sessions.",
    "Writing code by hand before typing it forces deeper understanding. Try journaling one concept per day in your own words.",
    "Your IELTS teaching skills are a superpower for coding: you already know how to break complex ideas into digestible pieces.",
    "Celebrate every small win. Dopamine from completing tasks actually improves your ability to tackle the next one.",
    "The best developers aren't the fastest typers — they're the clearest thinkers. Slow down, understand deeply.",
    "Sleep is when your brain consolidates what you learned today. Protect your rest like it's part of your curriculum.",
    "Every bug you fix makes you a better debugger. Errors aren't failures — they're advanced lessons."
  ];

  // ─── State ─────────────────────────────────────────────────────────────────

  let _container = null;
  let _timelineInterval = null;
  let _longPressTimer = null;
  let _currentBlocks = [];
  let _completedIds = new Set();

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function _todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function _getQuoteForDay() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }

  function _timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  function _minutesToTime(mins) {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function _loadTodayData() {
    const key = _todayKey();
    const stored = SovereignStorage.get('today');
    if (stored && stored.date === key && Array.isArray(stored.blocks) && stored.blocks.length > 0) {
      _currentBlocks = stored.blocks;
      _completedIds = new Set(stored.completedBlockIds || []);
      return true;
    }
    return false;
  }

  function _saveTodayData(extraData = {}) {
    const key = _todayKey();
    SovereignStorage.set('today', {
      date: key,
      blocks: _currentBlocks,
      completedBlockIds: [..._completedIds],
      lastGenerated: new Date().toISOString(),
      quote: _getQuoteForDay(),
      ...extraData
    });
  }

  function _getStats() {
    const progress = SovereignStorage.get('curriculum_progress') || {};
    const wellness = SovereignStorage.get('wellness') || {};
    const today = _todayKey();

    let studyMins = 0;
    let workSessions = 0;
    let wellnessDone = 0;

    _currentBlocks.forEach(b => {
      if (!_completedIds.has(b.id)) return;
      const dur = _timeToMinutes(b.endTime) - _timeToMinutes(b.startTime);
      if (b.type === 'study') studyMins += dur;
      if (b.type === 'work') workSessions++;
      if (['wellness', 'skincare', 'haircare'].includes(b.type)) wellnessDone++;
    });

    const waterCount = (wellness.water && wellness.water.lastDate === today)
      ? (wellness.water.count || 0) : 0;

    const streak = progress.streak || 0;
    return { studyMins, workSessions, waterCount, wellnessDone, streak };
  }

  // ─── Default Plan Generator ────────────────────────────────────────────────

  function _buildDefaultBlocks(schedule) {
    const blocks = [];
    let id = 1;
    const mk = (type, startTime, endTime, title, subtitle, notes = '') => {
      const cfg = BLOCK_TYPE_CONFIG[type] || BLOCK_TYPE_CONFIG.break;
      blocks.push({
        id: `def-${id++}`,
        type,
        title,
        subtitle,
        startTime,
        endTime,
        color: cfg.color,
        icon: cfg.icon,
        completed: false,
        notes
      });
    };

    const wake = schedule.wakeTime || '07:00';
    const wakeM = _timeToMinutes(wake);

    // Wake up
    mk('wellness', wake, _minutesToTime(wakeM + 10), 'Wake Up', 'Rise and shine, Soukaina ✦', 'Take a moment to breathe and set your intention for the day.');
    // AM Skincare
    mk('skincare', _minutesToTime(wakeM + 10), _minutesToTime(wakeM + 30), 'AM Skincare Routine', '7-step morning protection', 'Cleanser → Toner → Vitamin C Serum → Eye Cream → Moisturiser → SPF → Setting Mist. In HCMC heat, SPF 50+ is non-negotiable!');
    // Breakfast
    const breakfastStart = _minutesToTime(wakeM + 35);
    const breakfastEnd = _minutesToTime(wakeM + 65);
    mk('meal', breakfastStart, breakfastEnd, 'Breakfast', 'Fuel your brain', 'Pho, banh mi, or eggs with fruit — a balanced breakfast powers your morning study.');

    // Water 1
    mk('water', _minutesToTime(wakeM + 70), _minutesToTime(wakeM + 72), 'Morning Hydration', '500ml water', 'Start your hydration habit early. Your skin and brain will thank you.');

    // Study blocks
    schedule.studyBlocks.forEach((sb, i) => {
      const startM = _timeToMinutes(sb.start);
      const endM = _timeToMinutes(sb.end);
      const duration = endM - startM;

      if (duration <= 90) {
        mk('study', sb.start, sb.end, `Study: ${sb.label}`, 'Web Development', 'Focus deeply. Put your phone on silent. You are building your future.');
      } else {
        // Split with break
        const mid = startM + 90;
        mk('study', sb.start, _minutesToTime(mid), `Study Block ${i + 1}`, sb.label, 'Deep focus session. Review previous notes first for 5 minutes.');
        mk('break', _minutesToTime(mid), _minutesToTime(mid + 15), 'Stretch Break', 'Move your body', 'Stand up, stretch your neck, roll your shoulders. Protect your posture!');
        if (mid + 15 < endM) {
          mk('water', _minutesToTime(mid + 15), _minutesToTime(mid + 17), 'Hydration', 'Drink a glass of water', 'Stay hydrated — hot HCMC weather dehydrates you faster than you think.');
          mk('study', _minutesToTime(mid + 17), sb.end, `Study Block ${i + 1}b`, `${sb.label} — Continued`, 'Keep the momentum going. Almost there!');
        }
      }
    });

    // Lunch
    mk('meal', '12:30', '13:15', 'Lunch', 'Nourishing midday meal', 'Eat away from screens. Mindful eating helps digestion and mental reset.');

    // Work sessions
    schedule.workSessions.forEach(ws => {
      mk('work', ws.start, ws.end, ws.label, 'IELTS Teaching', 'Give your students your full energy. Your teaching gift matters.');
    });

    // Self-care blocks if Monday off
    if (schedule.selfCareBlocks) {
      schedule.selfCareBlocks.forEach(sc => {
        mk('wellness', sc.start, sc.end, sc.label, 'Self-care time', 'Your Mondays are sacred. Invest in your wellbeing fully.');
      });
    }

    // Water reminders spread through afternoon
    ['14:00', '15:30', '17:00', '18:30'].forEach(t => {
      const tM = _timeToMinutes(t);
      // Only add if not overlapping with a work session
      const clashes = blocks.some(b => {
        const bs = _timeToMinutes(b.startTime);
        const be = _timeToMinutes(b.endTime);
        return tM >= bs && tM < be;
      });
      if (!clashes) {
        mk('water', t, _minutesToTime(tM + 2), 'Hydration Reminder', 'Drink a glass of water', 'Consistent hydration throughout the day maintains energy and focus.');
      }
    });

    // Dinner
    mk('meal', '19:30', '20:00', 'Dinner', 'Evening nourishment', 'Light, nutritious dinner. Avoid heavy meals after 8PM for better sleep.');

    // PM Skincare
    mk('skincare', '20:00', '20:20', 'PM Skincare Routine', 'Evening skin repair', 'Double cleanse → Toner → Retinol or Niacinamide → Peptide Serum → Night Cream. Let your skin repair while you sleep.');

    // Haircare (2x/week feel — always add, user can check if relevant)
    mk('haircare', '20:20', '20:35', 'Hair Care', 'Scalp & strand treatment', 'Scalp massage with oil (rosemary/coconut) boosts circulation and reduces hair loss. The humidity in HCMC can weigh hair down — lightweight oils are best.');

    // Journal
    mk('journal', '21:30', '22:00', 'Evening Journal', 'Reflect & gratitude', 'Write 3 things you are grateful for, 1 thing you learned today, and 1 intention for tomorrow.');

    // Wind-down
    mk('break', '22:00', '22:30', 'Wind Down', 'Screen-free relaxation', 'Read, meditate, or do gentle stretches. Dim the lights to signal to your body that sleep is coming.');

    // Sleep
    mk('sleep', '23:00', '07:00', 'Sleep', 'Rest & recovery', 'Quality sleep is when your brain consolidates everything you learned. Protect these hours — they are as important as study hours.');

    // Sort by start time
    blocks.sort((a, b) => _timeToMinutes(a.startTime) - _timeToMinutes(b.startTime));
    return blocks;
  }

  // ─── Progress Ring SVG ─────────────────────────────────────────────────────

  function _renderProgressRing(completed, total) {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const r = 38;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return `
      <svg class="progress-ring-svg" viewBox="0 0 100 100" width="88" height="88" aria-label="${pct}% complete">
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(201,136,108,0.15)" stroke-width="8"/>
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="#C9886C" stroke-width="8"
          stroke-linecap="round"
          stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
          stroke-dashoffset="${circ / 4}"
          style="transition: stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1);"
          class="progress-ring-fill"/>
        <text x="50" y="46" text-anchor="middle" class="ring-number" fill="#3D1F2D" font-size="16" font-weight="700">${pct}%</text>
        <text x="50" y="60" text-anchor="middle" fill="#9B7E8C" font-size="8">${completed}/${total}</text>
      </svg>`;
  }

  // ─── Stats Chips ───────────────────────────────────────────────────────────

  function _renderStatsChips(stats) {
    const chips = [
      { icon: '📚', value: stats.studyMins >= 60 ? `${Math.floor(stats.studyMins / 60)}h ${stats.studyMins % 60}m` : `${stats.studyMins}m`, label: 'Study' },
      { icon: '💼', value: stats.workSessions, label: 'Work sessions' },
      { icon: '💧', value: stats.waterCount, label: 'Glasses' },
      { icon: '🌸', value: stats.wellnessDone, label: 'Wellness' },
      { icon: '🔥', value: stats.streak, label: 'Day streak' }
    ];
    return chips.map(c => `
      <div class="today-stat-chip">
        <span class="stat-chip-icon">${c.icon}</span>
        <span class="stat-chip-value">${c.value}</span>
        <span class="stat-chip-label">${c.label}</span>
      </div>`).join('');
  }

  // ─── Timeline Rendering ─────────────────────────────────────────────────────

  function _currentTimeMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  function _renderTimeline() {
    if (!_currentBlocks.length) return '<div class="empty-state"><p>No blocks yet — tap Regenerate to build your day.</p></div>';

    const dayStart = _timeToMinutes(_currentBlocks[0].startTime);
    const lastBlock = _currentBlocks[_currentBlocks.length - 1];
    let dayEnd = _timeToMinutes(lastBlock.endTime);
    if (dayEnd <= dayStart) dayEnd += 24 * 60; // handle overnight
    const dayRange = dayEnd - dayStart || 1;

    const nowM = _currentTimeMinutes();
    const clampedNow = Math.min(Math.max(nowM, dayStart), dayEnd);
    const nowPct = ((clampedNow - dayStart) / dayRange) * 100;

    let html = `<div class="timeline-inner" id="timeline-inner">`;

    _currentBlocks.forEach((block, idx) => {
      const done = _completedIds.has(block.id);
      const cfg = BLOCK_TYPE_CONFIG[block.type] || BLOCK_TYPE_CONFIG.break;
      const startFmt = SovereignUtils.formatTimeStr(block.startTime);
      const duration = _timeToMinutes(block.endTime) - _timeToMinutes(block.startTime);
      const durStr = SovereignUtils.formatDuration(Math.abs(duration));

      const blockM = _timeToMinutes(block.startTime);
      const isCurrent = nowM >= blockM && nowM < _timeToMinutes(block.endTime);

      html += `
        <div class="timeline-item${done ? ' done' : ''}${isCurrent ? ' current-block' : ''}"
             data-id="${block.id}"
             data-idx="${idx}"
             role="listitem">
          <div class="tl-time-col">
            <span class="tl-time">${startFmt}</span>
          </div>
          <div class="tl-dot-col">
            <div class="tl-dot" style="background:${done ? '#7A9B6C' : cfg.color}; box-shadow: 0 0 0 3px ${done ? 'rgba(122,155,108,0.2)' : cfg.bg}">
              ${done ? '✓' : ''}
            </div>
            ${idx < _currentBlocks.length - 1 ? '<div class="tl-line"></div>' : ''}
          </div>
          <div class="tl-card glass-card${done ? ' tl-card-done' : ''}"
               style="border-left: 3px solid ${cfg.color};"
               data-id="${block.id}">
            <div class="tl-card-header">
              <span class="tl-icon">${block.icon || cfg.icon}</span>
              <div class="tl-card-text">
                <div class="tl-title">${SovereignUtils.sanitizeHtml(block.title)}</div>
                ${block.subtitle ? `<div class="tl-subtitle">${SovereignUtils.sanitizeHtml(block.subtitle)}</div>` : ''}
              </div>
              <div class="tl-card-meta">
                <span class="tl-dur">${durStr}</span>
                <button class="tl-check-btn${done ? ' checked' : ''}"
                        aria-label="${done ? 'Mark incomplete' : 'Mark complete'}"
                        data-id="${block.id}"
                        style="--check-color:${cfg.color}">
                  ${done ? '✓' : '○'}
                </button>
              </div>
            </div>
            ${isCurrent ? `<div class="tl-current-badge" style="color:${cfg.color}">▶ In progress now</div>` : ''}
          </div>
        </div>`;
    });

    // Current time indicator
    if (nowM >= dayStart && nowM <= dayEnd) {
      html += `<div class="tl-now-line" id="tl-now-line" style="top: calc(${nowPct.toFixed(1)}% - 1px)">
        <span class="tl-now-badge">${SovereignUtils.formatTimeStr(_minutesToTime(nowM))}</span>
      </div>`;
    }

    html += `</div>`;
    return html;
  }

  function _updateTimeIndicator() {
    const nowLine = document.getElementById('tl-now-line');
    if (!nowLine || !_currentBlocks.length) return;
    const dayStart = _timeToMinutes(_currentBlocks[0].startTime);
    const lastBlock = _currentBlocks[_currentBlocks.length - 1];
    let dayEnd = _timeToMinutes(lastBlock.endTime);
    if (dayEnd <= dayStart) dayEnd += 24 * 60;
    const nowM = _currentTimeMinutes();
    const clampedNow = Math.min(Math.max(nowM, dayStart), dayEnd);
    const pct = ((clampedNow - dayStart) / (dayEnd - dayStart)) * 100;
    nowLine.style.top = `calc(${pct.toFixed(1)}% - 1px)`;
    const badge = nowLine.querySelector('.tl-now-badge');
    if (badge) badge.textContent = SovereignUtils.formatTimeStr(_minutesToTime(nowM));
  }

  // ─── Main Render ───────────────────────────────────────────────────────────

  function _getDailyTip() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return STATIC_AI_TIPS[dayOfYear % STATIC_AI_TIPS.length];
  }

  function render(container) {
    _container = container;
    if (!_loadTodayData()) {
      const schedule = SovereignUtils.getScheduleForDate(new Date());
      _currentBlocks = _buildDefaultBlocks(schedule);
      _completedIds = new Set();
      _saveTodayData();
    }

    const today = new Date();
    const dateLabel = SovereignUtils.formatDate(today);
    const quote = _getQuoteForDay();
    const completed = _currentBlocks.filter(b => _completedIds.has(b.id)).length;
    const total = _currentBlocks.length;
    const stats = _getStats();
    const tip = _getDailyTip();

    container.innerHTML = `
<style>
/* ─── Today Section Styles ─────────────────────────────── */
.today-container { padding-bottom: 120px; }

.today-hero {
  background: linear-gradient(145deg, #3D1F2D 0%, #5C3047 50%, #3D1F2D 100%);
  border-radius: 0 0 28px 28px;
  padding: 24px 20px 28px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}
.today-hero::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(201,136,108,0.18) 0%, transparent 70%);
  border-radius: 50%;
}
.today-date-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  color: rgba(245,208,200,0.7);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.today-greeting {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: #F5D0C8;
  font-weight: 600;
  margin-bottom: 8px;
}
.today-quote {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 14px;
  color: rgba(250,246,241,0.75);
  line-height: 1.65;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 2px solid rgba(201,136,108,0.5);
}
.today-progress-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.today-progress-ring-wrap {
  flex-shrink: 0;
  position: relative;
}
.progress-ring-svg text { font-family: 'Inter', sans-serif; }
.today-stats-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  flex: 1;
}
.today-stats-chips::-webkit-scrollbar { display: none; }
.today-stat-chip {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(201,136,108,0.25);
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  flex-shrink: 0;
  gap: 2px;
}
.stat-chip-icon { font-size: 16px; line-height: 1; }
.stat-chip-value { font-size: 15px; font-weight: 700; color: #F5D0C8; line-height: 1.1; }
.stat-chip-label { font-size: 9px; color: rgba(245,208,200,0.55); text-transform: uppercase; letter-spacing: 0.5px; text-align: center; }

.today-ai-tip-card {
  margin: 0 16px 12px;
  padding: 16px 18px;
  border-left: 3px solid #C9886C;
  background: linear-gradient(135deg, rgba(201,136,108,0.08), rgba(245,208,200,0.04));
  border-radius: 16px;
}
.tip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.tip-header-icon { font-size: 18px; }
.tip-header-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #C9886C;
}
.tip-text {
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-secondary, #6B5565);
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
}

.today-regenerate-btn {
  margin: 0 16px 16px;
  width: calc(100% - 32px);
  padding: 15px;
  background: linear-gradient(135deg, #C9886C, #D4954A);
  color: #FAF6F1;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(201,136,108,0.35);
}
.today-regenerate-btn:active { transform: scale(0.97); }
.today-regenerate-btn:disabled { opacity: 0.6; pointer-events: none; }

.timeline-container {
  padding: 0 16px;
  position: relative;
}
.timeline-inner {
  position: relative;
}
.timeline-item {
  display: grid;
  grid-template-columns: 60px 28px 1fr;
  gap: 0 8px;
  align-items: flex-start;
  margin-bottom: 4px;
  position: relative;
}
.timeline-item.done .tl-card { opacity: 0.7; }
.timeline-item.current-block .tl-card {
  box-shadow: 0 0 0 2px #C9886C, 0 4px 20px rgba(201,136,108,0.25);
}

.tl-time-col {
  display: flex;
  align-items: flex-start;
  padding-top: 14px;
  justify-content: flex-end;
}
.tl-time {
  font-size: 11px;
  color: var(--text-muted, #9B7E8C);
  font-weight: 500;
  white-space: nowrap;
}
.tl-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.tl-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-top: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 700;
  z-index: 2;
  position: relative;
}
.tl-line {
  width: 2px;
  background: linear-gradient(to bottom, rgba(155,126,140,0.3), rgba(155,126,140,0.15));
  flex: 1;
  min-height: 20px;
}
.tl-card {
  margin: 6px 0 6px;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.15s;
  -webkit-user-select: none;
  user-select: none;
}
.tl-card:active { transform: scale(0.98); }
.tl-card-done { text-decoration-color: rgba(155,126,140,0.4); }
.tl-card-done .tl-title { text-decoration: line-through; color: var(--text-muted, #9B7E8C); }
.tl-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tl-icon { font-size: 20px; flex-shrink: 0; }
.tl-card-text { flex: 1; min-width: 0; }
.tl-title { font-size: 14px; font-weight: 600; color: var(--text-primary, #3D1F2D); line-height: 1.3; }
.tl-subtitle { font-size: 12px; color: var(--text-muted, #9B7E8C); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tl-card-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.tl-dur { font-size: 11px; color: var(--text-muted, #9B7E8C); font-weight: 500; }
.tl-check-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid var(--check-color, #C9886C);
  background: transparent;
  color: var(--check-color, #C9886C);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.15s;
  flex-shrink: 0;
}
.tl-check-btn.checked { background: var(--check-color, #C9886C); color: white; }
.tl-check-btn:active { transform: scale(0.85); }
.tl-current-badge { font-size: 11px; margin-top: 6px; font-weight: 600; }

.tl-now-line {
  position: absolute;
  left: 60px;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #C9886C, transparent);
  pointer-events: none;
  z-index: 10;
}
.tl-now-badge {
  position: absolute;
  left: 8px;
  top: -9px;
  background: #C9886C;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 8px;
  white-space: nowrap;
}

/* Block detail modal */
.block-modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.block-modal-icon { font-size: 32px; }
.block-modal-type { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #C9886C; font-weight: 600; }
.block-modal-time { font-size: 13px; color: var(--text-muted, #9B7E8C); margin-top: 2px; }
.block-modal-notes { font-size: 14px; line-height: 1.65; color: var(--text-secondary, #6B5565); font-family: 'Cormorant Garamond', serif; background: rgba(201,136,108,0.06); border-radius: 10px; padding: 12px 14px; margin-top: 10px; }
.block-ai-tip-area { margin-top: 14px; }
.block-ai-tip-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-top: 8px; padding: 10px 12px; border-radius: 10px; background: rgba(107,91,149,0.08); border-left: 2px solid #6B5B95; }

/* Shimmer loading */
.shimmer-block { height: 80px; border-radius: 14px; margin-bottom: 8px; }
</style>

<div class="today-container">
  <div class="today-hero">
    <div class="today-date-label">${dateLabel}</div>
    <div class="today-greeting">${SovereignUtils.getGreeting()}, Soukaina ✦</div>
    <div class="today-quote">"${SovereignUtils.sanitizeHtml(quote)}"</div>
    <div class="today-progress-row">
      <div class="today-progress-ring-wrap" id="progress-ring-wrap">
        ${_renderProgressRing(completed, total)}
      </div>
      <div class="today-stats-chips" id="stats-chips">
        ${_renderStatsChips(stats)}
      </div>
    </div>
  </div>

  <div class="today-ai-tip-card glass-card">
    <div class="tip-header">
      <span class="tip-header-icon">✦</span>
      <span class="tip-header-label">Daily Insight</span>
    </div>
    <div class="tip-text" id="today-tip-text">${SovereignUtils.sanitizeHtml(tip)}</div>
  </div>

  <button class="today-regenerate-btn" id="today-regen-btn" aria-label="Regenerate today's plan with AI">
    <span>✦</span>
    <span id="regen-btn-label">Regenerate Today's Plan</span>
  </button>

  <div class="timeline-container" id="timeline-container">
    ${_renderTimeline()}
  </div>
</div>`;

    _attachEventListeners();
    _startTimeUpdater();
  }

  // ─── Event Listeners ────────────────────────────────────────────────────────

  function _attachEventListeners() {
    if (!_container) return;

    // Regenerate button
    const regenBtn = _container.querySelector('#today-regen-btn');
    if (regenBtn) {
      regenBtn.addEventListener('click', _handleRegenerate);
    }

    // Timeline: tap to check/uncheck, long-press for detail
    const tlContainer = _container.querySelector('#timeline-container');
    if (tlContainer) {
      tlContainer.addEventListener('click', _handleTimelineClick);
      tlContainer.addEventListener('pointerdown', _handleLongPressStart);
      tlContainer.addEventListener('pointerup', _handleLongPressEnd);
      tlContainer.addEventListener('pointercancel', _handleLongPressEnd);
      tlContainer.addEventListener('pointermove', _handleLongPressEnd);
    }
  }

  function _handleTimelineClick(e) {
    const checkBtn = e.target.closest('.tl-check-btn');
    if (checkBtn) {
      e.stopPropagation();
      const id = checkBtn.dataset.id;
      if (id) _toggleBlock(id);
      return;
    }
  }

  function _handleLongPressStart(e) {
    const card = e.target.closest('.tl-card');
    if (!card) return;
    const id = card.dataset.id;
    if (!id) return;
    _longPressTimer = setTimeout(() => {
      _longPressTimer = null;
      _showBlockDetail(id);
    }, 500);
  }

  function _handleLongPressEnd() {
    if (_longPressTimer) {
      clearTimeout(_longPressTimer);
      _longPressTimer = null;
    }
  }

  function _toggleBlock(id) {
    if (_completedIds.has(id)) {
      _completedIds.delete(id);
    } else {
      _completedIds.add(id);
      try { SovereignReminders.playSound('crystal-bell'); } catch (e) {}
    }
    _saveTodayData();
    _refreshTimeline();
    _refreshProgress();
    _refreshStats();
  }

  function _refreshTimeline() {
    const tc = _container && _container.querySelector('#timeline-container');
    if (tc) tc.innerHTML = _renderTimeline();
  }

  function _refreshProgress() {
    const wrap = _container && _container.querySelector('#progress-ring-wrap');
    if (!wrap) return;
    const completed = _currentBlocks.filter(b => _completedIds.has(b.id)).length;
    const total = _currentBlocks.length;
    wrap.innerHTML = _renderProgressRing(completed, total);
  }

  function _refreshStats() {
    const chips = _container && _container.querySelector('#stats-chips');
    if (!chips) return;
    chips.innerHTML = _renderStatsChips(_getStats());
  }

  function _showBlockDetail(id) {
    const block = _currentBlocks.find(b => b.id === id);
    if (!block) return;
    const cfg = BLOCK_TYPE_CONFIG[block.type] || BLOCK_TYPE_CONFIG.break;
    const startFmt = SovereignUtils.formatTimeStr(block.startTime);
    const endFmt = SovereignUtils.formatTimeStr(block.endTime);
    const done = _completedIds.has(id);

    const html = `
      <div class="block-modal-header">
        <span class="block-modal-icon">${block.icon || cfg.icon}</span>
        <div>
          <div class="block-modal-type" style="color:${cfg.color}">${cfg.label}</div>
          <div style="font-weight:700;font-size:17px;color:var(--text-primary,#3D1F2D)">${SovereignUtils.sanitizeHtml(block.title)}</div>
          <div class="block-modal-time">${startFmt} — ${endFmt}</div>
        </div>
      </div>
      ${block.notes ? `<div class="block-modal-notes">${SovereignUtils.sanitizeHtml(block.notes)}</div>` : ''}
      <div class="block-ai-tip-area">
        <button class="btn btn-secondary" id="modal-ai-tip-btn" style="width:100%;margin-top:10px">
          ✦ Get AI Tips for This Block
        </button>
        <div id="modal-ai-tip-result" class="block-ai-tip-text" style="display:none"></div>
      </div>
    `;

    SovereignUtils.showModal(block.title, html, [
      {
        label: done ? '○ Mark Incomplete' : '✓ Mark Complete',
        class: done ? 'btn-secondary' : 'btn-primary',
        onclick: `() => { window.TodaySection._toggleBlockFromModal('${id}'); SovereignUtils.closeModal(); }`
      },
      { label: 'Close', class: 'btn-ghost', onclick: `() => SovereignUtils.closeModal()` }
    ]);

    // Attach AI tips button
    setTimeout(() => {
      const tipBtn = document.getElementById('modal-ai-tip-btn');
      if (tipBtn) {
        tipBtn.addEventListener('click', async () => {
          if (!ClaudeAI.isReady()) {
            const res = document.getElementById('modal-ai-tip-result');
            if (res) { res.textContent = 'Add your Claude API key in Settings to unlock AI tips.'; res.style.display = 'block'; }
            return;
          }
          tipBtn.disabled = true;
          tipBtn.textContent = '⟳ Loading...';
          const res = document.getElementById('modal-ai-tip-result');
          if (res) { res.style.display = 'block'; res.textContent = 'Generating personalized tip...'; }
          try {
            const resp = await ClaudeAI.chat([{
              role: 'user',
              content: `Give Soukaina one specific, practical tip for her "${block.title}" block (${block.type} type, ${SovereignUtils.formatDuration(_timeToMinutes(block.endTime) - _timeToMinutes(block.startTime))} long). Be warm, personal, and brief (2-3 sentences max).`
            }]);
            if (res) res.textContent = resp;
          } catch (err) {
            if (res) res.textContent = 'Could not load tip right now. Try again shortly.';
          }
          tipBtn.style.display = 'none';
        });
      }
    }, 100);
  }

  async function _handleRegenerate() {
    const btn = _container && _container.querySelector('#today-regen-btn');
    const label = _container && _container.querySelector('#regen-btn-label');
    const tc = _container && _container.querySelector('#timeline-container');

    if (btn) btn.disabled = true;
    if (label) label.textContent = '⟳ Building your day…';

    // Show shimmer
    if (tc) {
      tc.innerHTML = Array(8).fill(`<div class="shimmer-loading shimmer-block"></div>`).join('');
    }

    if (ClaudeAI.isReady()) {
      try {
        const today = new Date();
        const schedule = SovereignUtils.getScheduleForDate(today);
        const blocks = await ClaudeAI.generateDailyPlan(today, schedule);
        if (blocks && blocks.length > 0) {
          _currentBlocks = blocks;
          _completedIds = new Set();
          _saveTodayData();
          if (tc) tc.innerHTML = _renderTimeline();
          _refreshProgress();
          _refreshStats();
          SovereignUtils.toast('Plan regenerated with AI ✦', 'success');
          if (btn) btn.disabled = false;
          if (label) label.textContent = 'Regenerate Today\'s Plan';
          return;
        }
      } catch (err) {
        console.warn('[Today] AI regen failed, falling back to default:', err);
      }
    }

    // Fallback to default
    const schedule = SovereignUtils.getScheduleForDate(new Date());
    _currentBlocks = _buildDefaultBlocks(schedule);
    _completedIds = new Set();
    _saveTodayData();
    if (tc) tc.innerHTML = _renderTimeline();
    _refreshProgress();
    _refreshStats();
    SovereignUtils.toast(!ClaudeAI.isReady() ? 'Plan rebuilt (add API key for AI plans)' : 'Plan regenerated ✦', 'info');
    if (btn) btn.disabled = false;
    if (label) label.textContent = 'Regenerate Today\'s Plan';
  }

  // ─── Time Updater ──────────────────────────────────────────────────────────

  function _startTimeUpdater() {
    if (_timelineInterval) clearInterval(_timelineInterval);
    _timelineInterval = setInterval(() => {
      _updateTimeIndicator();
      // Re-render current-block highlights every minute
      const tc = _container && _container.querySelector('#timeline-container');
      if (tc) tc.innerHTML = _renderTimeline();
    }, 60000);
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  function init() {
    // Called once after first render
  }

  function refresh() {
    if (_container) render(_container);
  }

  // Exposed for modal onclick strings
  function _toggleBlockFromModal(id) {
    _toggleBlock(id);
  }

  return {
    render,
    init,
    refresh,
    _toggleBlockFromModal
  };
})();
