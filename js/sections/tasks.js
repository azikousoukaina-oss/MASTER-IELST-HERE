'use strict';

window.TasksSection = (() => {

  let _initialized = false;
  let _activeFilter = 'all';
  let _swipeState = null;

  const CATEGORIES = [
    { id: 'work', label: 'Work', color: '#C9886C', emoji: '💼' },
    { id: 'coding', label: 'Coding', color: '#9B7BAE', emoji: '💻' },
    { id: 'wellness', label: 'Wellness', color: '#7BAE9B', emoji: '🌿' },
    { id: 'personal', label: 'Personal', color: '#B8768A', emoji: '✨' },
    { id: 'study', label: 'Study', color: '#7B9BAE', emoji: '📚' },
    { id: 'errand', label: 'Errand', color: '#AE9B7B', emoji: '🏃' }
  ];

  const PRIORITIES = [
    { id: 'urgent', label: 'Urgent', color: '#E85D5D' },
    { id: 'high', label: 'High', color: '#C9886C' },
    { id: 'medium', label: 'Medium', color: '#B8768A' },
    { id: 'low', label: 'Low', color: '#9B7BAE' }
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  function render(container) {
    container.innerHTML = `
      <div class="section-header-wrap">
        <div class="section-header-text">
          <h2 class="section-title">Tasks</h2>
          <p class="section-subtitle">Stay organized</p>
        </div>
        <button class="icon-btn" id="task-add-btn" title="Add Task">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6v8M6 10h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="tasks-quick-add" id="tasks-quick-add">
        <input type="text" class="form-input tasks-quick-input" id="task-quick-input" placeholder="Quick add — type and press Enter...">
        <button class="btn btn-primary btn-sm" id="task-quick-submit">Add</button>
      </div>

      <div class="tasks-filter-row">
        <button class="filter-chip active" data-filter="all">All</button>
        <button class="filter-chip" data-filter="today">Today</button>
        <button class="filter-chip" data-filter="urgent">Urgent</button>
        <button class="filter-chip" data-filter="incomplete">Active</button>
        <button class="filter-chip" data-filter="completed">Done</button>
      </div>

      <div id="tasks-list-container"></div>
    `;
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  function init() {
    if (_initialized) { refresh(); return; }
    _initialized = true;

    // Quick add
    const quickInput = document.getElementById('task-quick-input');
    const quickSubmit = document.getElementById('task-quick-submit');

    quickInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') _quickAdd(quickInput.value.trim());
    });
    quickSubmit?.addEventListener('click', () => {
      _quickAdd(quickInput?.value.trim() || '');
    });

    // Filter chips
    document.querySelector('.tasks-filter-row')?.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-filter]');
      if (!chip) return;
      document.querySelectorAll('.tasks-filter-row .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      _activeFilter = chip.dataset.filter;
      _renderList();
    });

    // Add button
    document.getElementById('task-add-btn')?.addEventListener('click', () => _showTaskForm());

    _renderList();
    _seedDefaultTasks();
  }

  function refresh() {
    _renderList();
  }

  // ─── Render Task List ─────────────────────────────────────────────────────

  function _renderList() {
    const container = document.getElementById('tasks-list-container');
    if (!container) return;

    const allTasks = SovereignStorage.get('tasks') || [];
    const filtered = _filterTasks(allTasks);
    const grouped = _groupByCategory(filtered);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✅</div>
          <div class="empty-state-title">${_activeFilter === 'completed' ? 'No completed tasks' : 'All clear!'}</div>
          <div class="empty-state-text">${_activeFilter === 'all' ? 'Add your first task above' : 'Nothing matching this filter'}</div>
        </div>
      `;
      return;
    }

    const stats = _getStats(allTasks);
    container.innerHTML = `
      <div class="tasks-stats-row">
        <div class="task-stat">
          <span class="task-stat-num">${stats.total}</span>
          <span class="task-stat-label">Total</span>
        </div>
        <div class="task-stat">
          <span class="task-stat-num">${stats.completed}</span>
          <span class="task-stat-label">Done</span>
        </div>
        <div class="task-stat">
          <span class="task-stat-num">${stats.urgent}</span>
          <span class="task-stat-label">Urgent</span>
        </div>
        <div class="task-stat">
          <span class="task-stat-num ${stats.total > 0 ? '' : 'muted'}">${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
          <span class="task-stat-label">Complete</span>
        </div>
      </div>

      ${Object.entries(grouped).map(([catId, tasks]) => {
        const cat = CATEGORIES.find(c => c.id === catId) || { label: 'Other', color: '#888', emoji: '📌' };
        return `
          <div class="tasks-group">
            <div class="tasks-group-header">
              <span class="tasks-group-emoji">${cat.emoji}</span>
              <span class="tasks-group-label">${cat.label}</span>
              <span class="tasks-group-count">${tasks.filter(t => !t.completed).length} remaining</span>
            </div>
            <div class="task-list" data-category="${catId}">
              ${tasks.map(t => _renderTask(t)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    `;

    _attachListListeners(container);
  }

  function _filterTasks(tasks) {
    const today = SovereignUtils.formatDate(new Date()).slice(0, 10);
    switch (_activeFilter) {
      case 'today':
        return tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate <= today));
      case 'urgent':
        return tasks.filter(t => !t.completed && t.priority === 'urgent');
      case 'incomplete':
        return tasks.filter(t => !t.completed);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  }

  function _groupByCategory(tasks) {
    const groups = {};
    tasks.forEach(t => {
      const cat = t.category || 'personal';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });
    // Sort each group: incomplete first, then by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    Object.values(groups).forEach(arr => {
      arr.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      });
    });
    return groups;
  }

  function _getStats(tasks) {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      urgent: tasks.filter(t => !t.completed && t.priority === 'urgent').length
    };
  }

  function _renderTask(task) {
    const cat = CATEGORIES.find(c => c.id === task.category) || { color: '#888' };
    const prio = PRIORITIES.find(p => p.id === task.priority) || { color: '#888' };
    const isOverdue = task.dueDate && !task.completed && task.dueDate < new Date().toISOString().slice(0, 10);

    return `
      <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
        <div class="task-swipe-bg">
          <span class="task-swipe-label-left">Complete ✓</span>
          <span class="task-swipe-label-right">Delete 🗑️</span>
        </div>
        <div class="task-item-inner">
          <button class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}" aria-label="Toggle complete">
            ${task.completed ? `<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>` : ''}
          </button>

          <div class="task-body" data-task-id="${task.id}">
            <div class="task-title-row">
              <span class="task-title">${SovereignUtils.sanitizeHtml(task.title)}</span>
              ${task.priority && task.priority !== 'medium' ? `<span class="task-priority-dot" style="background: ${prio.color}" title="${prio.label}"></span>` : ''}
            </div>
            ${task.notes ? `<p class="task-notes">${SovereignUtils.sanitizeHtml(SovereignUtils.truncate(task.notes, 80))}</p>` : ''}
            <div class="task-meta-row">
              <span class="task-cat-badge" style="--cat-color: ${cat.color}">${task.category || 'personal'}</span>
              ${task.dueDate ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠️' : '📅'} ${task.dueDate}</span>` : ''}
              ${task.recurring ? `<span class="task-recurring">🔁 ${task.recurring}</span>` : ''}
            </div>
          </div>

          <button class="icon-btn task-more-btn" data-task-id="${task.id}">⋮</button>
        </div>
      </div>
    `;
  }

  // ─── Listeners ────────────────────────────────────────────────────────────

  function _attachListListeners(container) {
    container.addEventListener('click', (e) => {
      // Toggle complete
      const checkbox = e.target.closest('.task-checkbox');
      if (checkbox) {
        _toggleComplete(checkbox.dataset.taskId);
        return;
      }

      // More options
      const moreBtn = e.target.closest('.task-more-btn');
      if (moreBtn) {
        _showTaskOptions(moreBtn.dataset.taskId);
        return;
      }

      // Edit on body tap
      const body = e.target.closest('.task-body');
      if (body) {
        _showTaskOptions(body.dataset.taskId);
        return;
      }
    });

    // Touch swipe-to-complete
    container.addEventListener('touchstart', _handleTouchStart, { passive: true });
    container.addEventListener('touchmove', _handleTouchMove, { passive: false });
    container.addEventListener('touchend', _handleTouchEnd);
  }

  function _handleTouchStart(e) {
    const item = e.target.closest('.task-item');
    if (!item) return;
    _swipeState = {
      id: item.dataset.taskId,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      element: item,
      dx: 0
    };
  }

  function _handleTouchMove(e) {
    if (!_swipeState) return;
    const dx = e.touches[0].clientX - _swipeState.startX;
    const dy = e.touches[0].clientY - _swipeState.startY;
    if (Math.abs(dy) > Math.abs(dx)) { _swipeState = null; return; }
    e.preventDefault();
    _swipeState.dx = dx;
    const inner = _swipeState.element.querySelector('.task-item-inner');
    if (inner) {
      const clamped = Math.max(-80, Math.min(80, dx));
      inner.style.transform = `translateX(${clamped}px)`;
    }
  }

  function _handleTouchEnd() {
    if (!_swipeState) return;
    const { id, element, dx } = _swipeState;
    const inner = element.querySelector('.task-item-inner');
    if (inner) inner.style.transform = '';

    if (dx > 60) {
      _toggleComplete(id);
    } else if (dx < -60) {
      _deleteTask(id);
    }
    _swipeState = null;
  }

  // ─── Task Operations ─────────────────────────────────────────────────────

  function _quickAdd(title) {
    if (!title) return;
    const task = {
      id: SovereignUtils.generateId(),
      title,
      category: 'personal',
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString()
    };
    SovereignStorage.update('tasks', (prev = []) => [task, ...(prev || [])]);
    const input = document.getElementById('task-quick-input');
    if (input) input.value = '';
    SovereignUtils.toast('Task added', 'success');
    _renderList();
  }

  function _toggleComplete(id) {
    SovereignStorage.update('tasks', (prev = []) =>
      (prev || []).map(t => t.id === id ? {
        ...t,
        completed: !t.completed,
        completedAt: !t.completed ? new Date().toISOString() : null
      } : t)
    );
    _renderList();

    // If completing — play a satisfying sound
    const tasks = SovereignStorage.get('tasks') || [];
    const task = tasks.find(t => t.id === id);
    if (task?.completed && window.SovereignReminders) {
      SovereignReminders.playSound('crystal-bell');
    }
  }

  function _deleteTask(id) {
    SovereignStorage.update('tasks', (prev = []) => (prev || []).filter(t => t.id !== id));
    SovereignUtils.toast('Task deleted', 'success');
    _renderList();
  }

  function _showTaskOptions(id) {
    const tasks = SovereignStorage.get('tasks') || [];
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    SovereignUtils.showModal(
      task.title,
      `<div class="task-options-list">
        <button class="task-option-btn" id="opt-complete">${task.completed ? '↩️ Mark Incomplete' : '✅ Mark Complete'}</button>
        <button class="task-option-btn" id="opt-edit">✏️ Edit Task</button>
        <button class="task-option-btn danger" id="opt-delete">🗑️ Delete</button>
      </div>`,
      []
    );

    setTimeout(() => {
      document.getElementById('opt-complete')?.addEventListener('click', () => {
        SovereignUtils.closeModal();
        _toggleComplete(id);
      });
      document.getElementById('opt-edit')?.addEventListener('click', () => {
        SovereignUtils.closeModal();
        _showTaskForm(task);
      });
      document.getElementById('opt-delete')?.addEventListener('click', () => {
        SovereignUtils.closeModal();
        _deleteTask(id);
      });
    }, 100);
  }

  function _showTaskForm(existing = null) {
    const isEdit = !!existing;
    const today = new Date().toISOString().slice(0, 10);

    SovereignUtils.showModal(
      isEdit ? 'Edit Task' : 'New Task',
      `
        <div class="form-group">
          <label class="form-label">Task</label>
          <input type="text" class="form-input" id="tf-title" value="${isEdit ? SovereignUtils.sanitizeHtml(existing.title) : ''}" placeholder="What needs to be done?">
        </div>
        <div class="form-group">
          <label class="form-label">Notes (optional)</label>
          <textarea class="form-input" id="tf-notes" rows="2" placeholder="Additional details...">${isEdit ? SovereignUtils.sanitizeHtml(existing.notes || '') : ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-input" id="tf-cat">
              ${CATEGORIES.map(c => `<option value="${c.id}" ${isEdit && existing.category === c.id ? 'selected' : ''}>${c.emoji} ${c.label}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select class="form-input" id="tf-priority">
              ${PRIORITIES.map(p => `<option value="${p.id}" ${isEdit && existing.priority === p.id ? 'selected' : ''}>${p.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" class="form-input" id="tf-due" value="${isEdit ? existing.dueDate || '' : today}" min="${today}">
          </div>
          <div class="form-group">
            <label class="form-label">Recurring</label>
            <select class="form-input" id="tf-recurring">
              <option value="" ${isEdit && !existing.recurring ? 'selected' : ''}>None</option>
              <option value="daily" ${isEdit && existing.recurring === 'daily' ? 'selected' : ''}>Daily</option>
              <option value="weekly" ${isEdit && existing.recurring === 'weekly' ? 'selected' : ''}>Weekly</option>
              <option value="monthly" ${isEdit && existing.recurring === 'monthly' ? 'selected' : ''}>Monthly</option>
            </select>
          </div>
        </div>
      `,
      [
        { label: 'Cancel', action: () => SovereignUtils.closeModal() },
        {
          label: isEdit ? 'Save' : 'Add Task',
          primary: true,
          action: () => {
            const title = document.getElementById('tf-title')?.value.trim();
            if (!title) { SovereignUtils.toast('Enter a task title', 'error'); return; }

            const task = {
              id: isEdit ? existing.id : SovereignUtils.generateId(),
              title,
              notes: document.getElementById('tf-notes')?.value.trim() || '',
              category: document.getElementById('tf-cat')?.value || 'personal',
              priority: document.getElementById('tf-priority')?.value || 'medium',
              dueDate: document.getElementById('tf-due')?.value || '',
              recurring: document.getElementById('tf-recurring')?.value || '',
              completed: isEdit ? existing.completed : false,
              createdAt: isEdit ? existing.createdAt : new Date().toISOString()
            };

            SovereignStorage.update('tasks', (prev = []) => {
              if (isEdit) return (prev || []).map(t => t.id === task.id ? task : t);
              return [task, ...(prev || [])];
            });

            if (!SovereignStorage.get('tasks')) {
              SovereignStorage.set('tasks', [task]);
            }

            SovereignUtils.closeModal();
            SovereignUtils.toast(isEdit ? 'Task updated' : 'Task added', 'success');
            _renderList();
          }
        }
      ]
    );

    setTimeout(() => document.getElementById('tf-title')?.focus(), 100);
  }

  // ─── Seed Default Tasks ───────────────────────────────────────────────────

  function _seedDefaultTasks() {
    if (SovereignStorage.get('tasks_seeded')) return;
    const today = new Date().toISOString().slice(0, 10);
    SovereignStorage.set('tasks', [
      { id: 'dt1', title: 'Complete Week 1 — Day 1 coding lesson', category: 'coding', priority: 'high', completed: false, createdAt: new Date().toISOString(), dueDate: today },
      { id: 'dt2', title: 'Morning skincare routine', category: 'wellness', priority: 'medium', completed: false, recurring: 'daily', createdAt: new Date().toISOString() },
      { id: 'dt3', title: 'Prepare IELTS Writing lesson', category: 'work', priority: 'high', completed: false, createdAt: new Date().toISOString(), dueDate: today },
      { id: 'dt4', title: 'Drink 8 glasses of water', category: 'wellness', priority: 'medium', completed: false, recurring: 'daily', createdAt: new Date().toISOString() },
      { id: 'dt5', title: 'Journal reflection', category: 'personal', priority: 'low', completed: false, recurring: 'daily', createdAt: new Date().toISOString() }
    ]);
    SovereignStorage.set('tasks_seeded', true);
    _renderList();
  }

  return { render, init, refresh };

})();
