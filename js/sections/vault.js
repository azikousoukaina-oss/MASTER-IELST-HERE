'use strict';

window.VaultSection = (() => {

  let _initialized = false;
  let _activeFolder = null;
  let _searchQuery = '';

  const DEFAULT_FOLDERS = [
    { id: 'notes', name: 'Notes', icon: '📝', color: '#C9886C' },
    { id: 'code', name: 'Code Snippets', icon: '💻', color: '#9B7BAE' },
    { id: 'ielts', name: 'IELTS Resources', icon: '📚', color: '#B8768A' },
    { id: 'links', name: 'Saved Links', icon: '🔗', color: '#7B9BAE' },
    { id: 'recipes', name: 'Recipes & Wellness', icon: '🌿', color: '#7BAE9B' },
    { id: 'docs', name: 'Documents', icon: '📄', color: '#AE9B7B' }
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  function render(container) {
    container.innerHTML = `
      <div class="section-header-wrap">
        <div class="section-header-text">
          <h2 class="section-title">Vault</h2>
          <p class="section-subtitle">Your knowledge base</p>
        </div>
        <button class="icon-btn" id="vault-add-btn" title="Add">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6v8M6 10h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div id="vault-main"></div>
    `;
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  function init() {
    if (_initialized) { refresh(); return; }
    _initialized = true;

    document.getElementById('vault-add-btn')?.addEventListener('click', () => {
      if (_activeFolder) _showAddItemModal();
      else _showAddFolderModal();
    });

    _renderFolders();
  }

  function refresh() {
    if (_activeFolder) _renderItems(_activeFolder);
    else _renderFolders();
  }

  // ─── Folders View ─────────────────────────────────────────────────────────

  function _renderFolders() {
    const main = document.getElementById('vault-main');
    if (!main) return;
    _activeFolder = null;

    const customFolders = SovereignStorage.get('vault_folders') || [];
    const allFolders = [...DEFAULT_FOLDERS, ...customFolders];
    const allItems = SovereignStorage.get('vault_items') || [];

    const getCount = (folderId) => allItems.filter(i => i.folder === folderId).length;

    main.innerHTML = `
      <div class="vault-search-row">
        <input type="text" class="form-input vault-search" id="vault-search" placeholder="Search all notes, snippets, links..." value="${SovereignUtils.sanitizeHtml(_searchQuery)}">
      </div>

      ${_searchQuery ? _renderSearchResults(allItems) : `
        <div class="vault-folders-grid">
          ${allFolders.map(f => `
            <button class="vault-folder-card" data-folder="${f.id}" style="--folder-color: ${f.color}">
              <span class="vault-folder-icon">${f.icon}</span>
              <span class="vault-folder-name">${SovereignUtils.sanitizeHtml(f.name)}</span>
              <span class="vault-folder-count">${getCount(f.id)} item${getCount(f.id) !== 1 ? 's' : ''}</span>
            </button>
          `).join('')}
          <button class="vault-folder-card vault-folder-add" id="vault-new-folder">
            <span class="vault-folder-icon">➕</span>
            <span class="vault-folder-name">New Folder</span>
          </button>
        </div>

        <div class="vault-recent-section">
          <h4 class="vault-section-label">Recently Added</h4>
          ${_renderRecentItems(allItems)}
        </div>
      `}
    `;

    main.querySelector('#vault-search')?.addEventListener('input', (e) => {
      _searchQuery = e.target.value.trim();
      _renderFolders();
    });

    main.querySelector('#vault-new-folder')?.addEventListener('click', () => _showAddFolderModal());

    main.querySelectorAll('[data-folder]').forEach(btn => {
      btn.addEventListener('click', () => {
        const folderId = btn.dataset.folder;
        const folder = allFolders.find(f => f.id === folderId);
        if (folder) _renderItems(folder);
      });
    });
  }

  function _renderSearchResults(allItems) {
    const q = _searchQuery.toLowerCase();
    const results = allItems.filter(item =>
      item.title?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q) ||
      item.tags?.some(t => t.toLowerCase().includes(q))
    );

    if (results.length === 0) {
      return `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">No results for "${SovereignUtils.sanitizeHtml(_searchQuery)}"</div></div>`;
    }

    return `
      <div class="vault-search-results">
        <p class="vault-search-count">${results.length} result${results.length !== 1 ? 's' : ''}</p>
        ${results.map(item => _renderItemCard(item, true)).join('')}
      </div>
    `;
  }

  function _renderRecentItems(allItems) {
    const recent = [...allItems]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (recent.length === 0) {
      return `<div class="vault-empty-recent">No items yet. Open a folder to add notes, snippets, and links.</div>`;
    }

    return `<div class="vault-recent-list">${recent.map(item => _renderItemCard(item, true)).join('')}</div>`;
  }

  // ─── Items View ───────────────────────────────────────────────────────────

  function _renderItems(folder) {
    const main = document.getElementById('vault-main');
    if (!main) return;
    _activeFolder = folder;

    const allItems = SovereignStorage.get('vault_items') || [];
    const items = allItems.filter(i => i.folder === folder.id);

    main.innerHTML = `
      <div class="vault-folder-header">
        <button class="btn btn-ghost btn-sm vault-back-btn" id="vault-back">← Back</button>
        <div class="vault-folder-title-wrap">
          <span class="vault-folder-title-icon">${folder.icon}</span>
          <h3 class="vault-folder-title">${SovereignUtils.sanitizeHtml(folder.name)}</h3>
        </div>
        <button class="btn btn-primary btn-sm" id="vault-add-item">+ Add</button>
      </div>

      <div class="vault-items-filter">
        <button class="filter-chip active" data-type="all">All</button>
        <button class="filter-chip" data-type="note">Notes</button>
        <button class="filter-chip" data-type="code">Code</button>
        <button class="filter-chip" data-type="link">Links</button>
      </div>

      <div class="vault-items-grid" id="vault-items-grid">
        ${items.length > 0 ? items.map(item => _renderItemCard(item, false)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">${folder.icon}</div>
            <div class="empty-state-title">Empty folder</div>
            <div class="empty-state-text">Tap + Add to add your first item</div>
          </div>
        `}
      </div>
    `;

    document.getElementById('vault-back')?.addEventListener('click', () => _renderFolders());
    document.getElementById('vault-add-item')?.addEventListener('click', () => _showAddItemModal());

    // Filter chips
    main.querySelector('.vault-items-filter')?.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-type]');
      if (!chip) return;
      main.querySelectorAll('.vault-items-filter .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const type = chip.dataset.type;
      const filteredItems = type === 'all' ? items : items.filter(i => i.type === type);
      const grid = document.getElementById('vault-items-grid');
      if (grid) grid.innerHTML = filteredItems.map(item => _renderItemCard(item, false)).join('') || '<div class="empty-text">No items of this type</div>';
    });

    _attachItemListeners(main);
  }

  function _renderItemCard(item, showFolder) {
    const typeIcons = { note: '📝', code: '💻', link: '🔗', doc: '📄' };
    const icon = typeIcons[item.type] || '📄';
    const allFolders = [...DEFAULT_FOLDERS, ...(SovereignStorage.get('vault_folders') || [])];
    const folder = showFolder ? allFolders.find(f => f.id === item.folder) : null;

    const preview = item.type === 'link'
      ? item.url || ''
      : SovereignUtils.truncate(item.content || '', 100);

    return `
      <div class="vault-item-card" data-item-id="${item.id}">
        <div class="vault-item-header">
          <span class="vault-item-type-icon">${icon}</span>
          <h4 class="vault-item-title">${SovereignUtils.sanitizeHtml(item.title)}</h4>
          <div class="vault-item-actions">
            ${ClaudeAI.isReady() && item.type !== 'link' ? `<button class="icon-btn vault-ai-summarize" data-id="${item.id}" title="AI Summary">✨</button>` : ''}
            <button class="icon-btn vault-edit-item" data-id="${item.id}" title="Edit">✏️</button>
            <button class="icon-btn vault-delete-item" data-id="${item.id}" title="Delete">🗑️</button>
          </div>
        </div>
        ${preview ? `<p class="vault-item-preview ${item.type === 'code' ? 'code-preview' : ''}">${SovereignUtils.sanitizeHtml(preview)}</p>` : ''}
        <div class="vault-item-footer">
          ${folder ? `<span class="vault-item-folder-badge">${folder.icon} ${folder.name}</span>` : ''}
          ${item.tags?.length ? item.tags.map(t => `<span class="tag-chip">${SovereignUtils.sanitizeHtml(t)}</span>`).join('') : ''}
          <span class="vault-item-date">${SovereignUtils.formatRelativeDate(item.createdAt)}</span>
        </div>
        ${item.aiSummary ? `<div class="vault-item-summary"><span class="vault-summary-label">✨ Summary</span> ${SovereignUtils.sanitizeHtml(item.aiSummary)}</div>` : ''}
      </div>
    `;
  }

  function _attachItemListeners(container) {
    container.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.vault-edit-item');
      if (editBtn) {
        const item = _getItemById(editBtn.dataset.id);
        if (item) _showAddItemModal(item);
        return;
      }

      const deleteBtn = e.target.closest('.vault-delete-item');
      if (deleteBtn) {
        SovereignStorage.update('vault_items', (prev = []) => (prev || []).filter(i => i.id !== deleteBtn.dataset.id));
        SovereignUtils.toast('Item deleted', 'success');
        _renderItems(_activeFolder);
        return;
      }

      const summarizeBtn = e.target.closest('.vault-ai-summarize');
      if (summarizeBtn) {
        const item = _getItemById(summarizeBtn.dataset.id);
        if (!item || !ClaudeAI.isReady()) return;
        summarizeBtn.textContent = '⏳';
        summarizeBtn.disabled = true;
        try {
          const result = await ClaudeAI.summarizeDocument(item.content || '', item.title);
          SovereignStorage.update('vault_items', (prev = []) =>
            (prev || []).map(i => i.id === item.id ? { ...i, aiSummary: result.summary || result } : i)
          );
          SovereignUtils.toast('Summary generated!', 'success');
          if (_activeFolder) _renderItems(_activeFolder);
          else _renderFolders();
        } catch {
          SovereignUtils.toast('Could not generate summary', 'error');
          summarizeBtn.textContent = '✨';
          summarizeBtn.disabled = false;
        }
        return;
      }

      // Open item on card click (not button)
      const card = e.target.closest('.vault-item-card');
      if (card && !e.target.closest('button')) {
        const item = _getItemById(card.dataset.itemId);
        if (item) _showItemDetail(item);
      }
    });
  }

  function _getItemById(id) {
    const items = SovereignStorage.get('vault_items') || [];
    return items.find(i => i.id === id) || null;
  }

  // ─── Modals ───────────────────────────────────────────────────────────────

  function _showAddFolderModal() {
    const FOLDER_ICONS = ['📁', '📝', '💻', '📚', '🔗', '🌿', '📄', '🎨', '🏆', '💡', '🔬', '🎵'];

    SovereignUtils.showModal(
      'New Folder',
      `
        <div class="form-group">
          <label class="form-label">Folder Name</label>
          <input type="text" class="form-input" id="ff-name" placeholder="My Notes">
        </div>
        <div class="form-group">
          <label class="form-label">Icon</label>
          <div class="vault-icon-picker">
            ${FOLDER_ICONS.map(icon => `<button class="vault-icon-opt ${icon === '📁' ? 'selected' : ''}" data-icon="${icon}">${icon}</button>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Color</label>
          <div class="vault-color-picker">
            ${['#C9886C', '#B8768A', '#9B7BAE', '#7B9BAE', '#7BAE9B', '#AE9B7B'].map(c => `
              <button class="vault-color-opt ${c === '#C9886C' ? 'selected' : ''}" data-color="${c}" style="background: ${c}"></button>
            `).join('')}
          </div>
        </div>
      `,
      [
        { label: 'Cancel', action: () => SovereignUtils.closeModal() },
        {
          label: 'Create Folder',
          primary: true,
          action: () => {
            const name = document.getElementById('ff-name')?.value.trim();
            if (!name) { SovereignUtils.toast('Enter a folder name', 'error'); return; }

            const selectedIcon = document.querySelector('.vault-icon-opt.selected')?.dataset.icon || '📁';
            const selectedColor = document.querySelector('.vault-color-opt.selected')?.dataset.color || '#C9886C';

            const folder = {
              id: SovereignUtils.generateId(),
              name, icon: selectedIcon, color: selectedColor
            };

            SovereignStorage.update('vault_folders', (prev = []) => [...(prev || []), folder]);
            SovereignUtils.closeModal();
            SovereignUtils.toast('Folder created', 'success');
            _renderFolders();
          }
        }
      ]
    );

    setTimeout(() => {
      const modal = document.getElementById('modal-container');
      modal?.addEventListener('click', (e) => {
        const iconOpt = e.target.closest('.vault-icon-opt');
        if (iconOpt) {
          modal.querySelectorAll('.vault-icon-opt').forEach(o => o.classList.remove('selected'));
          iconOpt.classList.add('selected');
        }
        const colorOpt = e.target.closest('.vault-color-opt');
        if (colorOpt) {
          modal.querySelectorAll('.vault-color-opt').forEach(o => o.classList.remove('selected'));
          colorOpt.classList.add('selected');
        }
      });
    }, 100);
  }

  function _showAddItemModal(existing = null) {
    const isEdit = !!existing;
    const currentFolder = _activeFolder || DEFAULT_FOLDERS[0];
    const allFolders = [...DEFAULT_FOLDERS, ...(SovereignStorage.get('vault_folders') || [])];

    SovereignUtils.showModal(
      isEdit ? 'Edit Item' : 'New Item',
      `
        <div class="form-row">
          <div class="form-group" style="flex:2">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" id="if-title" value="${isEdit ? SovereignUtils.sanitizeHtml(existing.title) : ''}" placeholder="Item title">
          </div>
          <div class="form-group" style="flex:1">
            <label class="form-label">Type</label>
            <select class="form-input" id="if-type">
              <option value="note" ${(!isEdit || existing.type === 'note') ? 'selected' : ''}>📝 Note</option>
              <option value="code" ${isEdit && existing.type === 'code' ? 'selected' : ''}>💻 Code</option>
              <option value="link" ${isEdit && existing.type === 'link' ? 'selected' : ''}>🔗 Link</option>
              <option value="doc" ${isEdit && existing.type === 'doc' ? 'selected' : ''}>📄 Doc</option>
            </select>
          </div>
        </div>
        <div id="if-link-row" class="form-group" style="${isEdit && existing.type === 'link' ? '' : 'display:none'}">
          <label class="form-label">URL</label>
          <input type="url" class="form-input" id="if-url" value="${isEdit && existing.url ? SovereignUtils.sanitizeHtml(existing.url) : ''}" placeholder="https://...">
        </div>
        <div class="form-group" id="if-content-row">
          <label class="form-label" id="if-content-label">Content</label>
          <textarea class="form-input" id="if-content" rows="6" style="font-family: ${isEdit && existing.type === 'code' ? 'monospace' : 'inherit'}"
            placeholder="${isEdit && existing.type === 'code' ? '// Paste your code here' : 'Write your note...'}"
          >${isEdit ? SovereignUtils.sanitizeHtml(existing.content || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Tags (comma separated)</label>
          <input type="text" class="form-input" id="if-tags" value="${isEdit && existing.tags ? existing.tags.join(', ') : ''}" placeholder="ielts, writing, tips">
        </div>
        <div class="form-group">
          <label class="form-label">Folder</label>
          <select class="form-input" id="if-folder">
            ${allFolders.map(f => `<option value="${f.id}" ${(isEdit ? existing.folder : currentFolder.id) === f.id ? 'selected' : ''}>${f.icon} ${f.name}</option>`).join('')}
          </select>
        </div>
      `,
      [
        { label: 'Cancel', action: () => SovereignUtils.closeModal() },
        {
          label: isEdit ? 'Save' : 'Add Item',
          primary: true,
          action: () => {
            const title = document.getElementById('if-title')?.value.trim();
            if (!title) { SovereignUtils.toast('Enter a title', 'error'); return; }

            const type = document.getElementById('if-type')?.value || 'note';
            const tagsRaw = document.getElementById('if-tags')?.value.trim();

            const item = {
              id: isEdit ? existing.id : SovereignUtils.generateId(),
              title,
              type,
              content: document.getElementById('if-content')?.value.trim() || '',
              url: document.getElementById('if-url')?.value.trim() || '',
              tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
              folder: document.getElementById('if-folder')?.value || currentFolder.id,
              aiSummary: isEdit ? existing.aiSummary : null,
              createdAt: isEdit ? existing.createdAt : new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            SovereignStorage.update('vault_items', (prev = []) => {
              if (isEdit) return (prev || []).map(i => i.id === item.id ? item : i);
              return [item, ...(prev || [])];
            });

            if (!SovereignStorage.get('vault_items')) {
              SovereignStorage.set('vault_items', [item]);
            }

            SovereignUtils.closeModal();
            SovereignUtils.toast(isEdit ? 'Item updated' : 'Item added', 'success');
            if (_activeFolder) _renderItems(_activeFolder);
            else _renderFolders();
          }
        }
      ]
    );

    setTimeout(() => {
      document.getElementById('if-type')?.addEventListener('change', (e) => {
        const isLink = e.target.value === 'link';
        const linkRow = document.getElementById('if-link-row');
        const content = document.getElementById('if-content');
        if (linkRow) linkRow.style.display = isLink ? '' : 'none';
        if (content) content.style.fontFamily = e.target.value === 'code' ? 'monospace' : 'inherit';
      });
      document.getElementById('if-title')?.focus();
    }, 100);
  }

  function _showItemDetail(item) {
    const typeIcons = { note: '📝', code: '💻', link: '🔗', doc: '📄' };
    SovereignUtils.showModal(
      item.title,
      `
        <div class="vault-detail">
          <div class="vault-detail-meta">
            <span>${typeIcons[item.type] || '📄'} ${item.type}</span>
            <span>${SovereignUtils.formatRelativeDate(item.createdAt)}</span>
            ${item.tags?.length ? item.tags.map(t => `<span class="tag-chip">${SovereignUtils.sanitizeHtml(t)}</span>`).join('') : ''}
          </div>
          ${item.url ? `<a href="${SovereignUtils.sanitizeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="vault-detail-link">${SovereignUtils.sanitizeHtml(item.url)}</a>` : ''}
          ${item.content ? `<div class="vault-detail-content ${item.type === 'code' ? 'code-block' : ''}">${SovereignUtils.sanitizeHtml(item.content)}</div>` : ''}
          ${item.aiSummary ? `<div class="vault-detail-summary"><strong>✨ AI Summary:</strong> ${SovereignUtils.sanitizeHtml(item.aiSummary)}</div>` : ''}
        </div>
      `,
      [
        { label: 'Edit', action: () => { SovereignUtils.closeModal(); _showAddItemModal(item); } },
        { label: 'Close', action: () => SovereignUtils.closeModal() }
      ]
    );
  }

  return { render, init, refresh };

})();
