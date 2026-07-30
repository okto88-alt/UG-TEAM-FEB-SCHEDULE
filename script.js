// ============================================
// SUPABASE CONFIG
// ============================================
const SUPABASE_URL = 'https://hnaylgaqriwtpzjhcwnf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYXlsZ2Fxcml3dHB6amhjd25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODkyNzAsImV4cCI6MjA5Mjk2NTI3MH0.GH5YFd4mVbhGUj_DiGVjqpZigcIM1AzjW7At6P1P9K4';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// STATE
// ============================================
let isAdmin = false;
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();
let scheduleData = [];
let deleteTargetId = null;
let editTargetId = null;

const WEBSITES = ['suria88', 'hakabet', 'viobet', 'tempo88', 'fila88', 'ijobet', 'hahawin88', 'lola88'];
const WEBSITE_LABELS = ['SURIA88', 'HAKABET', 'VIOBET', 'TEMPO88', 'FILA88', 'IJOBET', 'HAHAWIN88', 'LOLA88'];

let staffData = []; // loaded from Supabase

const AVATAR_COLORS = [
  '#2563EB', '#7C3AED', '#DB2777', '#D97706', '#059669',
  '#DC2626', '#0891B2', '#65A30D', '#9333EA', '#EA580C',
  '#0284C7', '#16A34A', '#CA8A04', '#E11D48', '#7C3AED',
  '#0D9488', '#B45309', '#4F46E5', '#BE185D', '#15803D'
];

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  updateTime();
  setInterval(updateTime, 1000);
  updateMonthLabel();

  // Check existing session
  const { data: { session } } = await db.auth.getSession();
  if (session) setAdminMode(true);

  // Auth state change
  db.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') setAdminMode(true);
    if (event === 'SIGNED_OUT') setAdminMode(false);
  });

  await loadStaff();
  await loadRoster();
  await loadSchedule();

  // Live range preview
  ['formDateFrom', 'formDateTo'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateRangePreview);
  });

  initPremiumInteractions();
});

// ============================================
// TIME
// ============================================
function updateTime() {
  const el = document.getElementById('liveTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

// ============================================
// MONTH NAV
// ============================================
function updateMonthLabel() {
  const label = new Date(currentYear, currentMonth - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  document.getElementById('monthLabel').textContent = label;
  document.getElementById('tableTitle').textContent = label;
}

function changeMonth(dir) {
  currentMonth += dir;
  if (currentMonth > 12) { currentMonth = 1; currentYear++; }
  if (currentMonth < 1) { currentMonth = 12; currentYear--; }
  updateMonthLabel();
  loadSchedule();
}

// ============================================
// ADMIN AUTH
// ============================================
function setAdminMode(admin) {
  isAdmin = admin;
  const dot = document.querySelector('.auth-dot');
  const label = document.getElementById('authLabel');
  const btn = document.getElementById('authBtn');
  const btnLabel = document.getElementById('authBtnLabel');
  const panel = document.getElementById('adminPanel');
  const actionHeader = document.getElementById('actionHeader');

  if (admin) {
    dot.className = 'auth-dot admin';
    label.textContent = 'Admin';
    btn.className = 'btn-auth logout';
    btnLabel.textContent = 'Sign Out';
    panel.style.display = 'block';
    actionHeader.style.display = '';
    document.getElementById('bulkToolbar').style.display = 'flex';
    document.getElementById('checkHeader').style.display = '';
  } else {
    dot.className = 'auth-dot viewer';
    label.textContent = 'View Only';
    btn.className = 'btn-auth';
    btnLabel.textContent = 'Admin Login';
    panel.style.display = 'none';
    actionHeader.style.display = 'none';
    document.getElementById('bulkToolbar').style.display = 'none';
    document.getElementById('checkHeader').style.display = 'none';
  }

  const btnEditRoster = document.getElementById('btnEditRoster');
  if (btnEditRoster) btnEditRoster.style.display = admin ? 'flex' : 'none';

  const addStaffBtn = document.getElementById('addStaffBtn');
  if (addStaffBtn) addStaffBtn.style.display = admin ? 'flex' : 'none';

  renderTable();
  renderStaffGrid();
}

function handleAuthClick() {
  if (isAdmin) {
    db.auth.signOut();
    showToast('Signed out');
  } else {
    openLoginModal();
  }
}

// Login modal
function openLoginModal() {
  document.getElementById('loginModal').classList.add('open');
  setTimeout(() => document.getElementById('loginEmail').focus(), 100);
}
function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('open');
  document.getElementById('loginError').textContent = '';
}

async function adminLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  const errEl = document.getElementById('loginError');

  if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }

  btn.disabled = true;
  document.getElementById('loginBtnText').textContent = 'Signing in...';
  errEl.textContent = '';

  const { error } = await db.auth.signInWithPassword({ email, password });

  btn.disabled = false;
  document.getElementById('loginBtnText').textContent = 'Sign In';

  if (error) {
    errEl.textContent = 'Invalid email or password.';
  } else {
    closeLoginModal();
    showToast('Welcome, Admin! ✓', 'success');
  }
}

// Enter key on login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('loginModal').classList.contains('open')) {
    adminLogin();
  }
});

// ============================================
// LOAD SCHEDULE
// ============================================
async function loadSchedule() {
  const tbody = document.getElementById('scheduleBody');
  tbody.innerHTML = `<tr><td colspan="13" class="loading-row"><div class="spinner"></div>Loading schedule...</td></tr>`;

  // Get proper last day of month
  const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await db
    .from('schedules')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Supabase error:', error);
    tbody.innerHTML = `<tr><td colspan="13" class="empty-row">Failed to load schedule: ${error.message}</td></tr>`;
    return;
  }

  // Sort: morning before evening after fetching
  data && data.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.shift === 'morning' ? -1 : 1;
  });

  scheduleData = data || [];
  renderTable();
}

// ============================================
// RENDER TABLE
// ============================================
function renderTable() {
  const tbody = document.getElementById('scheduleBody');

  if (!scheduleData.length) {
    tbody.innerHTML = `<tr><td colspan="13" class="empty-row">No schedule found for this month.</td></tr>`;
    return;
  }

  // Group by date
  const grouped = {};
  scheduleData.forEach(row => {
    if (!grouped[row.date]) grouped[row.date] = {};
    grouped[row.date][row.shift] = row;
  });

  let html = '';
  const dates = Object.keys(grouped).sort();
  let rowIndex = 0;

  dates.forEach(dateStr => {
    const dayData = grouped[dateStr];
    const d = new Date(dateStr + 'T12:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    const shifts = [];
    if (dayData.morning) shifts.push({ shift: 'morning', row: dayData.morning });
    if (dayData.evening) shifts.push({ shift: 'evening', row: dayData.evening });

    shifts.forEach(({ shift, row }, idx) => {
      const rowClass = shift === 'morning' ? 'day-row' : 'night-row';
      const isFirst = idx === 0;

      html += `<tr class="${rowClass}" data-id="${row.id}" style="--i:${rowIndex++}">`;

      // Checkbox (admin only)
      if (isAdmin) {
        html += `<td class="check-cell">
          <label class="checkbox-wrap">
            <input type="checkbox" class="row-check" value="${row.id}" onchange="updateBulkCount()">
            <span class="checkmark"></span>
          </label>
        </td>`;
      }

      // Date cell — rowspan covers both shifts of same day
      if (isFirst) {
        html += `<td class="date-cell" rowspan="${shifts.length}">
          <div class="date-day">${dayName}</div>
          <div class="date-num">${dayNum}</div>
        </td>`;
      }

      // Shift badge cell
      html += `<td style="text-align:center">
        <span class="shift-badge ${shift === 'morning' ? 'day' : 'night'}">
          ${shift === 'morning' ? '☀ Day' : '☽ Night'}
        </span>
      </td>`;

      WEBSITES.forEach(site => {
        const val = row[site];
        const isEmpty = !val || val === '-';
        html += `<td class="staff-cell ${isEmpty ? 'empty' : ''}">${val || '—'}</td>`;
      });

      // Offday
      html += `<td class="offday-cell">${row.offday || ''}</td>`;

      // Actions (admin only)
      if (isAdmin) {
        html += `<td class="action-cell" style="display:''">
          <button class="btn-edit" onclick="openEditModal('${row.id}')">Edit</button>
          <button class="btn-del" onclick="openDeleteModal('${row.id}')">Del</button>
        </td>`;
      }

      html += `</tr>`;
    });
  });

  tbody.innerHTML = html;
}

// ============================================
// LOAD STAFF FROM SUPABASE
// ============================================
async function loadStaff() {
  const { data, error } = await db
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (!error) {
    staffData = data || [];
    renderStaffGrid();
    populateStaffDropdowns();
  }
}

// ============================================
// ROSTER (MANUAL)
// ============================================
let rosterData = { morning: '', evening: '' }; // names string from DB

async function loadRoster() {
  const { data, error } = await db.from('roster').select('*');
  if (error || !data) return;
  data.forEach(r => {
    if (r.shift === 'morning') rosterData.morning = r.names || '';
    if (r.shift === 'evening') rosterData.evening = r.names || '';
  });
  renderRosterBubbles();
}

function renderRosterBubbles() {
  const dayEl = document.getElementById('dayShiftBubbles');
  const nightEl = document.getElementById('nightShiftBubbles');

  const dayNames = rosterData.morning.split(',').map(n => n.trim()).filter(Boolean);
  const nightNames = rosterData.evening.split(',').map(n => n.trim()).filter(Boolean);

  dayEl.innerHTML = dayNames.length
    ? dayNames.map(n => `<span class="bubble day">${n}</span>`).join('')
    : `<span class="bubble-empty">— Empty —</span>`;

  nightEl.innerHTML = nightNames.length
    ? nightNames.map(n => `<span class="bubble night">${n}</span>`).join('')
    : `<span class="bubble-empty">— Empty —</span>`;
}

function openRosterModal() {
  // Build checkboxes for each shift from staffData
  ['Day', 'Night'].forEach(label => {
    const shift = label === 'Day' ? 'morning' : 'evening';
    const el = document.getElementById(`roster${label}Picker`);
    const selected = rosterData[shift].split(',').map(n => n.trim()).filter(Boolean);
    el.innerHTML = staffData.map(s => `
      <label class="roster-check-item">
        <input type="checkbox" value="${s.name}" ${selected.includes(s.name) ? 'checked' : ''}>
        <span>${s.name}</span>
      </label>`).join('');
  });
  document.getElementById('rosterError').textContent = '';
  document.getElementById('rosterModal').classList.add('open');
}

function closeRosterModal() {
  document.getElementById('rosterModal').classList.remove('open');
}

async function saveRoster() {
  const btn = document.getElementById('saveRosterBtn');
  const errEl = document.getElementById('rosterError');

  const getDayChecked = () => [...document.querySelectorAll('#rosterDayPicker input:checked')].map(i => i.value);
  const getNightChecked = () => [...document.querySelectorAll('#rosterNightPicker input:checked')].map(i => i.value);

  const morningNames = getDayChecked().join(', ');
  const eveningNames = getNightChecked().join(', ');

  btn.disabled = true;
  document.getElementById('saveRosterBtnText').textContent = 'Saving...';

  const updates = [
    db.from('roster').update({ names: morningNames }).eq('shift', 'morning'),
    db.from('roster').update({ names: eveningNames }).eq('shift', 'evening'),
  ];
  const results = await Promise.all(updates);
  const failed = results.find(r => r.error);

  btn.disabled = false;
  document.getElementById('saveRosterBtnText').textContent = 'Save Roster';

  if (failed) {
    errEl.textContent = 'Error: ' + failed.error.message;
    return;
  }

  rosterData.morning = morningNames;
  rosterData.evening = eveningNames;
  renderRosterBubbles();
  closeRosterModal();
  showToast('Roster updated ✓', 'success');
}

// ============================================
// POPULATE STAFF DROPDOWNS
// ============================================
function populateStaffDropdowns(selectedValues = {}) {
  WEBSITES.forEach(site => {
    const el = document.getElementById('form' + capitalize(site));
    const el2 = document.getElementById('form' + capitalize(site) + '_2');

    [el, el2].forEach((dropdown, idx) => {
      if (!dropdown) return;
      dropdown.innerHTML = `<option value="">— Empty —</option>`;
      staffData.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        dropdown.appendChild(opt);
      });
    });

    // Parse existing value "Nama1 / Nama2" back into 2 dropdowns
    if (selectedValues[site]) {
      const parts = selectedValues[site].split(' / ');
      if (el) el.value = parts[0] || '';
      if (el2) el2.value = parts[1] || '';
    }
  });
}

// ============================================
// RENDER STAFF PYRAMID (OPTION A)
// ============================================
function renderStaffGrid() {
  const grid = document.getElementById('staffGrid');
  const countEl = document.getElementById('staffCount');
  if (!grid) return;

  if (!staffData.length) {
    grid.innerHTML = `<div style="color:var(--text-3);font-size:.9rem;padding:24px">No staff found.</div>`;
    return;
  }

  if (countEl) countEl.textContent = `${staffData.length} members`;

  const leaders = staffData.filter(s => s.role === 'leader');
  const assistants = staffData.filter(s => s.role === 'assistant');
  const staff = staffData.filter(s => !s.role || s.role === 'staff');

  function makeCard(s, i, tier) {
    const crown = tier === 'leader' ? '<div class="pyr-crown-wrap"><span class="pyr-crown">👑</span></div>' : '';
    const badgeText = tier === 'leader' ? 'Leader' : tier === 'assistant' ? 'Assistant' : '';
    const badge = badgeText ? `<span class="pyr-role-badge pyr-badge-${tier}">${badgeText}</span>` : '';
    const adminActions = isAdmin ? `
      <div class="pyr-card-actions">
        <button class="btn-edit" onclick="openEditStaffModal('${s.id}')">Edit</button>
        <button class="btn-del" onclick="openDeleteStaffModal('${s.id}', '${s.name}')">Remove</button>
      </div>` : '';

    // DiceBear Bottts Robot avatar
    const bgColor = tier === 'leader' ? 'fef3c7' : tier === 'assistant' ? 'e0e7ff' : 'f1f5f9';
    const avatarUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(s.name)}&backgroundColor=${bgColor}`;

    return `
      <div class="pyr-card pyr-card-${tier}">
        ${crown}
        <div class="pyr-avatar-bot pyr-avatar-${tier}">
          <img src="${avatarUrl}" alt="${s.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="pyr-avatar-fallback" style="display:none">${s.name.slice(0, 2).toUpperCase()}</div>
        </div>
        <div class="pyr-name">${s.name}</div>
        ${badge}
        ${adminActions}
      </div>`;
  }

  grid.innerHTML = `
    <div class="pyramid-wrap">
      ${leaders.length ? `
      <div class="pyr-tier-wrap">
        <div class="pyr-tier-label pyr-label-leader">👑 Leader</div>
        <div class="pyr-tier">
          ${leaders.map((s, i) => makeCard(s, i, 'leader')).join('')}
        </div>
      </div>
      <div class="pyr-connector"></div>` : ''}

      ${assistants.length ? `
      <div class="pyr-tier-wrap">
        <div class="pyr-tier-label pyr-label-assistant">⭐ Assistant Leader</div>
        <div class="pyr-tier">
          ${assistants.map((s, i) => makeCard(s, i, 'assistant')).join('')}
        </div>
      </div>
      <div class="pyr-connector"></div>` : ''}

      ${staff.length ? `
      <div class="pyr-tier-wrap">
        <div class="pyr-tier-label pyr-label-staff">👥 Staff</div>
        <div class="pyr-tier pyr-tier-staff">
          ${staff.map((s, i) => makeCard(s, i, 'staff')).join('')}
        </div>
      </div>` : ''}
    </div>`;
}

// ============================================
// STAFF CRUD
// ============================================
let editStaffId = null;
let deleteStaffId = null;

function openAddStaffModal() {
  editStaffId = null;
  document.getElementById('staffModalTitle').textContent = 'Add Staff';
  document.getElementById('saveStaffBtnText').textContent = 'Add Staff';
  document.getElementById('staffName').value = '';
  document.getElementById('staffRole').value = 'staff';
  document.getElementById('staffError').textContent = '';
  document.getElementById('staffModal').classList.add('open');
  setTimeout(() => document.getElementById('staffName').focus(), 100);
}

function openEditStaffModal(id) {
  const s = staffData.find(x => x.id === id);
  if (!s) return;
  editStaffId = id;
  document.getElementById('staffModalTitle').textContent = 'Edit Staff';
  document.getElementById('saveStaffBtnText').textContent = 'Update';
  document.getElementById('staffName').value = s.name;
  document.getElementById('staffRole').value = s.role || 'staff';
  document.getElementById('staffError').textContent = '';
  document.getElementById('staffModal').classList.add('open');
}

function closeStaffModal() {
  document.getElementById('staffModal').classList.remove('open');
}

async function saveStaff() {
  const name = document.getElementById('staffName').value.trim();
  const role = document.getElementById('staffRole').value;
  const errEl = document.getElementById('staffError');
  const btn = document.getElementById('saveStaffBtn');

  if (!name) { errEl.textContent = 'Please enter a name.'; return; }

  btn.disabled = true;
  document.getElementById('saveStaffBtnText').textContent = 'Saving...';
  errEl.textContent = '';

  let error;
  if (editStaffId) {
    ({ error } = await db.from('staff').update({ name, role }).eq('id', editStaffId));
  } else {
    ({ error } = await db.from('staff').insert({ name, role, is_active: true, shift: 'morning' }));
  }

  btn.disabled = false;
  document.getElementById('saveStaffBtnText').textContent = editStaffId ? 'Update' : 'Add Staff';

  if (error) { errEl.textContent = 'Error: ' + error.message; return; }

  closeStaffModal();
  showToast(editStaffId ? `${name} updated ✓` : `${name} added ✓`, 'success');
  await loadStaff();
}

function openDeleteStaffModal(id, name) {
  deleteStaffId = id;
  document.getElementById('deleteStaffName').textContent = `Remove "${name}" from the team?`;
  document.getElementById('deleteStaffModal').classList.add('open');
}

function closeDeleteStaffModal() {
  document.getElementById('deleteStaffModal').classList.remove('open');
  deleteStaffId = null;
}

async function confirmDeleteStaff() {
  if (!deleteStaffId) return;
  const { error } = await db.from('staff').delete().eq('id', deleteStaffId);
  closeDeleteStaffModal();
  if (error) { showToast('Failed to remove staff', 'error'); return; }
  showToast('Staff removed', 'success');
  await loadStaff();
}




function openAddModal() {
  editTargetId = null;
  document.getElementById('scheduleModalTitle').textContent = 'Add Schedule';
  document.getElementById('saveBtnText').textContent = 'Save Schedule';
  // Show range fields for add
  document.getElementById('formDateSection').style.display = '';
  document.getElementById('formDateToGroup').style.display = '';
  document.getElementById('formDateSingle').style.display = 'none';
  clearScheduleForm();
  populateStaffDropdowns();
  document.getElementById('scheduleModal').classList.add('open');
}

function openEditModal(id) {
  const row = scheduleData.find(r => r.id === id);
  if (!row) return;

  editTargetId = id;
  document.getElementById('scheduleModalTitle').textContent = 'Edit Schedule';
  document.getElementById('saveBtnText').textContent = 'Update Schedule';

  // Hide range, show single date for edit
  document.getElementById('formDateSection').style.display = 'none';
  document.getElementById('formDateSingle').style.display = '';
  document.getElementById('formDate').value = row.date;
  document.getElementById('formShift').value = row.shift;

  const selectedValues = {};
  WEBSITES.forEach(site => { selectedValues[site] = row[site] || ''; });
  populateStaffDropdowns(selectedValues);

  document.getElementById('formOffday').value = row.offday || '';
  document.getElementById('scheduleModal').classList.add('open');
}

function closeScheduleModal() {
  document.getElementById('scheduleModal').classList.remove('open');
  document.getElementById('scheduleError').textContent = '';
  const preview = document.getElementById('rangePreview');
  if (preview) preview.remove();
}

function clearScheduleForm() {
  document.getElementById('formDateFrom').value = '';
  document.getElementById('formDateTo').value = '';
  document.getElementById('formDate').value = '';
  document.getElementById('formShift').value = 'morning';
  WEBSITES.forEach(site => {
    const el = document.getElementById('form' + capitalize(site));
    const el2 = document.getElementById('form' + capitalize(site) + '_2');
    if (el) el.value = '';
    if (el2) el2.value = '';
  });
  document.getElementById('formOffday').value = '';
  document.getElementById('scheduleError').textContent = '';
}

function updateRangePreview() {
  const from = document.getElementById('formDateFrom').value;
  const to = document.getElementById('formDateTo').value;
  let preview = document.getElementById('rangePreview');

  if (!from) {
    if (preview) preview.remove();
    return;
  }

  const fromD = new Date(from + 'T12:00:00');
  const toD = to ? new Date(to + 'T12:00:00') : fromD;
  const days = Math.round((toD - fromD) / 86400000) + 1;

  if (!preview) {
    preview = document.createElement('div');
    preview.id = 'rangePreview';
    preview.className = 'range-preview';
    document.getElementById('formDateSection').after(preview);
  }

  if (days <= 0) {
    preview.textContent = '⚠ End date must be after start date';
    preview.style.color = 'var(--danger)';
    preview.style.background = 'var(--off-light)';
  } else if (days === 1) {
    preview.textContent = `📅 Single day: ${fromD.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
    preview.style.color = 'var(--accent)';
    preview.style.background = 'var(--accent-light)';
  } else {
    preview.textContent = `📅 ${days} days: ${fromD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${toD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    preview.style.color = 'var(--accent)';
    preview.style.background = 'var(--accent-light)';
  }
}


async function saveSchedule() {
  const shift = document.getElementById('formShift').value;
  const errEl = document.getElementById('scheduleError');
  const btn = document.getElementById('saveScheduleBtn');
  errEl.textContent = '';

  // Build website payload
  const sitePayload = {};
  WEBSITES.forEach(site => {
    const el = document.getElementById('form' + capitalize(site));
    const el2 = document.getElementById('form' + capitalize(site) + '_2');
    const val1 = el ? el.value.trim() : '';
    const val2 = el2 ? el2.value.trim() : '';
    sitePayload[site] = [val1, val2].filter(Boolean).join(' / ') || null;
  });
  const offday = document.getElementById('formOffday').value.trim() || null;

  // ---- EDIT MODE (single date) ----
  if (editTargetId) {
    const date = document.getElementById('formDate').value;
    if (!date) { errEl.textContent = 'Please select a date.'; return; }

    const payload = {
      date, shift,
      day_name: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
      ...sitePayload, offday
    };

    btn.disabled = true;
    document.getElementById('saveBtnText').textContent = 'Saving...';
    const { error } = await db.from('schedules').update(payload).eq('id', editTargetId);
    btn.disabled = false;
    document.getElementById('saveBtnText').textContent = 'Update Schedule';

    if (error) { errEl.textContent = 'Error: ' + error.message; return; }
    closeScheduleModal();
    showToast('Schedule updated ✓', 'success');
    await loadSchedule();
    return;
  }

  // ---- ADD MODE (date range) ----
  const dateFrom = document.getElementById('formDateFrom').value;
  const dateTo = document.getElementById('formDateTo').value || dateFrom;

  if (!dateFrom) { errEl.textContent = 'Please select a start date.'; return; }

  const from = new Date(dateFrom + 'T12:00:00');
  const to = new Date(dateTo + 'T12:00:00');

  if (to < from) { errEl.textContent = 'End date must be after start date.'; return; }

  // Generate all dates in range
  const allDates = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    allDates.push(cursor.toISOString().split('T')[0]);
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalDays = allDates.length;
  btn.disabled = true;
  document.getElementById('saveBtnText').textContent = `Saving ${totalDays} day${totalDays > 1 ? 's' : ''}...`;

  // Fetch existing rows for this date range + shift to merge
  const { data: existing } = await db
    .from('schedules')
    .select('*')
    .in('date', allDates)
    .eq('shift', shift);

  const existingMap = {};
  (existing || []).forEach(r => { existingMap[r.date] = r; });

  // Build merged rows — only overwrite non-empty fields from form
  const rows = allDates.map(dateStr => {
    const prev = existingMap[dateStr] || {};
    const merged = {
      date: dateStr,
      shift,
      day_name: new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
    };

    // For each website: use new value if filled, keep existing if not
    WEBSITES.forEach(site => {
      merged[site] = sitePayload[site] || prev[site] || null;
    });

    // For offday: use new value if filled, keep existing if not
    merged.offday = offday || prev.offday || null;

    return merged;
  });

  // Delete existing rows for these dates+shift first, then insert fresh
  const existingIds = Object.values(existingMap).map(r => r.id).filter(Boolean);
  if (existingIds.length) {
    const { error: delError } = await db.from('schedules').delete().in('id', existingIds);
    if (delError) {
      btn.disabled = false;
      document.getElementById('saveBtnText').textContent = 'Save Schedule';
      errEl.textContent = 'Error deleting old data: ' + delError.message;
      return;
    }
  }

  const { data: insertData, error } = await db.from('schedules').insert(rows).select();

  btn.disabled = false;
  document.getElementById('saveBtnText').textContent = 'Save Schedule';

  if (error) {
    errEl.textContent = 'Error: ' + error.message;
    return;
  }

  closeScheduleModal();
  showToast(`${totalDays} day${totalDays > 1 ? 's' : ''} saved ✓`, 'success');
  await loadSchedule();
}

// ============================================
// BULK DELETE
// ============================================
let bulkDeleteAction = null; // 'selected' | 'morning' | 'evening' | 'all'

function updateBulkCount() {
  const checked = document.querySelectorAll('.row-check:checked');
  const total = document.querySelectorAll('.row-check');
  const countEl = document.getElementById('bulkCount');
  const btn = document.getElementById('btnDeleteSelected');
  const selectAll = document.getElementById('selectAll');
  const selectAllHead = document.getElementById('selectAllHead');

  countEl.textContent = checked.length > 0 ? `${checked.length} selected` : `0 selected`;
  btn.disabled = checked.length === 0;

  // Sync select-all checkboxes
  const allChecked = checked.length === total.length && total.length > 0;
  const someChecked = checked.length > 0 && !allChecked;
  if (selectAll) { selectAll.checked = allChecked; selectAll.indeterminate = someChecked; }
  if (selectAllHead) { selectAllHead.checked = allChecked; selectAllHead.indeterminate = someChecked; }
}

function toggleSelectAll(checked) {
  document.querySelectorAll('.row-check').forEach(cb => cb.checked = checked);
  // Sync both checkboxes
  const sa = document.getElementById('selectAll');
  const sah = document.getElementById('selectAllHead');
  if (sa) sa.checked = checked;
  if (sah) sah.checked = checked;
  updateBulkCount();
}

function bulkDeleteSelected() {
  const checked = document.querySelectorAll('.row-check:checked');
  if (!checked.length) return;
  bulkDeleteAction = 'selected';
  document.getElementById('bulkDeleteTitle').textContent = 'Delete Selected';
  document.getElementById('bulkDeleteSub').textContent = `Delete ${checked.length} selected row${checked.length > 1 ? 's' : ''}? This cannot be undone.`;
  document.getElementById('bulkDeleteModal').classList.add('open');
}

function bulkDeleteShift(shift) {
  const count = scheduleData.filter(r => r.shift === shift).length;
  if (!count) { showToast('No rows to delete', 'error'); return; }
  bulkDeleteAction = shift;
  const label = shift === 'morning' ? 'Day (Morning)' : 'Night (Evening)';
  document.getElementById('bulkDeleteTitle').textContent = `Delete All ${label} Shift`;
  document.getElementById('bulkDeleteSub').textContent = `Delete all ${count} ${label} rows this month? This cannot be undone.`;
  document.getElementById('bulkDeleteModal').classList.add('open');
}

function bulkDeleteAll() {
  if (!scheduleData.length) { showToast('No schedule to delete', 'error'); return; }
  bulkDeleteAction = 'all';
  document.getElementById('bulkDeleteTitle').textContent = 'Delete Entire Month';
  document.getElementById('bulkDeleteSub').textContent = `Delete all ${scheduleData.length} rows for this month? This cannot be undone.`;
  document.getElementById('bulkDeleteModal').classList.add('open');
}

function closeBulkDeleteModal() {
  document.getElementById('bulkDeleteModal').classList.remove('open');
  bulkDeleteAction = null;
}

async function confirmBulkDelete() {
  // Collect IDs FIRST before closing modal (closing resets bulkDeleteAction)
  let ids = [];

  if (bulkDeleteAction === 'selected') {
    ids = [...document.querySelectorAll('.row-check:checked')].map(cb => cb.value);
  } else if (bulkDeleteAction === 'morning' || bulkDeleteAction === 'evening') {
    ids = scheduleData.filter(r => r.shift === bulkDeleteAction).map(r => r.id);
  } else if (bulkDeleteAction === 'all') {
    ids = scheduleData.map(r => r.id);
  }

  closeBulkDeleteModal();

  if (!ids.length) { showToast('No rows found to delete', 'error'); return; }

  showToast(`Deleting ${ids.length} row${ids.length > 1 ? 's' : ''}...`);

  const { error } = await db.from('schedules').delete().in('id', ids);

  if (error) {
    showToast('Delete failed: ' + error.message, 'error');
    return;
  }

  showToast(`${ids.length} row${ids.length > 1 ? 's' : ''} deleted ✓`, 'success');
  updateBulkCount();
  await loadSchedule();
}

// ============================================
// DELETE (single)
// ============================================
function openDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById('deleteModal').classList.add('open');
}
function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  deleteTargetId = null;
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const { error } = await db.from('schedules').delete().eq('id', deleteTargetId);
  closeDeleteModal();
  if (error) { showToast('Delete failed', 'error'); return; }
  showToast('Schedule deleted', 'success');
  await loadSchedule();
}

// ============================================
// SEARCH
// ============================================
function handleSearch(val) {
  const clearBtn = document.getElementById('searchClear');
  const resultsPanel = document.getElementById('searchResults');

  if (!val.trim()) {
    clearBtn.style.display = 'none';
    resultsPanel.style.display = 'none';
    return;
  }

  clearBtn.style.display = 'flex';
  const term = val.toLowerCase();
  const results = [];

  scheduleData.forEach(row => {
    WEBSITES.forEach((site, i) => {
      const staff = row[site];
      if (staff && staff.toLowerCase().includes(term)) {
        results.push({
          name: staff,
          date: row.date,
          shift: row.shift,
          website: WEBSITE_LABELS[i]
        });
      }
    });
  });

  if (!results.length) {
    resultsPanel.style.display = 'block';
    resultsPanel.innerHTML = `
      <div class="search-results-header">
        <h4>No results for "${val}"</h4>
      </div>`;
    return;
  }

  let html = `
    <div class="search-results-header">
      <h4>Results for "${val}"</h4>
      <span class="search-results-count">${results.length} found</span>
    </div>
    <div class="search-results-list">
  `;

  results.forEach(r => {
    const d = new Date(r.date + 'T12:00:00');
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    html += `
      <div class="search-result-row">
        <span class="sr-name">${r.name}</span>
        <span class="sr-date">${dateStr}</span>
        <span class="sr-shift ${r.shift}">${r.shift === 'morning' ? '☀ Day' : '☽ Night'}</span>
        <span class="sr-website">${r.website}</span>
      </div>`;
  });

  html += `</div>`;
  resultsPanel.innerHTML = html;
  resultsPanel.style.display = 'block';
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
  document.getElementById('searchResults').style.display = 'none';
}

// ============================================
// VIEW NAVIGATION
// ============================================
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view' + capitalize(name)).classList.add('active');
  document.querySelectorAll('.nav-item')[name === 'schedule' ? 0 : 1].classList.add('active');
  document.getElementById('pageTitle').textContent = capitalize(name);

  // Close sidebar on mobile after nav
  if (window.innerWidth < 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

// ============================================
// SIDEBAR TOGGLE (MOBILE)
// ============================================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth >= 768) return;
  const sidebar = document.getElementById('sidebar');
  const toggle = document.querySelector('.menu-toggle');
  if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// ============================================
// TOAST
// ============================================
function showToast(msg, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// PREMIUM INTERACTIONS — tilt, cursor-glow, ambient parallax
// ============================================
function initPremiumInteractions() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const GLOW_SELECTOR = '.roster-card, .table-card, .search-bar, .modal, .staff-card, .pyr-card';
  const TILT_SELECTOR = '.pyr-card, .roster-card';
  let tiltEl = null;
  let ticking = false;
  let lastEvent = null;

  function updateFrame() {
    ticking = false;
    if (!lastEvent) return;
    const e = lastEvent;

    // Cursor-glow spotlight on glass surfaces
    const glowCard = e.target.closest(GLOW_SELECTOR);
    if (glowCard) {
      const gr = glowCard.getBoundingClientRect();
      glowCard.style.setProperty('--mx', `${e.clientX - gr.left}px`);
      glowCard.style.setProperty('--my', `${e.clientY - gr.top}px`);
    }

    // 3D tilt on cards
    const card = e.target.closest(TILT_SELECTOR);
    if (card !== tiltEl && tiltEl) {
      tiltEl.style.transform = '';
      tiltEl = null;
    }
    if (card) {
      tiltEl = card;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rotateX = (-py * 8).toFixed(2);
      const rotateY = (px * 10).toFixed(2);
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.015)`;
    }

    // Ambient background parallax
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    document.querySelectorAll('.blob').forEach(blob => {
      const depth = parseFloat(blob.dataset.depth || 0.03);
      blob.style.marginLeft = `${nx * window.innerWidth * depth}px`;
      blob.style.marginTop = `${ny * window.innerHeight * depth}px`;
    });
  }

  document.addEventListener('mousemove', (e) => {
    lastEvent = e;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateFrame);
    }
  });

  document.addEventListener('mouseleave', () => {
    if (tiltEl) { tiltEl.style.transform = ''; tiltEl = null; }
  });
}

// ============================================
// UTILS
// ============================================
function capitalize(str) {
  if (!str) return '';
  // Handle compound field names like 'hahawin88' -> 'Hahawin88'
  return str.charAt(0).toUpperCase() + str.slice(1);
}