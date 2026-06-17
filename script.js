const SHEET_URLS = {
    relawan: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1957179512&single=true&output=csv',
    kontak: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=176617983&single=true&output=csv',
    quote: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1582688414&single=true&output=csv',
    pengumuman: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=429943974&single=true&output=csv',
    agenda: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=761655212&single=true&output=csv',
    dokumen: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1144895464&single=true&output=csv',
    info: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=515718382&single=true&output=csv',
    menu: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1196527440&single=true&output=csv',
    rute: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=96960366&single=true&output=csv'
};

let globalData = { relawan: [], info: [] };
let sidebarOpen = false;
let currentFilter = 'all';
let currentMenuFilter = 'all';

// ===== SIDEBAR TOGGLE =====
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebarOpen = !sidebarOpen;
    if (sidebarOpen) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== NAVIGATION =====
function showHome() {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const home = document.getElementById('section-home');
    if (home) { home.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (sidebarOpen) toggleMenu();
}

function showSection(sectionName) {
    document.getElementById('section-home').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const section = document.getElementById('section-' + sectionName);
    if (section) { section.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (sidebarOpen) toggleMenu();
}

// ===== CLOCK =====
function updateClock() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibTime = new Date(utc + (3600000 * 7));
    document.getElementById('digitalTime').textContent = `${String(wibTime.getHours()).padStart(2, '0')}:${String(wibTime.getMinutes()).padStart(2, '0')}:${String(wibTime.getSeconds()).padStart(2, '0')}`;
    document.getElementById('msDisplay').textContent = String(wibTime.getMilliseconds()).padStart(3, '0');
    document.getElementById('dateDisplay').textContent = wibTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('secondHand').style.transform = `rotate(${(wibTime.getSeconds() / 60) * 360}deg)`;
    document.getElementById('minuteHand').style.transform = `rotate(${((wibTime.getMinutes() + wibTime.getSeconds() / 60) / 60) * 360}deg)`;
    document.getElementById('hourHand').style.transform = `rotate(${((wibTime.getHours() % 12 + wibTime.getMinutes() / 60) / 12) * 360}deg)`;
}
setInterval(updateClock, 10);

// ===== CSV PARSER & UTILS =====
function parseCSV(text) {
    const rows = []; let currentRow = []; let currentField = ''; let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i]; const nextChar = text[i + 1];
        if (char === '"') { if (inQuotes && nextChar === '"') { currentField += '"'; i++; } else { inQuotes = !inQuotes; } }
        else if (char === ',' && !inQuotes) { currentRow.push(currentField.trim()); currentField = ''; }
        else if ((char === '\n' || char === '\r') && !inQuotes) { if (char === '\r' && nextChar === '\n') i++; currentRow.push(currentField.trim()); if (currentRow.some(f => f !== '')) rows.push(currentRow); currentRow = []; currentField = ''; }
        else { currentField += char; }
    }
    if (currentField || currentRow.length > 0) { currentRow.push(currentField.trim()); if (currentRow.some(f => f !== '')) rows.push(currentRow); }
    if (rows.length < 2) return [];
    const headers = rows[0]; const data = [];
    for (let i = 1; i < rows.length; i++) { const row = {}; headers.forEach((h, idx) => { row[h] = rows[i][idx] || ''; }); data.push(row); }
    return data;
}

async function fetchSheetData(url) {
    try { const response = await fetch(url); if (!response.ok) throw new Error('Network error'); return parseCSV(await response.text()); }
    catch (error) { console.error('Error loading sheet:', error); return []; }
}

function escapeHtml(text) { if (!text) return '-'; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function cleanWA(number) { if (!number) return ''; let clean = String(number).replace(/\D/g, ''); if (clean.startsWith('0')) clean = '62' + clean.substring(1); return clean; }
function isValidLink(link) { if (!link) return false; const trimmed = link.trim().toLowerCase(); return trimmed !== '' && trimmed !== '-' && trimmed !== 'null'; }
function filterTable(e, tbody) { const q = e.target.value.toLowerCase(); tbody.querySelectorAll('tr').forEach(tr => { tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none'; }); }

// ===== LIVE CHAT: START CHAT LOGIC (KODE RAHASIA) =====
function handleStartChat() {
    const nameInput = document.querySelector('.chat-name-body input');
    let userName = nameInput ? nameInput.value.trim() : '';

    // === LOGIKA RAHASIA ADMIN ===
    if (userName === '31') {
        userName = 'ADMIN 🛡️';
    }

    if (userName) {
        localStorage.setItem('chatUserName', userName);
        const nameForm = document.querySelector('.chat-name-form');
        if (nameForm) nameForm.style.display = 'none';
        const chatRoom = document.querySelector('.chat-room');
        if (chatRoom) chatRoom.style.display = 'flex';
        const userLabel = document.querySelector('.chat-user-label');
        if (userLabel) userLabel.textContent = userName;
    } else {
        alert('Silakan masukkan nama Anda terlebih dahulu!');
    }
}

// ===== PUSAT DOKUMEN =====
function filterDokumen(category, btn) {
    currentFilter = category;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    loadDokumen();
}

function getDocIcon(category) { const icons = { sop: '📋', template: '📝', form: '📊', sk: '📜', panduan: '📖', internal: '📁' }; return icons[category] || '📄'; }

async function loadDokumen() {
    const grid = document.getElementById('docGrid'); if (!grid) return;
    grid.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">⏳ Memuat dokumen...</p>';
    const data = await fetchSheetData(SHEET_URLS.dokumen);
    if (data.length === 0) { grid.innerHTML = '<div class="doc-empty"><div class="doc-empty-icon">📚</div><h3>Belum ada dokumen</h3></div>'; return; }
    const filteredData = currentFilter === 'all' ? data : data.filter(doc => doc['Kategori']?.toLowerCase() === currentFilter);
    const searchTerm = document.getElementById('searchDokumen')?.value.toLowerCase() || '';
    const searchedData = filteredData.filter(doc => doc['Judul']?.toLowerCase().includes(searchTerm) || doc['Deskripsi']?.toLowerCase().includes(searchTerm));
    grid.innerHTML = searchedData.map((doc) => {
        const category = doc['Kategori']?.toLowerCase() || 'internal';
        const icon = getDocIcon(category);
        const linkView = isValidLink(doc['Link View']) ? doc['Link View'].trim() : (isValidLink(doc['Link Download']) ? doc['Link Download'].trim() : null);
        const linkDownload = isValidLink(doc['Link Download']) ? doc['Link Download'].trim() : null;
        let tanggalUpdate = '-';
        if (doc['Tanggal Update']) { const date = new Date(doc['Tanggal Update']); tanggalUpdate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
        return `<div class="doc-item" data-category="${category}">
            <div class="doc-header"><div class="doc-icon">${icon}</div><div class="doc-info"><div class="doc-title">${escapeHtml(doc['Judul'])}</div><span class="doc-category">${category}</span></div></div>
            <div class="doc-meta">
                <div class="doc-meta-item"><span>📅</span><span>Update: ${tanggalUpdate}</span></div>
                ${doc['Ukuran'] ? `<div class="doc-meta-item"><span>💾</span><span>${doc['Ukuran']}</span></div>` : ''}
            </div>
            ${doc['Deskripsi'] ? `<p style="font-size:13px;color:#666;margin:10px 0;">${escapeHtml(doc['Deskripsi'])}</p>` : ''}
            <div class="doc-actions-grid">
                ${linkView ? `<a href="${linkView}" target="_blank" class="btn-doc-action btn-view"><i class="fas fa-eye"></i> Lihat</a>` : ''}
                ${linkDownload ? `<a href="${linkDownload}" download class="btn-doc-action btn-download-doc"><i class="fas fa-download"></i> Download</a>` : ''}
            </div>
        </div>`;
    }).join('');
    const searchInput = document.getElementById('searchDokumen'); 
    if (searchInput) searchInput.addEventListener('input', () => loadDokumen());
}

// ===== INFO & MEMO =====
function formatInfoContent(text) {
    if (!text) return ''; let formatted = escapeHtml(text);
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

function renderInfoBoard(containerId, allowedCategories, searchId) {
    const board = document.getElementById(containerId); if (!board) return;
    let data = globalData.info || [];
    if (allowedCategories !== 'all') { data = data.filter(item => allowedCategories.includes((item['Kategori'] || '').toLowerCase())); }
    const searchTerm = document.getElementById(searchId)?.value.toLowerCase() || '';
    if (searchTerm) { data = data.filter(item => item['Judul']?.toLowerCase().includes(searchTerm) || item['Isi']?.toLowerCase().includes(searchTerm)); }
    if (data.length === 0) { board.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📭</div><h3>Tidak ada informasi</h3></div>'; return; }
    data.sort((a, b) => { const dateA = new Date(a['Tanggal'] || 0); const dateB = new Date(b['Tanggal'] || 0); return dateB - dateA; });
    board.innerHTML = data.map((item, idx) => {
        const judul = escapeHtml(item['Judul'] || 'Tanpa Judul'); const isi = item['Isi'] || '';
        const kategori = (item['Kategori'] || 'pengumuman').toLowerCase(); const prioritas = (item['Prioritas'] || 'normal').toLowerCase();
        const penulis = item['Penulis'] || 'Admin';
        const tanggal = item['Tanggal'] ? new Date(item['Tanggal']).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        const itemId = `info-content-${containerId}-${idx}`;
        const kategoriLabel = { pengumuman: '📢 Pengumuman', memo: '📝 Memo', catatan: '📒 Catatan', penting: '⚠️ Penting', update: '🔄 Update' }[kategori] || kategori;
        const prioritasLabel = { mendesak: '🔥 Mendesak', penting: '⚡ Penting', normal: '✅ Normal' }[prioritas] || '✅ Normal';
        const contentFormatted = formatInfoContent(isi); const isLong = isi.length > 400;
        const shareText = encodeURIComponent(`*${item['Judul']}*\n\n${isi}\n\n— ${penulis} (${tanggal})\n_Dari Portal SPPG JATIAN_`);
        return `<div class="info-item priority-${prioritas}">
            <div class="info-item-header"><div class="info-item-title">${judul}</div>
            <div class="info-item-badges"><span class="info-badge kategori-${kategori}">${kategoriLabel}</span><span class="info-badge priority-${prioritas}">${prioritasLabel}</span></div></div>
            <div class="info-item-meta"><div class="info-meta-item">👤 <strong>${escapeHtml(penulis)}</strong></div><div class="info-meta-item">📅 ${tanggal}</div></div>
            <div class="info-item-content ${isLong ? 'collapsed' : ''}" id="${itemId}">${contentFormatted}</div>
            ${isLong ? `<button class="info-toggle-btn" onclick="toggleInfoContent('${itemId}', this)">📖 Baca Selengkapnya</button>` : ''}
            <div class="info-item-footer"><a href="https://wa.me/?text=${shareText}" target="_blank" class="info-share-btn"><i class="fab fa-whatsapp"></i> Bagikan via WA</a></div>
        </div>`;
    }).join('');
}

function toggleInfoContent(id, btn) {
    const el = document.getElementById(id);
    if (el.classList.contains('collapsed')) { el.classList.remove('collapsed'); btn.innerHTML = '📕 Tutup'; }
    else { el.classList.add('collapsed'); btn.innerHTML = '📖 Baca Selengkapnya'; el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

async function loadInfoData() {
    const data = await fetchSheetData(SHEET_URLS.info);
    globalData.info = data;
    renderInfoBoard('infoPengumumanBoard', ['pengumuman', 'update', 'penting'], 'searchInfoPengumuman');
    renderInfoBoard('memoCatatanBoard', ['memo', 'catatan'], 'searchMemoCatatan');
    const searchInfo = document.getElementById('searchInfoPengumuman'); if (searchInfo) searchInfo.addEventListener('input', () => renderInfoBoard('infoPengumumanBoard', ['pengumuman', 'update', 'penting'], 'searchInfoPengumuman'));
    const searchMemo = document.getElementById('searchMemoCatatan'); if (searchMemo) searchMemo.addEventListener('input', () => renderInfoBoard('memoCatatanBoard', ['memo', 'catatan'], 'searchMemoCatatan'));
}

// ===== MENU MINGGUAN =====
function filterMenuWeek(day, btn) { currentMenuFilter = day; document.querySelectorAll('.menu-week-btn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); renderMenuWeekly(); }
function getDayIcon(dayName) { const icons = { 'senin': '🌟', 'selasa': '🔥', 'rabu': '💎', 'kamis': '🌸', 'jumat': '🕌', 'sabtu': '🌈', 'minggu': '☀️' }; return icons[dayName.toLowerCase()] || '📅'; }
function formatDateIndo(dateStr) { if (!dateStr) return '-'; const date = new Date(dateStr); if (isNaN(date.getTime())) return dateStr; return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
function getDayNameFromTanggal(dateStr) { if (!dateStr) return ''; const date = new Date(dateStr); if (isNaN(date.getTime())) return ''; return date.toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase(); }

async function loadMenuWeekly() {
    const container = document.getElementById('menuWeeklyContainer'); if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat menu mingguan...</p>';
    try {
        const data = await fetchSheetData(SHEET_URLS.menu);
        if (data.length === 0) { container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📅</div><h3>Belum ada menu</h3></div>'; return; }
        const menuByDate = {};
        data.forEach(row => {
            const tanggal = row['Tanggal'] || ''; const menu = row['Menu'] || '';
            const publishedBy = row['Dipublikasi'] || row['Penulis'] || row['Ahli Gizi'] || 'Ahli Gizi';
            if (tanggal && menu && !menuByDate[tanggal]) { menuByDate[tanggal] = { menu: menu, publishedBy: publishedBy }; }
        });
        let displayDates = Object.keys(menuByDate);
        if (currentMenuFilter !== 'all') { displayDates = displayDates.filter(date => getDayNameFromTanggal(date) === currentMenuFilter); }
        if (displayDates.length === 0) { container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📭</div><h3>Tidak ada menu</h3></div>'; return; }
        displayDates.sort((a, b) => new Date(a) - new Date(b));
        container.innerHTML = displayDates.map(date => {
            const info = menuByDate[date];
            const menuItems = info.menu ? info.menu.split('+').map(m => m.trim()).filter(m => m) : [];
            const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'long' });
            return `<div class="menu-day-card">
                <div class="menu-day-header">
                    <div class="menu-day-icon">${getDayIcon(dayName)}</div>
                    <div class="menu-day-title"><h3>${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</h3><div class="menu-day-date">${formatDateIndo(date)}</div></div>
                </div>
                <div class="menu-items"><h4>🍽️ Menu Hari Ini</h4><div class="menu-list">${menuItems.map(item => `<span class="menu-item-tag">${escapeHtml(item)}</span>`).join('')}</div></div>
                <div class="menu-published">👨‍🍳 Dipublikasi oleh: <strong>${escapeHtml(info.publishedBy)}</strong></div>
            </div>`;
        }).join('');
    } catch (error) { console.error('Error loading menu:', error); container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">⚠️</div><h3>Gagal memuat menu</h3></div>'; }
}
function renderMenuWeekly() { loadMenuWeekly(); }

// ===== RUTE DISTRIBUSI =====
async function loadRuteDistribusi() {
    const container = document.getElementById('ruteContent'); if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat data rute...</p>';
    try {
        const data = await fetchSheetData(SHEET_URLS.rute);
        if (data.length === 0) { container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">🚚</div><h3>Belum ada data rute</h3></div>'; return; }
        const selatan = data.filter(row => (row['Rute'] || '').toLowerCase().trim() === 'selatan');
        const utara = data.filter(row => (row['Rute'] || '').toLowerCase().trim() === 'utara');
        const totalSelatan = { sekolah: selatan.length, pk: selatan.reduce((sum, row) => sum + (parseInt(row['PK']) || 0), 0), pb: selatan.reduce((sum, row) => sum + (parseInt(row['PB']) || 0), 0), total: selatan.reduce((sum, row) => sum + (parseInt(row['Total']) || 0), 0) };
        const totalUtara = { sekolah: utara.length, pk: utara.reduce((sum, row) => sum + (parseInt(row['PK']) || 0), 0), pb: utara.reduce((sum, row) => sum + (parseInt(row['PB']) || 0), 0), total: utara.reduce((sum, row) => sum + (parseInt(row['Total']) || 0), 0) };
        const grandTotal = { pk: totalSelatan.pk + totalUtara.pk, pb: totalSelatan.pb + totalUtara.pb, total: totalSelatan.total + totalUtara.total };
        const renderTable = (rows) => rows.map(row => `<tr><td><strong>${escapeHtml(row['Sekolah'])}</strong></td><td class="center">${row['PK'] || 0}</td><td class="center">${row['PB'] || 0}</td><td class="center"><strong>${row['Total'] || 0}</strong></td></tr>`).join('');
        container.innerHTML = `<div class="rute-summary-grid">
            <div class="rute-summary-card south"><h3>🚌 Jalur Selatan</h3>
                <div class="rute-summary-stats">
                    <div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${totalSelatan.sekolah}</span></div>
                    <div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${totalSelatan.pk}</span></div>
                    <div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${totalSelatan.pb}</span></div>
                </div>
                <div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${totalSelatan.total}</span></div>
            </div>
            <div class="rute-summary-card north"><h3>🚐 Jalur Utara</h3>
                <div class="rute-summary-stats">
                    <div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${totalUtara.sekolah}</span></div>
                    <div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${totalUtara.pk}</span></div>
                    <div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${totalUtara.pb}</span></div>
                </div>
                <div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${totalUtara.total}</span></div>
            </div>
        </div>
        <div class="rute-tables-grid">
            <div class="rute-table-wrapper south"><table class="rute-table"><thead><tr><th colspan="4">🚌 Distribusi Jalur Selatan</th></tr><tr><th>Sekolah</th><th class="center">PK</th><th class="center">PB</th><th class="center">Total</th></tr></thead><tbody>${renderTable(selatan)}</tbody><tfoot><tr><td>TOTAL SELATAN</td><td class="center">${totalSelatan.pk}</td><td class="center">${totalSelatan.pb}</td><td class="center">${totalSelatan.total}</td></tr></tfoot></table></div>
            <div class="rute-table-wrapper north"><table class="rute-table"><thead><tr><th colspan="4">🚐 Distribusi Jalur Utara</th></tr><tr><th>Sekolah</th><th class="center">PK</th><th class="center">PB</th><th class="center">Total</th></tr></thead><tbody>${renderTable(utara)}</tbody><tfoot><tr><td>TOTAL UTARA</td><td class="center">${totalUtara.pk}</td><td class="center">${totalUtara.pb}</td><td class="center">${totalUtara.total}</td></tr></tfoot></table></div>
        </div>
        <div class="rute-total-box"><h3>📊 TOTAL KESELURUHAN</h3>
            <div class="rute-total-stats">
                <div class="rute-total-item"><span class="rute-total-label">Total PK</span><span class="rute-total-value">${grandTotal.pk}</span></div>
                <div class="rute-total-item"><span class="rute-total-label">Total PB</span><span class="rute-total-value">${grandTotal.pb}</span></div>
                <div class="rute-total-item"><span class="rute-total-label">Grand Total</span><span class="rute-total-value">${grandTotal.total}</span></div>
            </div>
        </div>`;
    } catch (error) { console.error('Error loading rute:', error); container.innerHTML = '<p style="text-align:center;padding:40px;color:#dc3545;">⚠️ Gagal memuat data rute</p>'; }
}

// ===== DATA LOADERS =====
async function loadQuote() { const data = await fetchSheetData(SHEET_URLS.quote); if (data.length > 0) { const random = data[Math.floor(Math.random() * data.length)]; document.getElementById('quoteText').textContent = random['Quote'] || random[Object.keys(random)[0]]; } }
async function loadPengumuman() { const data = await fetchSheetData(SHEET_URLS.pengumuman); document.getElementById('runningText').textContent = data.length === 0 ? 'Tidak ada pengumuman.' : data.map(r => `📢 ${r['Judul'] || ''}: ${r['Isi'] || ''}`).join(' • '); }
async function loadAgenda() {
    const data = await fetchSheetData(SHEET_URLS.agenda); const agendaList = document.getElementById('agendaList');
    if (data.length === 0) { agendaList.innerHTML = '<p>Tidak ada agenda.</p>'; return; }
    const sorted = data.sort((a, b) => (a['Tanggal'] || '').localeCompare(b['Tanggal'] || '')); const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    agendaList.innerHTML = sorted.map(row => { const date = new Date(row['Tanggal']); const day = date.getDate() || '-'; const month = bulan[date.getMonth()] || ''; return `<div class="agenda-item"><div class="agenda-date"><div class="day">${day}</div><div class="month">${month}</div></div><div class="agenda-info"><h4>${escapeHtml(row['Kegiatan'])}</h4><p>${escapeHtml(row['Keterangan'])}</p></div></div>`; }).join('');
}
async function loadBirthday() {
    const data = globalData.relawan; if (!data || data.length === 0) return;
    const today = new Date(); const todayMonth = today.getMonth() + 1; const todayDay = today.getDate();
    const birthdayPersons = data.filter(row => { const tglLahir = row['Tanggal Lahir']; if (!tglLahir) return false; const date = new Date(tglLahir); return (date.getMonth() + 1) === todayMonth && date.getDate() === todayDay; });
    if (birthdayPersons.length > 0) {
        const names = birthdayPersons.map(p => p['Nama']).join(', '); document.getElementById('birthdayText').textContent = `🎈 ${names} 🎈`;
        const firstPerson = birthdayPersons[0]; const waNumber = cleanWA(firstPerson['Nomor WA']);
        if (waNumber) { const message = encodeURIComponent(`Halo ${firstPerson['Nama']}! 🎉 Selamat ulang tahun! Semoga sehat selalu. - Dari SPPG Jatian`); document.getElementById('birthdayWaLink').href = `https://wa.me/${waNumber}?text=${message}`; document.getElementById('birthdayCard').style.display = 'flex'; }
    }
}
async function loadStaff() {
    const tbody = document.querySelector('#tableStaff tbody'); if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">⏳ Memuat data...</td></tr>';
    const data = await fetchSheetData(SHEET_URLS.relawan); globalData.relawan = data;
    if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">⚠️ Data tidak tersedia</td></tr>'; return; }
    tbody.innerHTML = data.map((row, i) => {
        const waNumber = cleanWA(row['Nomor WA']);
        const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">${escapeHtml(row['Nomor WA'])}</a>` : '<span style="color:#999;">-</span>';
        return `<tr><td>${i + 1}</td><td><strong>${escapeHtml(row['Nama'])}</strong></td><td>${waCell}</td><td>${escapeHtml(row['Email'])}</td><td>${escapeHtml(row['Posisi'])}</td></tr>`;
    }).join('');
    document.getElementById('searchStaff').addEventListener('input', (e) => filterTable(e, tbody));
    loadBirthday();
}
async function loadKontakDarurat() {
    const container = document.getElementById('daruratContent'); if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat kontak darurat...</p>';
    const data = await fetchSheetData(SHEET_URLS.kontak);
    if (data.length === 0) { container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">☎️</div><h3>Belum ada data kontak</h3><p>Silakan tambahkan data di Spreadsheet "Kontak"</p></div>'; return; }
    container.innerHTML = data.map(row => {
        const waNumber = cleanWA(row['Nomor WA']);
        const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" class="birthday-btn" style="margin-top:10px;"><i class="fab fa-whatsapp"></i> Hubungi via WA</a>` : '';
        return `<div class="info-card"><h3>☎️ ${escapeHtml(row['Nama'])}</h3><p><strong>${escapeHtml(row['Jabatan'])}</strong></p><p>💬 ${waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank">${escapeHtml(row['Nomor WA'])}</a>` : 'Tidak ada'}</p>${waCell}</div>`;
    }).join('');
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
    const currentYear = new Date().getFullYear();
    document.getElementById('footerYear').textContent = currentYear;
    
    await loadStaff();
    await loadKontakDarurat();
    loadDokumen();
    loadInfoData();
    loadMenuWeekly();
    loadRuteDistribusi();
    loadQuote();
    loadPengumuman();
    loadAgenda();
    updateClock();
    
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sidebarOpen) toggleMenu(); });

    // ===== DOWNLOAD PNG FEATURE =====
    const btnDownload = document.getElementById('btnDownloadRute');
    if (btnDownload) {
        btnDownload.addEventListener('click', async () => {
            const element = document.getElementById('ruteContent');
            if (!element) return;
            const originalText = btnDownload.innerHTML;
            btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            btnDownload.disabled = true;
            try {
                const canvas = await html2canvas(element, {
                    scale: 3,
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight
                });
                const link = document.createElement('a');
                link.download = 'Rute-Distribusi-SPPG-Jatian.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Gagal mengunduh gambar:', error);
                alert('Gagal mengunduh gambar. Silakan coba lagi.');
            } finally {
                btnDownload.innerHTML = originalText;
                btnDownload.disabled = false;
            }
        });
    }

    // ===== LIVE CHAT EVENT LISTENER =====
    const startBtn = document.querySelector('.chat-start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', handleStartChat);
    }
});
