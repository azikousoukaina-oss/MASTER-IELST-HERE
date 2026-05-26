'use strict';

window.WorkSection = (() => {

  let _initialized = false;
  let _activeTab = 'classes';

  const IELTS_SKILLS = ['Reading', 'Writing', 'Listening', 'Speaking'];
  const BAND_LEVELS = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9'];

  // ─── Render ───────────────────────────────────────────────────────────────

  function render(container) {
    container.innerHTML = `
      <div class="section-header-wrap">
        <div class="section-header-text">
          <h2 class="section-title">Work</h2>
          <p class="section-subtitle">IELTS Workspace</p>
        </div>
        <button class="icon-btn" id="work-add-btn" title="Add">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6v8M6 10h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="tab-bar" id="work-tabs">
        <button class="tab-btn active" data-tab="classes">Classes</button>
        <button class="tab-btn" data-tab="students">Students</button>
        <button class="tab-btn" data-tab="lessons">Lesson Planner</button>
        <button class="tab-btn" data-tab="resources">Resources</button>
      </div>

      <div id="work-content" class="work-content"></div>
    `;
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  function init() {
    if (_initialized) { refresh(); return; }
    _initialized = true;

    document.getElementById('work-tabs')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      document.querySelectorAll('#work-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeTab = btn.dataset.tab;
      _renderTab();
    });

    document.getElementById('work-add-btn')?.addEventListener('click', () => {
      _handleAdd();
    });

    _renderTab();
  }

  function refresh() {
    _renderTab();
  }

  function _renderTab() {
    const content = document.getElementById('work-content');
    if (!content) return;

    const tabs = {
      classes: _renderClassesTab,
      students: _renderStudentsTab,
      lessons: _renderLessonsTab,
      resources: _renderResourcesTab
    };

    content.innerHTML = '';
    (tabs[_activeTab] || tabs.classes)();

    _attachTabListeners();
  }

  // ─── Classes Tab ──────────────────────────────────────────────────────────

  function _renderClassesTab() {
    const content = document.getElementById('work-content');
    const classes = SovereignStorage.get('work_classes') || _defaultClasses();

    const today = new Date();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];

    const todayClasses = classes.filter(c => c.days && c.days.includes(dayName));

    content.innerHTML = `
      <div class="work-overview-row">
        <div class="work-stat-card">
          <div class="work-stat-num">${classes.length}</div>
          <div class="work-stat-label">Active Classes</div>
        </div>
        <div class="work-stat-card">
          <div class="work-stat-num">${_getTotalStudents(classes)}</div>
          <div class="work-stat-label">Total Students</div>
        </div>
        <div class="work-stat-card">
          <div class="work-stat-num">${todayClasses.length}</div>
          <div class="work-stat-label">Today</div>
        </div>
      </div>

      ${todayClasses.length > 0 ? `
        <div class="work-section-label">Today — ${dayName}</div>
        <div class="work-class-list">
          ${todayClasses.map(c => _renderClassCard(c, true)).join('')}
        </div>
      ` : ''}

      <div class="work-section-label">All Classes</div>
      <div class="work-class-list">
        ${classes.length > 0 ? classes.map(c => _renderClassCard(c, false)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">📖</div>
            <div class="empty-state-title">No classes yet</div>
            <div class="empty-state-text">Tap + to add your first IELTS class</div>
          </div>
        `}
      </div>
    `;
  }

  function _renderClassCard(cls, isToday) {
    const skillColor = { Reading: '#C9886C', Writing: '#B8768A', Listening: '#9B7BAE', Speaking: '#7BAE9B', General: '#AE9B7B' };
    const color = skillColor[cls.skill] || '#C9886C';
    return `
      <div class="work-class-card ${isToday ? 'today' : ''}" data-class-id="${cls.id}">
        <div class="work-class-color-bar" style="background: ${color}"></div>
        <div class="work-class-body">
          <div class="work-class-header">
            <span class="work-class-name">${SovereignUtils.sanitizeHtml(cls.name)}</span>
            <span class="work-class-skill tag-chip" style="--chip-color: ${color}">${cls.skill}</span>
          </div>
          <div class="work-class-meta">
            <span>🕐 ${cls.time || 'TBD'}</span>
            <span>👥 ${cls.studentCount || 0} students</span>
            <span>📅 ${(cls.days || []).join(', ')}</span>
            <span>🎯 Band ${cls.targetBand || '?'}</span>
          </div>
          ${cls.notes ? `<p class="work-class-notes">${SovereignUtils.sanitizeHtml(cls.notes)}</p>` : ''}
        </div>
        <div class="work-class-actions">
          <button class="icon-btn work-edit-class" data-id="${cls.id}" title="Edit">✏️</button>
          <button class="icon-btn work-delete-class" data-id="${cls.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }

  function _defaultClasses() {
    return [
      { id: 'cls1', name: 'IELTS Academic - Morning', skill: 'Writing', time: '08:30', days: ['Monday', 'Wednesday', 'Friday'], studentCount: 6, targetBand: '7', notes: 'Focused on Task 2 essays' },
      { id: 'cls2', name: 'IELTS General - Evening', skill: 'Speaking', time: '18:00', days: ['Tuesday', 'Thursday'], studentCount: 4, targetBand: '6.5', notes: 'Mock interview practice' }
    ];
  }

  function _getTotalStudents(classes) {
    return classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  }

  // ─── Students Tab ─────────────────────────────────────────────────────────

  function _renderStudentsTab() {
    const content = document.getElementById('work-content');
    const students = SovereignStorage.get('work_students') || _defaultStudents();

    content.innerHTML = `
      <div class="work-search-row">
        <input type="text" class="form-input" id="student-search" placeholder="Search students..." />
      </div>
      <div class="work-student-list" id="student-list">
        ${students.length > 0 ? students.map(s => _renderStudentCard(s)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">👩‍🎓</div>
            <div class="empty-state-title">No students yet</div>
            <div class="empty-state-text">Add your first student to get started</div>
          </div>
        `}
      </div>
    `;

    document.getElementById('student-search')?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const list = document.getElementById('student-list');
      if (!list) return;
      const allStudents = SovereignStorage.get('work_students') || _defaultStudents();
      const filtered = allStudents.filter(s =>
        s.name.toLowerCase().includes(query) ||
        (s.country || '').toLowerCase().includes(query)
      );
      list.innerHTML = filtered.map(s => _renderStudentCard(s)).join('') || '<p class="empty-text">No results found</p>';
    });
  }

  function _renderStudentCard(s) {
    const initials = SovereignUtils.getInitials(s.name);
    const bandColors = { '9': '#C9886C', '8.5': '#C9886C', '8': '#B8768A', '7.5': '#B8768A', '7': '#9B7BAE', '6.5': '#7BAE9B', '6': '#AE9B7B', '5.5': '#888', '5': '#888' };
    const bandColor = bandColors[String(s.currentBand)] || '#888';
    return `
      <div class="work-student-card" data-student-id="${s.id}">
        <div class="work-student-avatar" style="background: ${bandColor}">${initials}</div>
        <div class="work-student-info">
          <span class="work-student-name">${SovereignUtils.sanitizeHtml(s.name)}</span>
          <span class="work-student-meta">
            ${s.country ? `🌍 ${s.country} · ` : ''}
            Band ${s.currentBand || '?'} → ${s.targetBand || '?'}
            ${s.purpose ? ` · ${s.purpose}` : ''}
          </span>
          ${s.notes ? `<span class="work-student-notes">${SovereignUtils.sanitizeHtml(s.notes)}</span>` : ''}
        </div>
        <div class="work-student-actions">
          <button class="btn btn-ghost btn-sm work-student-lesson" data-id="${s.id}">Plan Lesson</button>
          <button class="icon-btn work-edit-student" data-id="${s.id}">✏️</button>
        </div>
      </div>
    `;
  }

  function _defaultStudents() {
    return [
      { id: 's1', name: 'Nguyen Thi Lan', country: 'Vietnam', currentBand: '6', targetBand: '7', purpose: 'Study abroad', notes: 'Weak in writing coherence' },
      { id: 's2', name: 'Tran Minh Duc', country: 'Vietnam', currentBand: '5.5', targetBand: '6.5', purpose: 'UK work visa', notes: 'Good listener, needs speaking confidence' },
      { id: 's3', name: 'Le Thu Huong', country: 'Vietnam', currentBand: '7', targetBand: '7.5', purpose: 'Academic research', notes: 'Strong reader, work on paraphrasing' }
    ];
  }

  // ─── Lesson Planner Tab ───────────────────────────────────────────────────

  function _renderLessonsTab() {
    const content = document.getElementById('work-content');
    const lessons = SovereignStorage.get('work_lessons') || [];

    content.innerHTML = `
      <div class="work-lesson-controls">
        <button class="btn btn-primary btn-sm" id="work-new-lesson">+ New Lesson Plan</button>
        <button class="btn btn-ghost btn-sm" id="work-ai-lesson">✨ AI Generate</button>
      </div>

      ${lessons.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-title">No lesson plans yet</div>
          <div class="empty-state-text">Create structured lesson plans for your IELTS students</div>
        </div>
      ` : `
        <div class="work-lesson-list">
          ${lessons.map(l => _renderLessonCard(l)).join('')}
        </div>
      `}
    `;

    document.getElementById('work-new-lesson')?.addEventListener('click', () => _showLessonForm());
    document.getElementById('work-ai-lesson')?.addEventListener('click', () => _generateAILesson());
  }

  function _renderLessonCard(lesson) {
    return `
      <div class="work-lesson-card" data-lesson-id="${lesson.id}">
        <div class="work-lesson-header">
          <div>
            <h4 class="work-lesson-title">${SovereignUtils.sanitizeHtml(lesson.title)}</h4>
            <span class="work-lesson-meta">${lesson.skill} · Band ${lesson.targetBand} · ${lesson.duration || 60}min</span>
          </div>
          <div class="work-lesson-actions">
            <button class="btn btn-ghost btn-sm work-view-lesson" data-id="${lesson.id}">View</button>
            <button class="icon-btn work-delete-lesson" data-id="${lesson.id}">🗑️</button>
          </div>
        </div>
        ${lesson.objectives ? `
          <div class="work-lesson-objectives">
            <strong>Objectives:</strong> ${SovereignUtils.sanitizeHtml(lesson.objectives)}
          </div>
        ` : ''}
      </div>
    `;
  }

  // ─── Resources Tab ────────────────────────────────────────────────────────

  function _renderResourcesTab() {
    const content = document.getElementById('work-content');
    const resources = SovereignStorage.get('work_resources') || _defaultResources();

    const grouped = {};
    resources.forEach(r => {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    });

    content.innerHTML = `
      <div class="work-resource-add">
        <button class="btn btn-primary btn-sm" id="work-add-resource">+ Add Resource</button>
      </div>
      ${Object.entries(grouped).map(([cat, items]) => `
        <div class="work-resource-group">
          <h4 class="work-resource-cat">${cat}</h4>
          <div class="work-resource-list">
            ${items.map(r => `
              <div class="work-resource-item" data-res-id="${r.id}">
                <span class="work-resource-icon">${_resourceIcon(r.type)}</span>
                <div class="work-resource-info">
                  <span class="work-resource-name">${SovereignUtils.sanitizeHtml(r.name)}</span>
                  ${r.url ? `<a href="${SovereignUtils.sanitizeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="work-resource-link">Open →</a>` : ''}
                  ${r.notes ? `<span class="work-resource-note">${SovereignUtils.sanitizeHtml(r.notes)}</span>` : ''}
                </div>
                <button class="icon-btn work-delete-resource" data-id="${r.id}">🗑️</button>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;

    document.getElementById('work-add-resource')?.addEventListener('click', () => _showResourceForm());
  }

  function _resourceIcon(type) {
    const icons = { link: '🔗', pdf: '📄', video: '🎬', book: '📚', audio: '🎧', note: '📝' };
    return icons[type] || '📎';
  }

  function _defaultResources() {
    return [
      { id: 'r1', name: 'Cambridge IELTS 18', type: 'book', category: 'Practice Tests', notes: 'Official practice materials' },
      { id: 'r2', name: 'IELTS Liz', type: 'link', category: 'Websites', url: 'https://ieltsliz.com', notes: 'Excellent free tips' },
      { id: 'r3', name: 'British Council IELTS', type: 'link', category: 'Websites', url: 'https://ielts.britishcouncil.org', notes: 'Official prep resources' },
      { id: 'r4', name: 'IELTS Simon Writing', type: 'link', category: 'Writing', url: 'https://ielts-simon.com', notes: 'Simon\'s band 9 essays' }
    ];
  }

  // ─── Add/Edit Modals ─────────────────────────────────────────────────────

  function _handleAdd() {
    const tabActions = {
      classes: _showClassForm,
      students: _showStudentForm,
      lessons: _showLessonForm,
      resources: _showResourceForm
    };
    (tabActions[_activeTab] || _showClassForm)();
  }

  function _showClassForm(existing = null) {
    const isEdit = !!existing;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    SovereignUtils.showModal(
      isEdit ? 'Edit Class' : 'New Class',
      `
        <div class="form-group">
          <label class="form-label">Class Name</label>
          <input type="text" class="form-input" id="cf-name" value="${isEdit ? SovereignUtils.sanitizeHtml(existing.name) : ''}" placeholder="IELTS Academic - Morning">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Skill Focus</label>
            <select class="form-input" id="cf-skill">
              ${IELTS_SKILLS.map(s => `<option value="${s}" ${isEdit && existing.skill === s ? 'selected' : ''}>${s}</option>`).join('')}
              <option value="General" ${isEdit && existing.skill === 'General' ? 'selected' : ''}>General</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Time</label>
            <input type="time" class="form-input" id="cf-time" value="${isEdit ? existing.time || '' : ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Days</label>
          <div class="work-day-picker">
            ${days.map(d => `
              <label class="work-day-btn ${isEdit && existing.days?.includes(d) ? 'selected' : ''}">
                <input type="checkbox" value="${d}" ${isEdit && existing.days?.includes(d) ? 'checked' : ''}> ${d.slice(0, 3)}
              </label>
            `).join('')}
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Students</label>
            <input type="number" class="form-input" id="cf-count" value="${isEdit ? existing.studentCount || 0 : 0}" min="0" max="50">
          </div>
          <div class="form-group">
            <label class="form-label">Target Band</label>
            <select class="form-input" id="cf-band">
              ${BAND_LEVELS.map(b => `<option value="${b}" ${isEdit && existing.targetBand === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-input" id="cf-notes" rows="2" placeholder="Class notes...">${isEdit ? SovereignUtils.sanitizeHtml(existing.notes || '') : ''}</textarea>
        </div>
      `,
      [
        { label: 'Cancel', action: () => SovereignUtils.closeModal() },
        {
          label: isEdit ? 'Save' : 'Add Class',
          primary: true,
          action: () => {
            const name = document.getElementById('cf-name')?.value.trim();
            if (!name) { SovereignUtils.toast('Please enter a class name', 'error'); return; }

            const selectedDays = [...document.querySelectorAll('.work-day-picker input:checked')].map(i => i.value);
            const cls = {
              id: isEdit ? existing.id : SovereignUtils.generateId(),
              name,
              skill: document.getElementById('cf-skill')?.value || 'General',
              time: document.getElementById('cf-time')?.value || '',
              days: selectedDays,
              studentCount: parseInt(document.getElementById('cf-count')?.value || '0'),
              targetBand: document.getElementById('cf-band')?.value || '7',
              notes: document.getElementById('cf-notes')?.value.trim() || ''
            };

            SovereignStorage.update('work_classes', (prev = []) => {
              if (isEdit) return prev.map(c => c.id === cls.id ? cls : c);
              return [...prev, cls];
            });

            if (!SovereignStorage.get('work_classes')) {
              SovereignStorage.set('work_classes', [cls]);
            }

            SovereignUtils.closeModal();
            SovereignUtils.toast(isEdit ? 'Class updated' : 'Class added', 'success');
            _renderTab();
          }
        }
      ]
    );
  }

  function _showStudentForm(existing = null) {
    const isEdit = !!existing;

    SovereignUtils.showModal(
      isEdit ? 'Edit Student' : 'New Student',
      `
        <div class="form-group">
          <label class="form-label">Student Name</label>
          <input type="text" class="form-input" id="sf-name" value="${isEdit ? SovereignUtils.sanitizeHtml(existing.name) : ''}" placeholder="Full name">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Country</label>
            <input type="text" class="form-input" id="sf-country" value="${isEdit ? SovereignUtils.sanitizeHtml(existing.country || '') : ''}" placeholder="Vietnam">
          </div>
          <div class="form-group">
            <label class="form-label">Purpose</label>
            <input type="text" class="form-input" id="sf-purpose" value="${isEdit ? SovereignUtils.sanitizeHtml(existing.purpose || '') : ''}" placeholder="Study abroad, visa...">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Current Band</label>
            <select class="form-input" id="sf-current">
              ${BAND_LEVELS.map(b => `<option value="${b}" ${isEdit && existing.currentBand === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Target Band</label>
            <select class="form-input" id="sf-target">
              ${BAND_LEVELS.map(b => `<option value="${b}" ${isEdit && existing.targetBand === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-input" id="sf-notes" rows="2" placeholder="Strengths, weaknesses, focus areas...">${isEdit ? SovereignUtils.sanitizeHtml(existing.notes || '') : ''}</textarea>
        </div>
      `,
      [
        { label: 'Cancel', action: () => SovereignUtils.closeModal() },
        {
          label: isEdit ? 'Save' : 'Add Student',
          primary: true,
          action: () => {
            const name = document.getElementById('sf-name')?.value.trim();
            if (!name) { SovereignUtils.toast('Please enter a name', 'error'); return; }

            const student = {
              id: isEdit ? existing.id : SovereignUtils.generateId(),
              name,
              country: document.getElementById('sf-country')?.value.trim() || '',
              purpose: document.getElementById('sf-purpose')?.value.trim() || '',
              currentBand: document.getElementById('sf-current')?.value || '5',
              targetBand: document.getElementById('sf-target')?.value || '7',
              notes: document.getElementById('sf-notes')?.value.trim() || ''
            };

            SovereignStorage.update('work_students', (prev = []) => {
              if (isEdit) return prev.map(s => s.id === student.id ? student : s);
              return [...(prev || []), student];
            });

            if (!SovereignStorage.get('work_students')) {
              SovereignStorage.set('work_students', [student]);
            }

            SovereignUtils.closeModal();
            SovereignUtils.toast(isEdit ? 'Student updated' : 'Student added', 'success');
            _renderTab();
          }
        }
      ]
    );
  }

  function _showLessonForm(existing = null) {
    const isEdit = !!existing;

    SovereignUtils.showModal(
      isEdit ? 'Edit Lesson' : 'New Lesson Plan',
      `
        <div class="form-group">
          <label class="form-label">Lesson Title</label>
          <input type="text" class="form-input" id="lf-title" value="${isEdit ? SovereignUtils.sanitizeHtml(existing.title) : ''}" placeholder="e.g., Writing Task 2 — Opinion Essays">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Skill</label>
            <select class="form-input" id="lf-skill">
              ${IELTS_SKILLS.map(s => `<option value="${s}" ${isEdit && existing.skill === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Target Band</label>
            <select class="form-input" id="lf-band">
              ${BAND_LEVELS.map(b => `<option value="${b}" ${isEdit && existing.targetBand === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Duration (min)</label>
            <input type="number" class="form-input" id="lf-duration" value="${isEdit ? existing.duration || 60 : 60}" min="15" max="180" step="15">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Learning Objectives</label>
          <textarea class="form-input" id="lf-objectives" rows="2" placeholder="Students will be able to...">${isEdit ? SovereignUtils.sanitizeHtml(existing.objectives || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Lesson Plan</label>
          <textarea class="form-input" id="lf-plan" rows="6" placeholder="Introduction, main activities, practice, review...">${isEdit ? SovereignUtils.sanitizeHtml(existing.plan || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Homework</label>
          <input type="text" class="form-input" id="lf-hw" value="${isEdit ? SovereignUtils.sanitizeHtml(existing.homework || '') : ''}" placeholder="Homework assignment">
        </div>
      `,
      [
        { label: 'Cancel', action: () => SovereignUtils.closeModal() },
        {
          label: isEdit ? 'Save' : 'Create Lesson',
          primary: true,
          action: () => {
            const title = document.getElementById('lf-title')?.value.trim();
            if (!title) { SovereignUtils.toast('Please enter a title', 'error'); return; }

            const lesson = {
              id: isEdit ? existing.id : SovereignUtils.generateId(),
              title,
              skill: document.getElementById('lf-skill')?.value || 'Writing',
              targetBand: document.getElementById('lf-band')?.value || '7',
              duration: parseInt(document.getElementById('lf-duration')?.value || '60'),
              objectives: document.getElementById('lf-objectives')?.value.trim() || '',
              plan: document.getElementById('lf-plan')?.value.trim() || '',
              homework: document.getElementById('lf-hw')?.value.trim() || '',
              createdAt: new Date().toISOString()
            };

            SovereignStorage.update('work_lessons', (prev = []) => {
              if (isEdit) return prev.map(l => l.id === lesson.id ? lesson : l);
              return [...(prev || []), lesson];
            });

            if (!SovereignStorage.get('work_lessons')) {
              SovereignStorage.set('work_lessons', [lesson]);
            }

            SovereignUtils.closeModal();
            SovereignUtils.toast(isEdit ? 'Lesson updated' : 'Lesson plan created', 'success');
            _renderTab();
          }
        }
      ]
    );
  }

  function _showResourceForm() {
    SovereignUtils.showModal(
      'Add Resource',
      `
        <div class="form-group">
          <label class="form-label">Resource Name</label>
          <input type="text" class="form-input" id="rf-name" placeholder="Cambridge IELTS 18">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Type</label>
            <select class="form-input" id="rf-type">
              <option value="link">Link</option>
              <option value="book">Book</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="audio">Audio</option>
              <option value="note">Note</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <input type="text" class="form-input" id="rf-cat" placeholder="Writing, Speaking, Practice...">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">URL (optional)</label>
          <input type="url" class="form-input" id="rf-url" placeholder="https://...">
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-input" id="rf-notes" rows="2" placeholder="Notes about this resource..."></textarea>
        </div>
      `,
      [
        { label: 'Cancel', action: () => SovereignUtils.closeModal() },
        {
          label: 'Add Resource',
          primary: true,
          action: () => {
            const name = document.getElementById('rf-name')?.value.trim();
            if (!name) { SovereignUtils.toast('Please enter a name', 'error'); return; }

            const resource = {
              id: SovereignUtils.generateId(),
              name,
              type: document.getElementById('rf-type')?.value || 'link',
              category: document.getElementById('rf-cat')?.value.trim() || 'General',
              url: document.getElementById('rf-url')?.value.trim() || '',
              notes: document.getElementById('rf-notes')?.value.trim() || ''
            };

            SovereignStorage.update('work_resources', (prev = []) => [...(prev || []), resource]);
            if (!SovereignStorage.get('work_resources')) {
              SovereignStorage.set('work_resources', [resource]);
            }

            SovereignUtils.closeModal();
            SovereignUtils.toast('Resource added', 'success');
            _renderTab();
          }
        }
      ]
    );
  }

  async function _generateAILesson() {
    if (!ClaudeAI.isReady()) {
      SovereignUtils.toast('Add your Claude API key in Settings to use AI features', 'info');
      return;
    }

    SovereignUtils.toast('Generating lesson plan...', 'info');
    try {
      const result = await ClaudeAI.suggestIELTSLesson({
        skill: 'Writing',
        targetBand: '7',
        duration: 60
      });

      if (result && result.title) {
        SovereignStorage.update('work_lessons', (prev = []) => [
          ...(prev || []),
          { ...result, id: SovereignUtils.generateId(), createdAt: new Date().toISOString() }
        ]);
        SovereignUtils.toast('AI lesson plan created!', 'success');
        _activeTab = 'lessons';
        document.querySelectorAll('#work-tabs .tab-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.tab === 'lessons');
        });
        _renderTab();
      }
    } catch (err) {
      SovereignUtils.toast('Could not generate lesson. Try again.', 'error');
    }
  }

  // ─── Tab Listeners ────────────────────────────────────────────────────────

  function _attachTabListeners() {
    const content = document.getElementById('work-content');
    if (!content) return;

    content.addEventListener('click', (e) => {
      // Edit class
      const editClass = e.target.closest('.work-edit-class');
      if (editClass) {
        const id = editClass.dataset.id;
        const classes = SovereignStorage.get('work_classes') || _defaultClasses();
        const cls = classes.find(c => c.id === id);
        if (cls) _showClassForm(cls);
        return;
      }

      // Delete class
      const deleteClass = e.target.closest('.work-delete-class');
      if (deleteClass) {
        const id = deleteClass.dataset.id;
        SovereignStorage.update('work_classes', (prev = []) => (prev || []).filter(c => c.id !== id));
        SovereignUtils.toast('Class deleted', 'success');
        _renderTab();
        return;
      }

      // Edit student
      const editStudent = e.target.closest('.work-edit-student');
      if (editStudent) {
        const id = editStudent.dataset.id;
        const students = SovereignStorage.get('work_students') || _defaultStudents();
        const student = students.find(s => s.id === id);
        if (student) _showStudentForm(student);
        return;
      }

      // Plan lesson for student
      const planLesson = e.target.closest('.work-student-lesson');
      if (planLesson) {
        _activeTab = 'lessons';
        document.querySelectorAll('#work-tabs .tab-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.tab === 'lessons');
        });
        _renderTab();
        return;
      }

      // View lesson
      const viewLesson = e.target.closest('.work-view-lesson');
      if (viewLesson) {
        const id = viewLesson.dataset.id;
        const lessons = SovereignStorage.get('work_lessons') || [];
        const lesson = lessons.find(l => l.id === id);
        if (lesson) _showLessonDetail(lesson);
        return;
      }

      // Delete lesson
      const deleteLesson = e.target.closest('.work-delete-lesson');
      if (deleteLesson) {
        const id = deleteLesson.dataset.id;
        SovereignStorage.update('work_lessons', (prev = []) => (prev || []).filter(l => l.id !== id));
        SovereignUtils.toast('Lesson deleted', 'success');
        _renderTab();
        return;
      }

      // Delete resource
      const deleteRes = e.target.closest('.work-delete-resource');
      if (deleteRes) {
        const id = deleteRes.dataset.id;
        SovereignStorage.update('work_resources', (prev = []) => (prev || []).filter(r => r.id !== id));
        SovereignUtils.toast('Resource removed', 'success');
        _renderTab();
        return;
      }
    });
  }

  function _showLessonDetail(lesson) {
    SovereignUtils.showModal(
      lesson.title,
      `
        <div class="lesson-detail">
          <div class="lesson-detail-meta">
            <span class="tag-chip">${lesson.skill}</span>
            <span>Band ${lesson.targetBand}</span>
            <span>${lesson.duration || 60} min</span>
          </div>
          ${lesson.objectives ? `<div class="lesson-section"><strong>Objectives</strong><p>${SovereignUtils.sanitizeHtml(lesson.objectives)}</p></div>` : ''}
          ${lesson.plan ? `<div class="lesson-section"><strong>Lesson Plan</strong><p style="white-space:pre-wrap">${SovereignUtils.sanitizeHtml(lesson.plan)}</p></div>` : ''}
          ${lesson.homework ? `<div class="lesson-section"><strong>Homework</strong><p>${SovereignUtils.sanitizeHtml(lesson.homework)}</p></div>` : ''}
        </div>
      `,
      [
        { label: 'Edit', action: () => { SovereignUtils.closeModal(); _showLessonForm(lesson); } },
        { label: 'Close', action: () => SovereignUtils.closeModal() }
      ]
    );
  }

  return { render, init, refresh };

})();
