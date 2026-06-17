// ===== CONFIGURATION =====
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

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function isValidLink(url) {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
}

async function fetchSheetData(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const rows = text.trim().split('\n');
        const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row = {};
            headers.forEach((h, idx) => row[h] = values[idx] || '');
            data.push(row);
        }
        return data;
    } catch (error) {
        console.error('Gagal mengambil data:', error);
        return [];
    }
}

function getDayNameFromTanggal(dateStr) {
    if (!dateStr) return '';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : days[d.getDay()];
}

// ===== SIDEBAR & NAVIGATION =====
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

function showHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toggleMenu();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebarOpen) toggleMenu();
});

// ===== CLOCK & DASHBOARD =====
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const clockEl = document.getElementById('realtimeClock');
    const dateEl = document.getElementById('currentDate');
    if (clockEl) clockEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
}

async function loadQuote() {
    const data = await fetchSheetData(SHEET_URLS.quote);
    if (data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)];
        const el = document.getElementById('quoteText');
        if (el) el.textContent = random['Quote'] || random[Object.keys(random)[0]] || '';
    }
}

async function loadPengumuman() {
    const data = await fetchSheetData(SHEET_URLS.pengumuman);
    const el = document.getElementById('runningText');
    if (el) {
        el.textContent = data.length === 0 ? 'Tidak ada pengumuman.' : data.map(r => `📢 ${r['Judul'] || ''}: ${r['Isi'] || ''}`).join(' • ');
    }
}

async function loadAgenda() {
    const data = await fetchSheetData(SHEET_URLS.agenda);
    const agendaList = document.getElementById('agendaList');
    if (!agendaList) return;
    if (data.length === 0) {
        agendaList.innerHTML = '<p>Tidak ada agenda.</p>';
        return;
    }
    const sorted = data.sort((a, b) => (a['Tanggal'] || '').localeCompare(b['Tanggal'] || ''));
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    agendaList.innerHTML = sorted.map(row => {
        const date = new Date(row['Tanggal']);
        const day = date.getDate();
        const month = bulan[date.getMonth()];
        return `<div class="agenda-item">
            <div class="agenda-date"><span class="day">${day}</span><span class="month">${month}</span></div>
            <div class="agenda-info"><h4>${escapeHtml(row['Judul'] || 'Tanpa Judul')}</h4><p>${escapeHtml(row['Lokasi'] || '')}</p></div>
        </div>`;
    }).join('');
}

function loadBirthday() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const birthdayList = document.getElementById('birthdayList');
    if (!birthdayList || !globalData.relawan) return;

    const birthdays = globalData.relawan.filter(r => {
        const bday = r['Tanggal Lahir'] || r['TTL'] || '';
        const parts = bday.split('/').map(Number);
        return parts[1] === month && parts[0] === day;
    });

    if (birthdays.length === 0) {
        birthdayList.innerHTML = '<p style="color:#888;">Tidak ada ultah hari ini 🎂</p>';
        return;
    }

    birthdayList.innerHTML = birthdays.map(b => {
        const wa = (b['Nomor WA'] || '').replace(/\D/g, '').replace(/^0/, '62');
        const msg = encodeURIComponent(`Selamat ulang tahun ${b['Nama']}! 🎉 Semoga sehat & sukses selalu. 🎂✨`);
        return `<div class="birthday-card">
            <h4>🎂 ${escapeHtml(b['Nama'])}</h4>
            <a href="https://wa.me/${wa}?text=${msg}" target="_blank" class="btn-wa-ucap">📲 Kirim Ucapan</a>
        </div>`;
    }).join('');
}

// ===== STAFF & CONTACTS =====
async function loadStaff() {
    const data = await fetchSheetData(SHEET_URLS.relawan);
    globalData.relawan = data;
    const tbody = document.getElementById('staffTableBody');
    if (!tbody) return;
    tbody.innerHTML = data.map((row, i) => {
        const wa = (row['Nomor WA'] || '').replace(/\D/g, '').replace(/^0/, '62');
        const waCell = wa ? `<a href="https://wa.me/${wa}" target="_blank">Chat WA</a>` : '-';
        return `<tr>
            <td>${i + 1}</td>
            <td><strong>${escapeHtml(row['Nama'] || '-')}</strong></td>
            <td>${waCell}</td>
            <td>${escapeHtml(row['Email'] || '-')}</td>
            <td>${escapeHtml(row['Posisi'] || '-')}</td>
        </tr>`;
    }).join('');
    document.getElementById('searchStaff')?.addEventListener('input', (e) => filterTable(e, tbody));
    loadBirthday();
}

function filterTable(e, tbody) {
    const term = e.target.value.toLowerCase();
    Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
}

async function loadKontakDarurat() {
    const data = await fetchSheetData(SHEET_URLS.kontak);
    const container = document.getElementById('kontakDaruratGrid');
    if (!container) return;
    container.innerHTML = data.map(k => {
        const wa = (k['Nomor'] || '').replace(/\D/g, '').replace(/^0/, '62');
        return `<div class="contact-card">
            <h3>${escapeHtml(k['Jabatan'] || 'Kontak')}</h3>
            <p>${escapeHtml(k['Nama'] || '')}</p>
            <a href="https://wa.me/${wa}" target="_blank" class="btn-contact-wa">📞 ${escapeHtml(k['Nomor'] || '-')}</a>
        </div>`;
    }).join('');
}

// ===== DOCUMENTS =====
function filterDokumen(category, btn) {
    currentFilter = category;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    loadDokumen();
}

function getDocIcon(category) {
    const icons = { sop: '📋', template: '📝', form: '📊', sk: '📜', panduan: '📖', internal: '📁' };
    return icons[category] || '📄';
}

async function loadDokumen() {
    const grid = document.getElementById('docGrid');
    if (!grid) return;
    grid.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">⏳ Memuat dokumen...</p>';
    const data = await fetchSheetData(SHEET_URLS.dokumen);
    if (data.length === 0) {
        grid.innerHTML = '<div class="doc-empty"><div class="doc-empty-icon">📚</div><h3>Belum ada dokumen</h3></div>';
        return;
    }
    const filteredData = currentFilter === 'all' ? data : data.filter(doc => doc['Kategori']?.toLowerCase() === currentFilter);
    const searchTerm = document.getElementById('searchDokumen')?.value.toLowerCase() || '';
    const searchedData = filteredData.filter(doc => doc['Judul']?.toLowerCase().includes(searchTerm) || doc['Deskripsi']?.toLowerCase().includes(searchTerm));
    grid.innerHTML = searchedData.map(doc => {
        const category = doc['Kategori']?.toLowerCase() || 'internal';
        const icon = getDocIcon(category);
        const linkView = isValidLink(doc['Link View']) ? doc['Link View'].trim() : (isValidLink(doc['Link Download']) ? doc['Link Download'].trim() : null);
        const linkDownload = isValidLink(doc['Link Download']) ? doc['Link Download'].trim() : null;
        let tanggalUpdate = '-';
        if (doc['Tanggal Update']) {
            const date = new Date(doc['Tanggal Update']);
            tanggalUpdate = isNaN(date.getTime()) ? doc['Tanggal Update'] : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return `<div class="doc-item" data-category="${category}">
            <div class="doc-header">
                <div class="doc-icon">${icon}</div>
                <div class="doc-info">
                    <div class="doc-title">${escapeHtml(doc['Judul'])}</div>
                    <span class="doc-category">${category}</span>
                </div>
            </div>
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
}

// ===== INFO & MEMO =====
function formatInfoContent(text) {
    if (!text) return '';
    let formatted = escapeHtml(text);
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

function renderInfoBoard(containerId, allowedCategories, searchId) {
    const board = document.getElementById(containerId);
    if (!board) return;
    let data = globalData.info || [];
    if (allowedCategories !== 'all') {
        data = data.filter(item => allowedCategories.includes((item['Kategori'] || '').toLowerCase()));
    }
    const searchTerm = document.getElementById(searchId)?.value.toLowerCase() || '';
    if (searchTerm) {
        data = data.filter(item => item['Judul']?.toLowerCase().includes(searchTerm) || item['Isi']?.toLowerCase().includes(searchTerm));
    }
    if (data.length === 0) {
        board.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📭</div><h3>Tidak ada informasi</h3></div>';
        return;
    }
    data.sort((a, b) => new Date(b['Tanggal'] || 0) - new Date(a['Tanggal'] || 0));
    board.innerHTML = data.map((item, idx) => {
        const judul = escapeHtml(item['Judul'] || 'Tanpa Judul');
        const isi = item['Isi'] || '';
        const kategori = (item['Kategori'] || 'pengumuman').toLowerCase();
        const prioritas = (item['Prioritas'] || 'normal').toLowerCase();
        const penulis = item['Penulis'] || 'Admin';
        const tanggal = item['Tanggal'] ? new Date(item['Tanggal']).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        const itemId = `info-content-${containerId}-${idx}`;
        const kategoriLabel = { pengumuman: '📢 Pengumuman', memo: '📝 Memo', catatan: '📒 Catatan', penting: '⚠️ Penting', update: '🔄 Update' }[kategori] || kategori;
        const prioritasLabel = { mendesak: '🔥 Mendesak', penting: '⚡ Penting', normal: '✅ Normal' }[prioritas] || '✅ Normal';
        const contentFormatted = formatInfoContent(isi);
        const isLong = isi.length > 400;
        const shareText = encodeURIComponent(`*${item['Judul']}*\n\n${isi}\n\n— ${penulis} (${tanggal})\n_Dari Portal SPPG JATIAN_`);
        return `<div class="info-item">
            <div class="info-header">
                <span class="info-badge ${kategori}">${kategoriLabel}</span>
                <span class="info-badge priority ${prioritas}">${prioritasLabel}</span>
            </div>
            <h3 class="info-item-title">${judul}</h3>
            <p class="info-meta">👤 ${penulis} • 📅 ${tanggal}</p>
            <div class="info-content ${isLong ? 'collapsed' : ''}" id="${itemId}">${contentFormatted}</div>
            ${isLong ? `<button class="btn-read-more" onclick="toggleInfoContent('${itemId}', this)">📖 Baca Selengkapnya</button>` : ''}
            <div class="info-actions">
                <a href="https://wa.me/?text=${shareText}" target="_blank" class="btn-share-wa">📤 Bagikan WA</a>
            </div>
        </div>`;
    }).join('');
}

function toggleInfoContent(id, btn) {
    const el = document.getElementById(id);
    if (el.classList.contains('collapsed')) {
        el.classList.remove('collapsed');
        btn.innerHTML = '📕 Tutup';
    } else {
        el.classList.add('collapsed');
        btn.innerHTML = '📖 Baca Selengkapnya';
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

async function loadInfoData() {
    const data = await fetchSheetData(SHEET_URLS.info);
    globalData.info = data;
    renderInfoBoard('infoPengumumanBoard', ['pengumuman', 'update', 'penting'], 'searchInfoPengumuman');
    renderInfoBoard('memoCatatanBoard', ['memo', 'catatan'], 'searchMemoCatatan');
    document.getElementById('searchInfoPengumuman')?.addEventListener('input', () => renderInfoBoard('infoPengumumanBoard', ['pengumuman', 'update', 'penting'], 'searchInfoPengumuman'));
    document.getElementById('searchMemoCatatan')?.addEventListener('input', () => renderInfoBoard('memoCatatanBoard', ['memo', 'catatan'], 'searchMemoCatatan'));
}

// ===== WEEKLY MENU =====
function filterMenuWeek(day, btn) {
    currentMenuFilter = day;
    document.querySelectorAll('.menu-week-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderMenuWeekly();
}

function getDayIcon(dayName) {
    const icons = { 'senin': '🌟', 'selasa': '🔥', 'rabu': '💎', 'kamis': '🌸', 'jumat': '🕌', 'sabtu': '🌈', 'minggu': '☀️' };
    return icons[dayName.toLowerCase()] || '📅';
}

function formatDateIndo(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function loadMenuWeekly() {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat menu mingguan...</p>';
    try {
        const data = await fetchSheetData(SHEET_URLS.menu);
        if (data.length === 0) {
            container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📅</div><h3>Belum ada menu</h3></div>';
            return;
        }
        const menuByDate = {};
        data.forEach(row => {
            const tanggal = row['Tanggal'] || '';
            const menu = row['Menu'] || '';
            const publishedBy = row['Dipublikasi'] || row['Penulis'] || row['Ahli Gizi'] || 'Ahli Gizi';
            if (tanggal && menu && !menuByDate[tanggal]) {
                menuByDate[tanggal] = { menu: menu, publishedBy: publishedBy };
            }
        });
        let displayDates = Object.keys(menuByDate);
        if (currentMenuFilter !== 'all') {
            displayDates = displayDates.filter(date => getDayNameFromTanggal(date) === currentMenuFilter);
        }
        if (displayDates.length === 0) {
            container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📭</div><h3>Tidak ada menu</h3></div>';
            return;
        }
        displayDates.sort((a, b) => new Date(a) - new Date(b));
        container.innerHTML = displayDates.map(date => {
            const info = menuByDate[date];
            const menuItems = info.menu ? info.menu.split('+').map(m => m.trim()).filter(m => m) : [];
            const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'long' });
            return `<div class="menu-day-card">
                <div class="menu-day-header">
                    <div class="menu-day-icon">${getDayIcon(dayName)}</div>
                    <div class="menu-day-title">
                        <h3>${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</h3>
                        <div class="menu-day-date">${formatDateIndo(date)}</div>
                    </div>
                </div>
                <div class="menu-items">
                    <h4>🍽️ Menu Hari Ini</h4>
                    <div class="menu-list">${menuItems.map(item => `<span class="menu-item-tag">${escapeHtml(item)}</span>`).join('')}</div>
                </div>
                <div class="menu-published">👨‍🍳 Dipublikasi oleh: <strong>${escapeHtml(info.publishedBy)}</strong></div>
            </div>`;
        }).join('');
    } catch (error) {
        console.error('Error loading menu:', error);
        container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">⚠️</div><h3>Gagal memuat menu</h3></div>';
    }
}
function renderMenuWeekly() { loadMenuWeekly(); }

// ===== RUTE DISTRIBUSI =====
async function loadRuteDistribusi() {
    const container = document.getElementById('ruteContent');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat data rute...</p>';
    try {
        const data = await fetchSheetData(SHEET_URLS.rute);
        if (data.length === 0) {
            container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">🚚</div><h3>Belum ada data rute</h3></div>';
            return;
        }
        const selatan = data.filter(row => (row['Rute'] || '').toLowerCase().trim() === 'selatan');
        const utara = data.filter(row => (row['Rute'] || '').toLowerCase().trim() === 'utara');
        const totalSelatan = { sekolah: selatan.length, pk: selatan.reduce((sum, row) => sum + (parseInt(row['PK']) || 0), 0), pb: selatan.reduce((sum, row) => sum + (parseInt(row['PB']) || 0), 0), total: selatan.reduce((sum, row) => sum + (parseInt(row['Total']) || 0), 0) };
        const totalUtara = { sekolah: utara.length, pk: utara.reduce((sum, row) => sum + (parseInt(row['PK']) || 0), 0), pb: utara.reduce((sum, row) => sum + (parseInt(row['PB']) || 0), 0), total: utara.reduce((sum, row) => sum + (parseInt(row['Total']) || 0), 0) };
        const grandTotal = { pk: totalSelatan.pk + totalUtara.pk, pb: totalSelatan.pb + totalUtara.pb, total: totalSelatan.total + totalUtara.total };
        const renderTable = (rows) => rows.map(row => `<tr><td><strong>${escapeHtml(row['Sekolah'])}</strong></td><td class="center">${row['PK'] || 0}</td><td class="center">${row['PB'] || 0}</td><td class="center"><strong>${row['Total'] || 0}</strong></td></tr>`).join('');
        container.innerHTML = `<div class="rute-summary-grid">
            <div class="rute-summary-card south">
                <h3>🚌 Jalur Selatan</h3>
                <div class="rute-summary-stats">
                    <div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${totalSelatan.sekolah}</span></div>
                    <div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${totalSelatan.pk}</span></div>
                    <div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${totalSelatan.pb}</span></div>
                    <div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${totalSelatan.total}</span></div>
                </div>
            </div>
            <div class="rute-summary-card north">
                <h3>🚐 Jalur Utara</h3>
                <div class="rute-summary-stats">
                    <div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${totalUtara.sekolah}</span></div>
                    <div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${totalUtara.pk}</span></div>
                    <div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${totalUtara.pb}</span></div>
                    <div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${totalUtara.total}</span></div>
                </div>
            </div>
        </div>
        <div class="rute-tables-grid">
            <div class="rute-table-wrap"><h3>📍 Daftar Sekolah Selatan</h3><table class="rute-table"><thead><tr><th>Sekolah</th><th>PK</th><th>PB</th><th>Total</th></tr></thead><tbody>${renderTable(selatan)}</tbody></table></div>
            <div class="rute-table-wrap"><h3>📍 Daftar Sekolah Utara</h3><table class="rute-table"><thead><tr><th>Sekolah</th><th>PK</th><th>PB</th><th>Total</th></tr></thead><tbody>${renderTable(utara)}</tbody></table></div>
        </div>
        <div class="rute-total-stats">
            <div class="rute-total-item"><span class="rute-total-label">Grand Total PK</span><span class="rute-total-value">${grandTotal.pk}</span></div>
            <div class="rute-total-item"><span class="rute-total-label">Grand Total PB</span><span class="rute-total-value">${grandTotal.pb}</span></div>
            <div class="rute-total-item"><span class="rute-total-label">Grand Total</span><span class="rute-total-value">${grandTotal.total}</span></div>
        </div>`;
    } catch (error) {
        console.error('Error loading rute:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#dc3545;">⚠️ Gagal memuat data rute</p>';
    }
}

// ===== LIVE CHAT (FEATURE: KODE RAHASIA 31 → ADMIN 🛡️) =====
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
        // loadChatMessages(); // Aktifkan jika Anda punya fungsi pemuat pesan chat
    } else {
        alert('Silakan masukkan nama Anda terlebih dahulu!');
    }
}

// ===== DOWNLOAD PNG FEATURE =====
function setupDownloadRute() {
    const btnDownload = document.getElementById('btnDownloadRute');
    if (!btnDownload) return;
    btnDownload.addEventListener('click', async () => {
        const element = document.getElementById('ruteContent');
        if (!element) return;
        const originalText = btnDownload.innerHTML;
        btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        btnDownload.disabled = true;
        try {
            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#111827' });
            const link = document.createElement('a');
            link.download = 'Rute-Distribusi-SPPG-Jatian.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Gagal mengunduh gambar:', error);
            alert('Gagal mengunduh gambar. Pastikan library html2canvas sudah dimuat.');
        } finally {
            btnDownload.innerHTML = originalText;
            btnDownload.disabled = false;
        }
    });
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
    const currentYear = new Date().getFullYear();
    const footerYear = document.getElementById('footerYear');
    if (footerYear) footerYear.textContent = currentYear;

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
    setInterval(updateClock, 1000);

    // Pasang event listener untuk tombol Mulai Chat
    const startBtn = document.getElementById('btnStartChat') || document.querySelector('.chat-start-btn');
    if (startBtn) startBtn.addEventListener('click', handleStartChat);

    setupDownloadRute();
});
