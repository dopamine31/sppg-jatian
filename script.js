// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyBBTmEXeyfgE-DKg73OmkgroBtp1_NLAOU",
    authDomain: "chat-portal-67948.firebaseapp.com",
    databaseURL: "https://chat-portal-67948-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chat-portal-67948",
    storageBucket: "chat-portal-67948.firebasestorage.app",
    messagingSenderId: "536843661380",
    appId: "1:536843661380:web:4eae78f035d0d21eb4cc11"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const chatMessagesRef = db.ref('portal_chat/messages');
const onlineUsersRef = db.ref('portal_chat/onlineUsers');

// ===== GOOGLE SHEETS URLS =====
const SHEET_URLS = {
    sekolah: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=0&single=true&output=csv',
    relawan: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1957179512&single=true&output=csv',
    koordinator: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1219362365&single=true&output=csv',
    kontak: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=176617983&single=true&output=csv',
    quote: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1582688414&single=true&output=csv',
    pengumuman: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=429943974&single=true&output=csv',
    agenda: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=761655212&single=true&output=csv',
    surat: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1677810962&single=true&output=csv',
    dokumen: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1144895464&single=true&output=csv',
    info: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=515718382&single=true&output=csv',
    menu: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=1196527440&single=true&output=csv',
    rute: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6sp9uAC1QfKdtfMAZfRQeeMqhVOCTc13xMc3YlVQepkuK3XKjTjvrr7t1vWtbV8EoYtrMXrwqTDTF/pub?gid=96960366&single=true&output=csv'
};

let globalData = { relawan: [], sekolah: [], info: [] };
let sidebarOpen = false;
let currentFilter = 'all';
let currentInfoFilter = 'all';
let currentMenuFilter = 'all';

// ===== PIN & SECURITY =====
function checkAuth() { return sessionStorage.getItem('isAuthenticated') === 'true'; }
function showPINModal() { document.getElementById('pinModal').classList.add('active'); document.getElementById('pinInput').value = ''; document.getElementById('pinInput').focus(); }
function hidePINModal() { document.getElementById('pinModal').classList.remove('active'); }
function verifyPIN() {
    const input = document.getElementById('pinInput').value;
    if (input === '2024') {
        sessionStorage.setItem('isAuthenticated', 'true');
        hidePINModal();
        alert('✅ Akses diberikan! Fitur terkunci telah dibuka.');
        loadRelawan(); loadSekolah();
        if (chatUserName && chatRoomActive) updateUserPresence();
    } else {
        alert('❌ PIN salah! Silakan coba lagi.');
        document.getElementById('pinInput').value = '';
        document.getElementById('pinInput').focus();
    }
}
function maskNIK(nik) {
    if (!nik) return '-';
    if (!checkAuth()) {
        const str = String(nik).trim();
        return str.length > 4 ? str.substring(0, 4) + '*'.repeat(str.length - 4) : '*'.repeat(str.length);
    }
    return nik;
}
function checkAndShow(sectionName) {
    if (['surat', 'dokumen'].includes(sectionName) && !checkAuth()) { showPINModal(); return; }
    showSection(sectionName);
}

// ===== COLOR GENERATION =====
function nameToColor(name) {
    if (!name) return 'hsl(330, 65%, 65%)';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash % 360), s = 60 + (Math.abs(hash >> 8) % 20), l = 60 + (Math.abs(hash >> 16) % 15);
    return `hsl(${h}, ${s}%, ${l}%)`;
}
function nameToDarkColor(name) {
    if (!name) return 'hsl(330, 55%, 35%)';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash % 360), s = 50 + (Math.abs(hash >> 8) % 20), l = 30 + (Math.abs(hash >> 16) % 15);
    return `hsl(${h}, ${s}%, ${l}%)`;
}

// ===== SIDEBAR & NAVIGATION =====
function toggleMenu() {
    sidebarOpen = !sidebarOpen;
    document.getElementById('sidebar').classList.toggle('active', sidebarOpen);
    document.getElementById('sidebarOverlay').classList.toggle('active', sidebarOpen);
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
}
function toggleAccordion(header) {
    const group = header.parentElement;
    const content = group.querySelector('.accordion-content');
    const icon = header.querySelector('.accordion-icon');
    const isOpen = group.classList.contains('active');
    document.querySelectorAll('.accordion-group').forEach(g => {
        g.classList.remove('active');
        const c = g.querySelector('.accordion-content');
        const i = g.querySelector('.accordion-icon');
        if (c) c.style.maxHeight = null;
        if (i) i.style.transform = 'rotate(0deg)';
    });
    if (!isOpen) {
        group.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 50 + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
}
function showHome() {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById('section-home').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (sidebarOpen) toggleMenu();
}
function showSection(name) {
    document.getElementById('section-home').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const sec = document.getElementById('section-' + name);
    if (sec) { sec.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (sidebarOpen) toggleMenu();
}

// ===== CLOCK =====
function updateClock() {
    const now = new Date();
    const wib = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + 3600000 * 7);
    document.getElementById('digitalTime').textContent = `${String(wib.getHours()).padStart(2,'0')}:${String(wib.getMinutes()).padStart(2,'0')}:${String(wib.getSeconds()).padStart(2,'0')}`;
    document.getElementById('msDisplay').textContent = String(wib.getMilliseconds()).padStart(3,'0');
    document.getElementById('dateDisplay').textContent = wib.toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    document.getElementById('secondHand').style.transform = `rotate(${(wib.getSeconds()/60)*360}deg)`;
    document.getElementById('minuteHand').style.transform = `rotate(${((wib.getMinutes()+wib.getSeconds()/60)/60)*360}deg)`;
    document.getElementById('hourHand').style.transform = `rotate(${((wib.getHours()%12+wib.getMinutes()/60)/12)*360}deg)`;
}
setInterval(updateClock, 10);

// ===== CSV & UTILS =====
function parseCSV(text) {
    const rows = []; let row = [], field = '', inQ = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i], n = text[i+1];
        if (c === '"' && n === '"') { field += '"'; i++; }
        else if (c === ',' && !inQ) { row.push(field.trim()); field = ''; }
        else if ((c === '\n' || c === '\r') && !inQ) {
            if (c === '\r' && n === '\n') i++;
            row.push(field.trim());
            if (row.some(f => f !== '')) rows.push(row);
            row = []; field = '';
        } else { field += c; }
    }
    if (field || row.length) { row.push(field.trim()); if (row.some(f => f !== '')) rows.push(row); }
    if (rows.length < 2) return [];
    const headers = rows[0];
    return rows.slice(1).map(r => { const obj = {}; headers.forEach((h, i) => obj[h] = r[i] || ''); return obj; });
}
async function fetchSheetData(url) {
    try { const res = await fetch(url); return res.ok ? parseCSV(await res.text()) : []; }
    catch (e) { console.error('Sheet error:', e); return []; }
}
function escapeHtml(t) { if (!t) return '-'; const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function cleanWA(n) { if (!n) return ''; let c = String(n).replace(/\D/g, ''); return c.startsWith('0') ? '62' + c.slice(1) : c; }
function isValidLink(l) { return l && l.trim() !== '-' && l.trim().toLowerCase() !== 'null'; }
function filterTable(e, tbody) { const q = e.target.value.toLowerCase(); tbody.querySelectorAll('tr').forEach(tr => tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none'); }

// ===== DATA LOADERS =====
async function loadSekolah() {
    const tbody = document.querySelector('#tableSekolah tbody'); if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">⏳ Memuat data...</td></tr>';
    const data = await fetchSheetData(SHEET_URLS.sekolah); globalData.sekolah = data;
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">⚠️ Data kosong</td></tr>'; return; }
    tbody.innerHTML = data.map((r, i) => {
        const maps = isValidLink(r['Link Maps']) ? `<a href="${r['Link Maps'].trim()}" target="_blank">📍 Maps</a>` : '<span style="color:#999;">-</span>';
        const wa = cleanWA(r['WA PIC']) ? `<a href="https://wa.me/${cleanWA(r['WA PIC'])}" target="_blank">💬 ${escapeHtml(r['WA PIC'])}</a>` : '<span style="color:#999;">-</span>';
        return `<tr><td>${i+1}</td><td><strong>${escapeHtml(r['Nama Sekolah'])}</strong></td><td>${escapeHtml(r['Nama PIC'])}</td><td>${wa}</td><td>${escapeHtml(r['Kepala Sekolah'])}</td><td>${escapeHtml(r['Rekening Insentif'])}</td><td>${maps}</td><td>${escapeHtml(r['Jumlah Siswa'])}</td></tr>`;
    }).join('');
    document.getElementById('searchSekolah').addEventListener('input', e => filterTable(e, tbody));
}

async function loadRelawan() {
    const tbody = document.querySelector('#tableRelawan tbody'); if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">⏳ Memuat data...</td></tr>';
    const data = await fetchSheetData(SHEET_URLS.relawan); globalData.relawan = data;
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">⚠️ Data kosong</td></tr>'; return; }
    tbody.innerHTML = data.map((r, i) => {
        const wa = cleanWA(r['Nomor WA']) ? `<a href="https://wa.me/${cleanWA(r['Nomor WA'])}" target="_blank">${escapeHtml(r['Nomor WA'])}</a>` : '<span style="color:#999;">-</span>';
        return `<tr><td>${i+1}</td><td><strong>${escapeHtml(r['Nama'])}</strong></td><td class="${!checkAuth()?'masked-nik':''}">${maskNIK(r['NIK'])}</td><td>${wa}</td><td>${escapeHtml(r['Email'])}</td><td>${escapeHtml(r['Posisi'])}</td></tr>`;
    }).join('');
    document.getElementById('searchRelawan').addEventListener('input', e => filterTable(e, tbody));
    loadBirthday();
}

async function loadKoordinator() {
    const c = document.getElementById('cardKoordinator'); if (!c) return;
    c.innerHTML = '<p style="text-align:center;padding:20px;">⏳ Memuat data...</p>';
    const data = await fetchSheetData(SHEET_URLS.koordinator);
    if (!data.length) { c.innerHTML = '<p style="text-align:center;padding:20px;">⚠️ Data kosong</p>'; return; }
    c.innerHTML = data.map(r => {
        const wa = cleanWA(r['Nomor WA']) ? `<a href="https://wa.me/${cleanWA(r['Nomor WA'])}" target="_blank">${escapeHtml(r['Nomor WA'])}</a>` : '<span style="color:#999;">Tidak ada</span>';
        const email = r['Email'] ? `<p>📧 <a href="mailto:${r['Email']}">${escapeHtml(r['Email'])}</a></p>` : '';
        return `<div class="info-card"><h3>👔 ${escapeHtml(r['Nama'])}</h3><p><strong>${escapeHtml(r['Jabatan'])}</strong></p><p>💬 ${wa}</p>${email}</div>`;
    }).join('');
}

async function loadKontak() {
    const c = document.getElementById('cardKontak'); if (!c) return;
    c.innerHTML = '<p style="text-align:center;padding:20px;">⏳ Memuat data...</p>';
    const data = await fetchSheetData(SHEET_URLS.kontak);
    if (!data.length) { c.innerHTML = '<p style="text-align:center;padding:20px;">⚠️ Data kosong</p>'; return; }
    c.innerHTML = data.map(r => {
        const wa = cleanWA(r['Nomor WA']) ? `<a href="https://wa.me/${cleanWA(r['Nomor WA'])}" target="_blank">${escapeHtml(r['Nomor WA'])}</a>` : '<span style="color:#999;">Tidak ada</span>';
        return `<div class="info-card"><h3>📞 ${escapeHtml(r['Nama'])}</h3><p><strong>${escapeHtml(r['Jabatan'])}</strong></p><p>💬 ${wa}</p></div>`;
    }).join('');
}

async function loadSurat() {
    const c = document.getElementById('cardSurat'); if (!c) return;
    c.innerHTML = '<p style="text-align:center;padding:20px;">⏳ Memuat data...</p>';
    const data = await fetchSheetData(SHEET_URLS.surat);
    if (!data.length) { c.innerHTML = '<p style="text-align:center;padding:20px;">️ Belum ada surat</p>'; return; }
    c.innerHTML = data.map(r => {
        const relawan = globalData.relawan.find(x => x['Nama']?.toLowerCase() === r['Nama Relawan']?.toLowerCase());
        const email = relawan ? escapeHtml(relawan['Email']) : '';
        const wa = relawan ? cleanWA(relawan['Nomor WA']) : '';
        const link = isValidLink(r['Link Dokumen']) ? r['Link Dokumen'].trim() : null;
        const dl = link ? `<div class="doc-download"><a href="${link}" target="_blank" class="btn-download pdf" download="SP-${r['Nama Relawan']}.pdf"><i class="fas fa-file-pdf"></i> PDF</a><a href="${link}" target="_blank" class="btn-download doc" download="SP-${r['Nama Relawan']}.docx"><i class="fas fa-file-word"></i> DOC</a></div>` : '<span style="color:#999;">Tidak ada dokumen</span>';
        const msg = encodeURIComponent(`Berikut Surat Peringatan untuk ${r['Nama Relawan']}.`);
        const share = `<div class="btn-share">${wa ? `<a href="https://wa.me/${wa}?text=${msg}" target="_blank" class="btn-share-btn wa"><i class="fab fa-whatsapp"></i> WA</a>` : ''}${email ? `<a href="mailto:${email}?subject=SP ${r['Nama Relawan']}&body=${msg}" class="btn-share-btn email"><i class="fas fa-envelope"></i> Email</a>` : ''}</div>`;
        return `<div class="info-card warning-card"><h3>⚠️ ${escapeHtml(r['Nama Relawan'])} <span class="sp-badge">${escapeHtml(r['Status'])||'SP'}</span></h3><div class="info-row"><div class="info-label">Posisi:</div><div class="info-value">${relawan?escapeHtml(relawan['Posisi']):'-'}</div></div><div class="info-row"><div class="info-label">Tanggal SP:</div><div class="info-value">${escapeHtml(r['Tanggal SP'])}</div></div>${email?`<div class="info-row"><div class="info-label">Email:</div><div class="info-value">${email}</div></div>`:''}<div class="doc-actions"><div class="info-label">📥 Download:</div>${dl}<div class="info-label" style="margin-top:10px;">📤 Bagikan:</div>${share}</div></div>`;
    }).join('');
    document.getElementById('searchSurat').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        c.querySelectorAll('.info-card').forEach(card => card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none');
    });
}

async function loadDokumen() {
    const g = document.getElementById('docGrid'); if (!g) return;
    g.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">⏳ Memuat dokumen...</p>';
    const data = await fetchSheetData(SHEET_URLS.dokumen);
    if (!data.length) { g.innerHTML = '<div class="doc-empty"><div class="doc-empty-icon">📚</div><h3>Belum ada dokumen</h3></div>'; return; }
    const filtered = currentFilter === 'all' ? data : data.filter(d => d['Kategori']?.toLowerCase() === currentFilter);
    const q = document.getElementById('searchDokumen')?.value.toLowerCase() || '';
    const searched = filtered.filter(d => d['Judul']?.toLowerCase().includes(q) || d['Deskripsi']?.toLowerCase().includes(q));
    const icons = { sop:'📋', template:'📝', form:'📊', sk:'📜', panduan:'📖', internal:'📁' };
    g.innerHTML = searched.map(d => {
        const cat = d['Kategori']?.toLowerCase() || 'internal';
        const view = isValidLink(d['Link View']) ? d['Link View'].trim() : (isValidLink(d['Link Download']) ? d['Link Download'].trim() : null);
        const dl = isValidLink(d['Link Download']) ? d['Link Download'].trim() : null;
        const tgl = d['Tanggal Update'] ? new Date(d['Tanggal Update']).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '-';
        return `<div class="doc-item" data-category="${cat}">
            <div class="doc-header"><div class="doc-icon">${icons[cat]||'📄'}</div><div class="doc-info"><div class="doc-title">${escapeHtml(d['Judul'])}</div><span class="doc-category">${cat}</span></div></div>
            <div class="doc-meta"><div class="doc-meta-item"><span>📅</span><span>Update: ${tgl}</span></div>${d['Ukuran']?`<div class="doc-meta-item"><span>💾</span><span>${d['Ukuran']}</span></div>`:''}</div>
            ${d['Deskripsi']?`<p style="font-size:13px;color:#f9a8d4;margin:10px 0;">${escapeHtml(d['Deskripsi'])}</p>`:''}
            <div class="doc-actions-grid">${view?`<a href="${view}" target="_blank" class="btn-doc-action btn-view"><i class="fas fa-eye"></i> Lihat</a>`:''}${dl?`<a href="${dl}" download class="btn-doc-action btn-download-doc"><i class="fas fa-download"></i> Download</a>`:''}</div>
        </div>`;
    }).join('');
    const inp = document.getElementById('searchDokumen');
    if (inp) inp.oninput = () => loadDokumen();
}
function filterDokumen(cat, btn) { currentFilter = cat; document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active')); if(btn) btn.classList.add('active'); loadDokumen(); }

async function loadInfo() {
    const b = document.getElementById('infoBoard'); if (!b) return;
    b.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat informasi...</p>';
    const data = await fetchSheetData(SHEET_URLS.info); globalData.info = data;
    document.getElementById('totalMemo').textContent = data.length;
    document.getElementById('totalBaru').textContent = data.filter(d => d['Baru']?.toLowerCase()==='ya' || d['New']?.toLowerCase()==='yes').length;
    document.getElementById('totalMendesak').textContent = data.filter(d => d['Prioritas']?.toLowerCase()==='mendesak').length;
    renderInfoBoard();
    const inp = document.getElementById('searchInfo');
    if (inp) inp.oninput = () => renderInfoBoard();
}
function filterInfo(cat, btn) { currentInfoFilter = cat; document.querySelectorAll('.info-cat-btn').forEach(b => b.classList.remove('active')); if(btn) btn.classList.add('active'); renderInfoBoard(); }
function formatInfoContent(t) { return t ? escapeHtml(t).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>') : ''; }
function renderInfoBoard() {
    const b = document.getElementById('infoBoard'); if (!b) return;
    let data = globalData.info || [];
    if (currentInfoFilter !== 'all') data = data.filter(d => d['Kategori']?.toLowerCase() === currentInfoFilter);
    const q = document.getElementById('searchInfo')?.value.toLowerCase() || '';
    if (q) data = data.filter(d => d['Judul']?.toLowerCase().includes(q) || d['Isi']?.toLowerCase().includes(q));
    if (!data.length) { b.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📭</div><h3>Tidak ada informasi</h3></div>'; return; }
    data.sort((a,b) => new Date(b['Tanggal']||0) - new Date(a['Tanggal']||0));
    b.innerHTML = data.map((item, idx) => {
        const judul = escapeHtml(item['Judul']||'Tanpa Judul');
        const isi = item['Isi']||'';
        const kat = (item['Kategori']||'pengumuman').toLowerCase();
        const pri = (item['Prioritas']||'normal').toLowerCase();
        const penulis = item['Penulis']||'Admin';
        const tgl = item['Tanggal'] ? new Date(item['Tanggal']).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '-';
        const isNew = item['Baru']?.toLowerCase()==='ya' || item['New']?.toLowerCase()==='yes';
        const id = `info-content-${idx}`;
        const katLabel = {pengumuman:'📢 Pengumuman',memo:'📝 Memo',catatan:'📒 Catatan',penting:'⚠️ Info Penting',update:'🔄 Update'}[kat]||kat;
        const priLabel = {mendesak:'🚨 Mendesak',penting:'⚡ Penting',normal:'✅ Normal'}[pri]||'✅ Normal';
        const content = formatInfoContent(isi);
        const long = isi.length > 400;
        const share = encodeURIComponent(`*${item['Judul']}*\n\n${isi}\n\n— ${penulis} (${tgl})\n_Dari Portal SPPG_`);
        return `<div class="info-item priority-${pri}">
            <div class="info-item-header"><div class="info-item-title">${judul}</div><div class="info-item-badges"><span class="info-badge kategori-${kat}">${katLabel}</span><span class="info-badge priority-${pri}">${priLabel}</span>${isNew?'<span class="info-badge info-badge-new">🆕 BARU</span>':''}</div></div>
            <div class="info-item-meta"><div class="info-meta-item">👤 <strong>${escapeHtml(penulis)}</strong></div><div class="info-meta-item">📅 ${tgl}</div></div>
            <div class="info-item-content ${long?'collapsed':''}" id="${id}">${content}</div>
            ${long?`<button class="info-toggle-btn" onclick="toggleInfoContent('${id}',this)">📖 Baca Selengkapnya</button>`:''}
            <div class="info-item-footer"><a href="https://wa.me/?text=${share}" target="_blank" class="info-share-btn"><i class="fab fa-whatsapp"></i> Bagikan via WA</a></div>
        </div>`;
    }).join('');
}
function toggleInfoContent(id, btn) {
    const el = document.getElementById(id);
    if (el.classList.contains('collapsed')) { el.classList.remove('collapsed'); btn.innerHTML = '🔽 Tutup'; }
    else { el.classList.add('collapsed'); btn.innerHTML = '📖 Baca Selengkapnya'; }
}

async function loadMenuWeekly() {
    const c = document.getElementById('menuWeeklyContainer'); if (!c) return;
    c.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat menu...</p>';
    try {
        const data = await fetchSheetData(SHEET_URLS.menu);
        if (!data.length) { c.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📅</div><h3>Belum ada menu</h3></div>'; return; }
        const byDate = {};
        data.forEach(r => { if(r['Tanggal'] && r['Menu'] && !byDate[r['Tanggal']]) byDate[r['Tanggal']] = {menu:r['Menu'], pub:r['Dipublikasi']||r['Penulis']||r['Ahli Gizi']||'Ahli Gizi'}; });
        let dates = Object.keys(byDate);
        if (currentMenuFilter !== 'all') dates = dates.filter(d => { const day = new Date(d).toLocaleDateString('id-ID',{weekday:'long'}).toLowerCase(); return day === currentMenuFilter; });
        if (!dates.length) { c.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📭</div><h3>Tidak ada menu</h3></div>'; return; }
        dates.sort((a,b) => new Date(a) - new Date(b));
        const icons = {senin:'🌟',selasa:'🔥',rabu:'💎',kamis:'🌸',jumat:'🕌',sabtu:'🌈',minggu:'☀️'};
        c.innerHTML = dates.map(d => {
            const info = byDate[d]; const items = info.menu.split('+').map(m=>m.trim()).filter(m=>m);
            const date = new Date(d); const day = date.toLocaleDateString('id-ID',{weekday:'long'});
            return `<div class="menu-day-card"><div class="menu-day-header"><div class="menu-day-icon">${icons[day.toLowerCase()]||'📅'}</div><div class="menu-day-title"><h3>${day.charAt(0).toUpperCase()+day.slice(1)}</h3><div class="menu-day-date">${date.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div></div></div><div class="menu-items"><h4>🍽️ Menu Hari Ini</h4><div class="menu-list">${items.map(i=>`<span class="menu-item-tag">${escapeHtml(i)}</span>`).join('')}</div></div><div class="menu-published">👨‍🍳 Dipublikasi oleh: <strong>${escapeHtml(info.pub)}</strong></div></div>`;
        }).join('');
    } catch(e) { console.error(e); c.innerHTML = '<div class="info-empty"><div class="info-empty-icon">⚠️</div><h3>Gagal memuat menu</h3></div>'; }
}
function filterMenuWeek(day, btn) { currentMenuFilter = day; document.querySelectorAll('.menu-week-btn').forEach(b => b.classList.remove('active')); if(btn) btn.classList.add('active'); loadMenuWeekly(); }

async function loadRuteDistribusi() {
    const c = document.getElementById('ruteContent'); if (!c) return;
    c.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat rute...</p>';
    try {
        const data = await fetchSheetData(SHEET_URLS.rute);
        if (!data.length) { c.innerHTML = '<div class="info-empty"><div class="info-empty-icon">🚚</div><h3>Belum ada data rute</h3></div>'; return; }
        const sel = data.filter(r => (r['Rute']||'').toLowerCase().trim()==='selatan');
        const ut = data.filter(r => (r['Rute']||'').toLowerCase().trim()==='utara');
        const tS = {s:sel.length, pk:sel.reduce((a,r)=>a+(parseInt(r['PK'])||0),0), pb:sel.reduce((a,r)=>a+(parseInt(r['PB'])||0),0), t:sel.reduce((a,r)=>a+(parseInt(r['Total'])||0),0)};
        const tU = {s:ut.length, pk:ut.reduce((a,r)=>a+(parseInt(r['PK'])||0),0), pb:ut.reduce((a,r)=>a+(parseInt(r['PB'])||0),0), t:ut.reduce((a,r)=>a+(parseInt(r['Total'])||0),0)};
        const gT = {pk:tS.pk+tU.pk, pb:tS.pb+tU.pb, t:tS.t+tU.t};
        const tbl = rows => rows.map(r => `<tr><td><strong>${escapeHtml(r['Sekolah'])}</strong></td><td class="center">${r['PK']||0}</td><td class="center">${r['PB']||0}</td><td class="center"><strong>${r['Total']||0}</strong></td></tr>`).join('');
        c.innerHTML = `<div class="rute-summary-grid"><div class="rute-summary-card south"><h3>🚌 Jalur Selatan</h3><div class="rute-summary-stats"><div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${tS.s}</span></div><div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${tS.pk}</span></div><div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${tS.pb}</span></div></div><div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${tS.t}</span></div></div><div class="rute-summary-card north"><h3>🚐 Jalur Utara</h3><div class="rute-summary-stats"><div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${tU.s}</span></div><div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${tU.pk}</span></div><div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${tU.pb}</span></div></div><div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${tU.t}</span></div></div></div><div class="rute-tables-grid"><div class="rute-table-wrapper south"><table class="rute-table"><thead><tr><th colspan="4">🚌 Distribusi Jalur Selatan</th></tr><tr><th>Sekolah</th><th class="center">PK</th><th class="center">PB</th><th class="center">Total</th></tr></thead><tbody>${tbl(sel)}</tbody><tfoot><tr><td>TOTAL SELATAN</td><td class="center">${tS.pk}</td><td class="center">${tS.pb}</td><td class="center">${tS.t}</td></tr></tfoot></table></div><div class="rute-table-wrapper north"><table class="rute-table"><thead><tr><th colspan="4">🚐 Distribusi Jalur Utara</th></tr><tr><th>Sekolah</th><th class="center">PK</th><th class="center">PB</th><th class="center">Total</th></tr></thead><tbody>${tbl(ut)}</tbody><tfoot><tr><td>TOTAL UTARA</td><td class="center">${tU.pk}</td><td class="center">${tU.pb}</td><td class="center">${tU.t}</td></tr></tfoot></table></div></div><div class="rute-total-box"><h3>TOTAL KESELURUHAN</h3><div class="rute-total-stats"><div class="rute-total-item"><span class="rute-total-label">Total PK</span><span class="rute-total-value">${gT.pk}</span></div><div class="rute-total-item"><span class="rute-total-label">Total PB</span><span class="rute-total-value">${gT.pb}</span></div><div class="rute-total-item"><span class="rute-total-label">Grand Total</span><span class="rute-total-value">${gT.t}</span></div></div></div>`;
    } catch(e) { console.error(e); c.innerHTML = '<p style="text-align:center;padding:40px;color:#dc3545;">⚠️ Gagal memuat rute</p>'; }
}

async function loadQuote() { const d = await fetchSheetData(SHEET_URLS.quote); if(d.length) document.getElementById('quoteText').textContent = `❝ ${d[Math.floor(Math.random()*d.length)]['Quote']||d[0][Object.keys(d[0])[0]]} ❞`; }
async function loadPengumuman() { const d = await fetchSheetData(SHEET_URLS.pengumuman); document.getElementById('runningText').textContent = d.length ? d.map(r=>`📢 ${r['Judul']||''}: ${r['Isi']||''}`).join('   •   ') : 'Tidak ada pengumuman.'; }
async function loadAgenda() {
    const d = await fetchSheetData(SHEET_URLS.agenda); const l = document.getElementById('agendaList');
    if(!d.length) { l.innerHTML='<p>Tidak ada agenda.</p>'; return; }
    const bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    l.innerHTML = d.sort((a,b)=>(a['Tanggal']||'').localeCompare(b['Tanggal']||'')).map(r=>{
        const dt=new Date(r['Tanggal']); return `<div class="agenda-item"><div class="agenda-date"><div class="day">${dt.getDate()||'-'}</div><div class="month">${bln[dt.getMonth()]||''}</div></div><div class="agenda-info"><h4>${escapeHtml(r['Kegiatan'])}</h4><p>${escapeHtml(r['Keterangan'])}</p></div></div>`;
    }).join('');
}
async function loadBirthday() {
    const d = globalData.relawan; if(!d?.length) return;
    const now = new Date(); const m = now.getMonth()+1, dy = now.getDate();
    const bday = d.filter(r => { if(!r['Tanggal Lahir']) return false; const dt=new Date(r['Tanggal Lahir']); return dt.getMonth()+1===m && dt.getDate()===dy; });
    if(bday.length) {
        document.getElementById('birthdayText').textContent = `🎈 ${bday.map(p=>p['Nama']).join(', ')} 🎈`;
        const wa = cleanWA(bday[0]['Nomor WA']);
        if(wa) { document.getElementById('birthdayWaLink').href = `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${bday[0]['Nama']}! Selamat ulang tahun! 🎉 Semoga sehat selalu. - SPPG Jatian`)}`; document.getElementById('birthdayCard').style.display='flex'; }
    }
}

// =====================================================================
// ===== FIREBASE CHAT SYSTEM (FIXED) =====
// =====================================================================
let chatUserName = '', userColor = '', chatRoomActive = false, chatListenersAttached = false, currentUserId = '', chatSessionId = '';

function toggleChat() {
    const win = document.getElementById('chatWindow');
    const isActive = win.classList.contains('active');
    if (!isActive) {
        win.classList.add('active');
        if (chatUserName) enterChatRoom();
        else { document.getElementById('chatNameForm').style.display = 'flex'; document.getElementById('chatRoom').style.display = 'none'; }
    } else {
        win.classList.remove('active');
        if (chatRoomActive) leaveChatRoom();
    }
}

function startChat() {
    const name = document.getElementById('chatNameInput').value.trim();
    if (!name) { alert('Masukkan nama Anda.'); return; }
    if (name.length < 2) { alert('Nama minimal 2 karakter.'); return; }
    chatUserName = name; userColor = nameToColor(name);
    if (!chatSessionId) chatSessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    currentUserId = chatSessionId;
    enterChatRoom();
}

function changeChatName() {
    if (currentUserId) onlineUsersRef.child(currentUserId).remove();
    document.getElementById('chatFormTitle').textContent = 'Ganti Nama';
    document.getElementById('chatFormDesc').textContent = 'Masukkan nama baru. Warna akan berubah otomatis.';
    document.getElementById('chatNameInput').value = chatUserName || '';
    document.getElementById('chatNameForm').style.display = 'flex';
    document.getElementById('chatRoom').style.display = 'none';
    document.getElementById('changeNameBtn').style.display = 'none';
    setTimeout(() => document.getElementById('chatNameInput').focus(), 100);
}

function enterChatRoom() {
    if (!chatUserName) return;
    userColor = nameToColor(chatUserName);
    document.getElementById('chatNameForm').style.display = 'none';
    document.getElementById('chatRoom').style.display = 'flex';
    document.getElementById('chatUserLabel').textContent = chatUserName;
    document.getElementById('chatUserLabel').style.color = userColor;
    document.getElementById('changeNameBtn').style.display = 'flex';
    chatRoomActive = true;
    setupChatListeners();
    updateUserPresence();
    document.getElementById('chatMessageInput').focus();
}

function leaveChatRoom() {
    chatRoomActive = false;
    if (currentUserId) onlineUsersRef.child(currentUserId).remove();
    detachChatListeners();
}

function updateUserPresence() {
    if (!chatUserName || !currentUserId) return;
    const ref = onlineUsersRef.child(currentUserId);
    ref.set({ name: chatUserName, color: userColor, isAdmin: checkAuth(), lastSeen: firebase.database.ServerValue.TIMESTAMP });
    ref.onDisconnect().remove();
}

function setupChatListeners() {
    if (chatListenersAttached) return;
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';
    addSystemMessage('🔗 Terhubung ke REDZONE CHAT ROOM');
    chatMessagesRef.limitToLast(50).on('child_added', snap => { if(snap.val()) appendMessage(snap.val()); });
    onlineUsersRef.on('value', snap => { document.getElementById('onlineCount').textContent = Object.keys(snap.val()||{}).length; });
    chatListenersAttached = true;
}

function detachChatListeners() {
    if (!chatListenersAttached) return;
    chatMessagesRef.off(); onlineUsersRef.off(); chatListenersAttached = false;
}

function addSystemMessage(text) {
    const c = document.getElementById('chatMessages');
    const d = document.createElement('div'); d.className = 'chat-system-msg'; d.textContent = text;
    c.appendChild(d); c.scrollTop = c.scrollHeight;
}

function appendMessage(msg) {
    const c = document.getElementById('chatMessages');
    const load = c.querySelector('.chat-loading'); if(load) load.remove();
    const isSelf = msg.sender === chatUserName && msg.sessionId === chatSessionId;
    const isAdmin = msg.isAdmin === true;
    let cls = 'chat-message-other';
    if (isAdmin) cls = 'chat-message-admin';
    else if (isSelf) cls = 'chat-message-self';
    const color = msg.color || nameToColor(msg.sender);
    const bubbleStyle = (!isAdmin && isSelf) ? `style="background:${nameToDarkColor(msg.sender)};color:#fff;"` : '';
    const senderHtml = isAdmin ? `${escapeHtml(msg.sender)} <span class="admin-badge">ADMIN</span>` : escapeHtml(msg.sender);
    const time = msg.timestamp ? formatTimestamp(msg.timestamp) : '';
    c.insertAdjacentHTML('beforeend', `
        <div class="chat-message ${cls}">
            <div class="chat-message-sender" style="color:${color}">${senderHtml}</div>
            <div class="chat-message-bubble" ${bubbleStyle}>${escapeHtml(msg.text)}</div>
            <div class="chat-message-time">${time}</div>
        </div>
    `);
    c.scrollTop = c.scrollHeight;
    const win = document.getElementById('chatWindow');
    if (!win.classList.contains('active') && !isSelf) {
        const badge = document.getElementById('chatBadge');
        if (badge) { badge.classList.add('show'); setTimeout(() => badge.classList.remove('show'), 3000); }
    }
}

function formatTimestamp(ts) {
    const d = new Date(ts), n = new Date();
    const t = d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    return d.toDateString() === n.toDateString() ? t : d.toLocaleDateString('id-ID',{day:'numeric',month:'short'}) + ' ' + t;
}

function sendMessage() {
    const input = document.getElementById('chatMessageInput');
    const text = input.value.trim();
    if (!text) return;
    if (!chatUserName) { alert('Masukkan nama terlebih dahulu.'); return; }
    chatMessagesRef.push({
        sender: chatUserName, sessionId: chatSessionId, text: text,
        color: userColor, isAdmin: checkAuth(), timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => { input.value = ''; input.focus(); })
      .catch(e => { console.error(e); alert('Gagal mengirim pesan.'); });
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
    const y = new Date().getFullYear();
    document.getElementById('year').textContent = y;
    document.getElementById('footerYear').textContent = y;
    await loadSekolah(); await loadRelawan(); await loadKoordinator(); await loadKontak();
    loadSurat(); loadDokumen(); loadInfo(); loadMenuWeekly(); loadRuteDistribusi();
    loadQuote(); loadPengumuman(); loadAgenda(); updateClock();

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (sidebarOpen) toggleMenu();
            if (document.getElementById('pinModal').classList.contains('active')) hidePINModal();
        }
    });

    const firstAcc = document.querySelector('.accordion-header');
    if (firstAcc) toggleAccordion(firstAcc);

    document.getElementById('pinInput').addEventListener('keypress', e => { if(e.key==='Enter') verifyPIN(); });

    const btnDl = document.getElementById('btnDownloadRute');
    if (btnDl) btnDl.addEventListener('click', async () => {
        const el = document.getElementById('ruteContent'); if(!el) return;
        const orig = btnDl.innerHTML; btnDl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...'; btnDl.disabled = true;
        try {
            const canvas = await html2canvas(el, { scale:3, backgroundColor:'#1a1a1a', useCORS:true, allowTaint:true, logging:false });
            const a = document.createElement('a'); a.download = 'Rute-Distribusi-SPPG-Jatian.png'; a.href = canvas.toDataURL('image/png'); a.click();
        } catch(e) { console.error(e); alert('Gagal mengunduh gambar.'); }
        finally { btnDl.innerHTML = orig; btnDl.disabled = false; }
    });

    window.addEventListener('beforeunload', () => {
        if (currentUserId && chatRoomActive) onlineUsersRef.child(currentUserId).remove();
        detachChatListeners();
    });
});