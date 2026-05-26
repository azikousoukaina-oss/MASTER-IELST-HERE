'use strict';

window.SovereignReminders = (() => {
  let _audioCtx = null;
  let _scheduledTimers = {};
  let _initialized = false;

  // ─── Audio Context ─────────────────────────────────────────────────────────

  function getAudioContext() {
    if (!_audioCtx || _audioCtx.state === 'closed') {
      try {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('[Reminders] AudioContext unavailable:', e);
        return null;
      }
    }
    return _audioCtx;
  }

  async function resumeAudio() {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try { await ctx.resume(); } catch {}
    }
    return ctx;
  }

  // ─── Sound Synthesis ───────────────────────────────────────────────────────

  function playSound(type = 'crystal-bell') {
    const settings = SovereignStorage.get('settings') || {};
    if (settings.soundEnabled === false) return;

    const volume = typeof settings.volume === 'number' ? settings.volume : 0.6;

    resumeAudio().then(ctx => {
      if (!ctx) return;
      switch (type) {
        case 'crystal-bell':  _playCrystalBell(ctx, volume); break;
        case 'soft-gong':     _playSoftGong(ctx, volume);    break;
        case 'gentle-harp':   _playGentleHarp(ctx, volume);  break;
        case 'zen-chime':     _playZenChime(ctx, volume);    break;
        default:              _playCrystalBell(ctx, volume);
      }
    }).catch(() => {});
  }

  function _playCrystalBell(ctx, volume) {
    const frequencies = [1318.5, 1760, 2637]; // E6, A6, E7
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const now = ctx.currentTime;

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.997, now + 0.8);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * 0.4, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.start(now);
        osc.stop(now + 1.3);
      }, i * 150);
    });
  }

  function _playSoftGong(ctx, volume) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const now = ctx.currentTime;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 1.5);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(196, now);
    osc.frequency.exponentialRampToValueAtTime(186, now + 2);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.start(now);
    osc.stop(now + 2.6);

    // Add harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(392, now);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(volume * 0.15, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    osc2.start(now);
    osc2.stop(now + 2);
  }

  function _playGentleHarp(ctx, volume) {
    const notes = [
      { freq: 392.0, delay: 0 },    // G4
      { freq: 493.9, delay: 80 },   // B4
      { freq: 587.3, delay: 160 },  // D5
      { freq: 783.9, delay: 240 },  // G5
      { freq: 987.8, delay: 360 }   // B5
    ];

    notes.forEach(({ freq, delay }) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const now = ctx.currentTime;

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

        osc.start(now);
        osc.stop(now + 1.1);
      }, delay);
    });
  }

  function _playZenChime(ctx, volume) {
    const tones = [
      { freq: 528, delay: 0 },    // Love frequency
      { freq: 639, delay: 300 },  // Connection
      { freq: 741, delay: 600 }   // Expression
    ];

    tones.forEach(({ freq, delay }) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const now = ctx.currentTime;

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.995, now + 1.5);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * 0.35, now + 0.02);
        gainNode.gain.setValueAtTime(volume * 0.35, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.start(now);
        osc.stop(now + 1.9);
      }, delay);
    });
  }

  // ─── Notifications ─────────────────────────────────────────────────────────

  async function requestPermission() {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    const perm = await Notification.requestPermission();
    return perm;
  }

  function showSystemNotification(title, body, options = {}) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'icons/icon.svg',
          badge: 'icons/icon.svg',
          silent: false,
          ...options
        });
      } catch (e) {
        console.warn('[Reminders] Notification error:', e);
      }
    }
  }

  function showInAppReminder(id, label, sound, onSnooze, onDismiss) {
    const overlay = document.getElementById('reminder-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="reminder-card">
        <div class="reminder-glow"></div>
        <div class="reminder-icon-wrap">
          <div class="reminder-bell-icon">🔔</div>
        </div>
        <div class="reminder-content">
          <h3 class="reminder-title">Time for...</h3>
          <p class="reminder-label">${SovereignUtils.sanitizeHtml(label)}</p>
          <p class="reminder-time">${SovereignUtils.formatTime(new Date())}</p>
        </div>
        <div class="reminder-actions">
          <button class="btn btn-ghost reminder-snooze-btn" id="reminder-snooze">Snooze 10m</button>
          <button class="btn btn-primary reminder-dismiss-btn" id="reminder-dismiss">Got it ✓</button>
        </div>
      </div>
    `;

    overlay.classList.remove('hidden');
    overlay.classList.add('reminder-visible');

    overlay.querySelector('#reminder-snooze')?.addEventListener('click', () => {
      dismissReminder(overlay);
      onSnooze?.();
    });

    overlay.querySelector('#reminder-dismiss')?.addEventListener('click', () => {
      dismissReminder(overlay);
      onDismiss?.();
    });

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (!overlay.classList.contains('hidden')) {
        dismissReminder(overlay);
      }
    }, 30000);
  }

  function dismissReminder(overlay) {
    overlay.classList.remove('reminder-visible');
    overlay.classList.add('reminder-hiding');
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('reminder-hiding');
      overlay.innerHTML = '';
    }, 400);
  }

  // ─── Scheduling ─────────────────────────────────────────────────────────────

  function schedule(id, timeStr, label, soundType = 'crystal-bell', callback = null) {
    // Cancel existing timer for this id
    if (_scheduledTimers[id]) {
      clearTimeout(_scheduledTimers[id]);
      delete _scheduledTimers[id];
    }

    const now = new Date();
    const [targetHour, targetMin] = timeStr.split(':').map(Number);
    const target = new Date(now);
    target.setHours(targetHour, targetMin, 0, 0);

    // If time has passed, schedule for tomorrow
    if (target <= now) return;

    const delay = target - now;
    _scheduledTimers[id] = setTimeout(() => {
      delete _scheduledTimers[id];
      playSound(soundType);
      showInAppReminder(
        id,
        label,
        soundType,
        () => { // snooze: re-schedule 10 min later
          const snoozeTime = new Date(Date.now() + 10 * 60 * 1000);
          const snoozeStr = `${snoozeTime.getHours().toString().padStart(2,'0')}:${snoozeTime.getMinutes().toString().padStart(2,'0')}`;
          schedule(`${id}-snooze`, snoozeStr, label, soundType, callback);
        },
        callback
      );
      showSystemNotification('Sovereign — ' + label, `It's ${SovereignUtils.formatTimeStr(timeStr)}`, { tag: id });
    }, delay);
  }

  function cancelAll() {
    Object.values(_scheduledTimers).forEach(t => clearTimeout(t));
    _scheduledTimers = {};
  }

  function scheduleAllForToday() {
    const settings = SovereignStorage.get('settings') || {};
    if (settings.remindersOn === false) return;

    cancelAll();

    const today = new Date();
    const sched = SovereignUtils.getScheduleForDate(today);
    const soundType = settings.soundType || 'crystal-bell';

    // Skincare AM
    const wake = sched.wakeTime || '08:00';
    const [wakeH] = wake.split(':').map(Number);
    const amSkincare = `${String(wakeH).padStart(2,'0')}:15`;
    schedule('skincare-am', amSkincare, 'Morning Skincare Routine', soundType);

    // Breakfast
    const breakfastH = wakeH < 8 ? 8 : wakeH + 1;
    schedule('breakfast', `${String(breakfastH).padStart(2,'0')}:00`, 'Breakfast Time', soundType);

    // Water every 90 min from 30 min after wake
    let waterMinutes = SovereignUtils.timeToMinutes(wake) + 30;
    let waterCount = 0;
    while (waterMinutes < SovereignUtils.timeToMinutes('23:00') && waterCount < 10) {
      const timeStr = SovereignUtils.minutesToTime(waterMinutes);
      schedule(`water-${waterCount}`, timeStr, 'Hydration Reminder 💧 Drink a glass of water', soundType);
      waterMinutes += 90;
      waterCount++;
    }

    // Study sessions
    sched.studyBlocks?.forEach((block, i) => {
      schedule(`study-${i}`, block.start, `Study Time — ${block.label}`, soundType);
    });

    // Work sessions
    sched.workSessions?.forEach((session, i) => {
      schedule(`work-${i}`, session.start, `Work Session — ${session.label}`, soundType);
    });

    // Lunch
    schedule('lunch', '12:30', 'Lunch Break 🌿', soundType);

    // PM Skincare
    schedule('skincare-pm', '20:00', 'Evening Skincare Routine ✨', soundType);

    // Dinner
    schedule('dinner', '19:00', 'Dinner Time 🍜', soundType);

    // Journal time
    schedule('journal', '21:30', 'Journal & Reflect 📝', soundType);

    // Sleep reminder
    schedule('sleep', '23:00', 'Wind Down for Sleep 🌙', soundType);
  }

  function init() {
    if (_initialized) return;
    _initialized = true;

    // Resume audio context on first user interaction
    const resume = async () => {
      await resumeAudio();
    };

    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true, passive: true });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => requestPermission(), 3000);
    }
  }

  return {
    init,
    playSound,
    schedule,
    cancelAll,
    scheduleAllForToday,
    requestPermission,
    showInAppReminder
  };
})();
