'use strict';

window.SovereignUtils = (() => {

  function formatTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function formatDateShort(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatTimeStr(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  }

  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  function formatRelativeDate(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff === -1) return 'Tomorrow';
    if (diff < 7 && diff > 0) return `${diff} days ago`;
    if (diff > -7 && diff < 0) return `In ${-diff} days`;
    return formatDateShort(new Date(dateStr));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }

  function getDaysUntil(dateStr) {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  function getWeekNumber(date) {
    const d = date instanceof Date ? date : new Date(date);
    const startDate = new Date('2026-05-27');
    startDate.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = d - startDate;
    if (diff < 0) return 1;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.ceil((days + 1) / 7));
  }

  function truncate(str, maxLen) {
    if (!str || str.length <= maxLen) return str || '';
    return str.slice(0, maxLen - 3) + '...';
  }

  function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function isTodayDate(dateStr) {
    const today = new Date();
    const d = new Date(dateStr);
    return today.toDateString() === d.toDateString();
  }

  function getScheduleForDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    const summerStart = new Date('2026-06-08T00:00:00');
    const isSummer = d >= summerStart;
    const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    if (!isSummer) {
      const isWeekend = day === 0 || day === 6;
      if (isWeekend) {
        return {
          type: 'transition-weekend',
          wakeTime: '10:00',
          workSessions: [
            { start: '07:30', end: '11:00', label: 'Morning Work' },
            { start: '14:30', end: '21:00', label: 'Afternoon Work' }
          ],
          studyBlocks: [
            { start: '11:30', end: '14:00', label: 'Study Break' }
          ],
          isMondayOff: false,
          isWorkDay: true
        };
      } else {
        return {
          type: 'transition-weekday',
          wakeTime: '08:00',
          workSessions: [
            { start: '15:00', end: '21:00', label: 'Work Session' }
          ],
          studyBlocks: [
            { start: '09:00', end: '12:30', label: 'Morning Study' },
            { start: '13:30', end: '14:45', label: 'Afternoon Study' }
          ],
          isMondayOff: false,
          isWorkDay: true
        };
      }
    } else {
      if (day === 1) {
        return {
          type: 'monday-off',
          wakeTime: '10:00',
          workSessions: [],
          studyBlocks: [
            { start: '10:30', end: '12:30', label: 'Morning Study' },
            { start: '14:00', end: '17:00', label: 'Deep Study Block' },
            { start: '19:00', end: '21:00', label: 'Evening Study' }
          ],
          selfCareBlocks: [
            { start: '12:30', end: '14:00', label: 'Lunch & Self-Care' },
            { start: '17:00', end: '19:00', label: 'Wellness Hour' }
          ],
          isMondayOff: true,
          isWorkDay: false
        };
      } else {
        return {
          type: 'summer-workday',
          wakeTime: '07:00',
          workSessions: [
            { start: '07:30', end: '11:00', label: 'Morning Work' },
            { start: '14:30', end: '21:00', label: 'Afternoon Work' }
          ],
          studyBlocks: [
            { start: '11:30', end: '14:00', label: 'Midday Study' }
          ],
          isMondayOff: false,
          isWorkDay: true
        };
      }
    }
  }

  function toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    const icons = { success: '✓', error: '✗', info: '◈', warning: '⚠' };
    toastEl.innerHTML = `
      <span class="toast-icon">${icons[type] || '◈'}</span>
      <span class="toast-message">${sanitizeHtml(message)}</span>
    `;

    container.appendChild(toastEl);
    requestAnimationFrame(() => requestAnimationFrame(() => toastEl.classList.add('toast-visible')));

    setTimeout(() => {
      toastEl.classList.remove('toast-visible');
      toastEl.classList.add('toast-hiding');
      setTimeout(() => toastEl.remove(), 400);
    }, duration);
  }

  function showModal(title, html, actions = []) {
    let container = document.getElementById('modal-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-container';
      document.body.appendChild(container);
    }

    const actionsHtml = actions.length
      ? `<div class="modal-actions">${actions.map(a =>
          `<button class="btn ${a.class || 'btn-primary'}" onclick="(${a.onclick})()">${sanitizeHtml(a.label)}</button>`
        ).join('')}</div>`
      : '';

    container.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop"></div>
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${sanitizeHtml(title)}</h3>
          <button class="modal-close-btn" aria-label="Close modal">×</button>
        </div>
        <div class="modal-body">${html}</div>
        ${actionsHtml}
      </div>
    `;

    container.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => container.classList.add('modal-open')));

    container.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
    container.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);

    // Trap focus
    container.querySelector('.modal-card')?.focus?.();
  }

  function closeModal() {
    const container = document.getElementById('modal-container');
    if (!container) return;
    container.classList.remove('modal-open');
    setTimeout(() => {
      if (container.parentNode) {
        container.style.display = 'none';
        container.innerHTML = '';
      }
    }, 300);
  }

  function shimmer(element, show = true) {
    if (!element) return;
    if (show) {
      element.classList.add('shimmer-loading');
    } else {
      element.classList.remove('shimmer-loading');
    }
  }

  function animateValue(element, start, end, duration, suffix = '') {
    if (!element) return;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + (end - start) * eased);
      element.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function createProgressRing(percent, size = 60, strokeWidth = 4, color = '#C9886C') {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="progress-ring">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(201,136,108,0.2)" stroke-width="${strokeWidth}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
          stroke-linecap="round" transform="rotate(-90 ${size/2} ${size/2})"/>
      </svg>
    `;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function getInitials(name) {
    return (name || 'S')
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text).then(() => {
        toast('Copied to clipboard', 'success', 2000);
      }).catch(() => {
        toast('Copy failed', 'error', 2000);
      });
    }
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      toast('Copied to clipboard', 'success', 2000);
    } catch {
      toast('Copy failed', 'error', 2000);
    }
    document.body.removeChild(el);
  }

  return {
    formatTime,
    formatDate,
    formatDateShort,
    formatTimeStr,
    formatDuration,
    formatRelativeDate,
    generateId,
    debounce,
    throttle,
    timeToMinutes,
    minutesToTime,
    getGreeting,
    getDaysUntil,
    getWeekNumber,
    truncate,
    sanitizeHtml,
    isTodayDate,
    getScheduleForDate,
    toast,
    showModal,
    closeModal,
    shimmer,
    animateValue,
    createProgressRing,
    clamp,
    lerp,
    getInitials,
    copyToClipboard
  };
})();
