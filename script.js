// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
    apiKey: "AIzaSyBBTmEXeyfgE-DKg73OmkgroBtp1_NLAOU",
    authDomain: "chat-portal-67948.firebaseapp.com",
    databaseURL: "https://chat-portal-67948-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chat-portal-67948",
    storageBucket: "chat-portal-67948.firebasestorage.app",
    messagingSenderId: "536843661380",
    appId: "1:536843661380:web:4eae78f035d0d21eb4cc11"
};

// Initialize Firebase
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
let mascotClickCount = 0;
let sidebarOpen = false;
let currentFilter = 'all';
let currentInfoFilter = 'all';
let currentMenuFilter = 'all';

const mascotPhrases = ["Halo! 👋", "Semangat! 💪", "Keren! ⭐", "Lanjut! 🚀", "Good job! 👍", "Yuk lihat! 👀", "Mantap! 🔥", "Sip! ✅"];
const easterEggPhrases = ["🎉 Easter Egg!", "Jangan lupa minum air ya 😁", "Semangat distribusi!", "Terima kasih 🇮🇩", "Kamu luar biasa! 💖", "Rahasia: Dino suka nasi padang 🍛"];

// ===== PIN & SECURITY SYSTEM (PIN = 31) =====
function checkAuth() {
    return sessionStorage.getItem('isAuthenticated') === 'true';
}

function showPINModal() {
    document.getElementById('pinModal').classList.add('active');
    document.getElementById('pinInput').value = '';
    document.getElementById('pinInput').focus();
}

function hidePINModal() {
    document.getElementById('pinModal').classList.remove('active');
}

function verifyPIN() {
    const input = document.getElementById('pinInput').value;
    if (input === '31') {
        sessionStorage.setItem('isAuthenticated', 'true');
        hidePINModal();
        alert('✅ Akses diberikan! Anda sekarang adalah Admin.');
        loadRelawan();
        loadSekolah();
        // Update chat admin status jika sedang di chat
        if (chatUserName && chatRoomActive) {
            updateUserPresence();
        }
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
        if (str.length > 4) {
            return str.substring(0, 4) + '*'.repeat(str.length - 4);
        }
        return '*'.repeat(str.length);
    }
    return nik;
}

function checkAndShow(sectionName) {
    const lockedSections = ['surat', 'dokumen'];
    if (lockedSections.includes(sectionName) && !checkAuth()) {
        showPINModal();
        return;
    }
    showSection(sectionName);
}

// ===== COLOR GENERATION FROM NAME =====
function nameToColor(name) {
    if (!name) return 'hsl(330, 65%, 55%)';
    let hash = 0;
    const str = name.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    const hue = Math.abs(hash % 360);
    const saturation = 60 + (Math.abs(hash >> 8) % 20); // 60-80%
    const lightness = 55 + (Math.abs(hash >> 16) % 15); // 55-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function nameToDarkColor(name) {
    if (!name) return 'hsl(330, 55%, 35%)';
    let hash = 0;
    const str = name.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const hue = Math.abs(hash % 360);
    const saturation = 50 + (Math.abs(hash >> 8) % 20);
    const lightness = 30 + (Math.abs(hash >> 16) % 15);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// ===== SIDEBAR & ACCORDION =====
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

// ===== MASCOT =====
function showMascotSpeech(customText = null) {
    const speech = document.getElementById('mascotSpeech');
    const phrase = customText || mascotPhrases[Math.floor(Math.random() * mascotPhrases.length)];
    speech.textContent = phrase;
    speech.classList.add('show');
    setTimeout(() => speech.classList.remove('show'), 2500);
}

function animateMascot() {
    const mascot = document.getElementById('mascot');
    mascot.style.transform = 'scale(1.2) rotate(5deg)';
    setTimeout(() => { mascot.style.transform = 'scale(1) rotate(0deg)'; }, 300);
}

function handleMascotClick() {
    mascotClickCount++;
    const counter = document.getElementById('mascotCounter');
    counter.textContent = mascotClickCount;
    counter.classList.add('show');
    animateMascot();
    if (mascotClickCount % 10 === 0) { 
        const msg = easterEggPhrases[Math.floor(Math.random() * easterEggPhrases.length)]; 
        showMascotSpeech(`🎁 ${msg}`); 
    } else { 
        showMascotSpeech(); 
    }
    setTimeout(() => counter.classList.remove('show'), 3000);
}

// ===== NAVIGATION =====
function showHome() {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const home = document.getElementById('section-home');
    if (home) {
        home.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        animateMascot();
        showMascotSpeech("Selamat datang! 👋");
    }
    if (sidebarOpen) toggleMenu();
}

function showSection(sectionName) {
    document.getElementById('section-home').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const section = document.getElementById('section-' + sectionName);
    if (section) {
        section.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        animateMascot();
        showMascotSpeech();
    }
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

// ===== DATA LOADERS =====
async function loadSekolah() {
    const tbody = document.querySelector('#tableSekolah tbody'); if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">⏳ Memuat data...</td></tr>';
    const data = await fetchSheetData(SHEET_URLS.sekolah); globalData.sekolah = data;
    if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">⚠️ Data tidak tersedia</td></tr>'; return; }
    tbody.innerHTML = data.map((row, i) => {
        const mapsLink = isValidLink(row['Link Maps']) ? row['Link Maps'].trim() : null; 
        const waNumber = cleanWA(row['WA PIC']);
        const mapsCell = mapsLink ? `<a href="${mapsLink}" target="_blank" rel="noopener noreferrer">📍 Maps</a>` : '<span style="color:#999;">-</span>';
        const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">💬 ${escapeHtml(row['WA PIC'])}</a>` : '<span style="color:#999;">-</span>';
        return `<tr><td>${i + 1}</td><td><strong>${escapeHtml(row['Nama Sekolah'])}</strong></td><td>${escapeHtml(row['Nama PIC'])}</td><td>${waCell}</td><td>${escapeHtml(row['Kepala Sekolah'])}</td><td>${escapeHtml(row['Rekening Insentif'])}</td><td>${mapsCell}</td><td>${escapeHtml(row['Jumlah Siswa'])}</td></tr>`;
    }).join('');
    document.getElementById('searchSekolah').addEventListener('input', (e) => filterTable(e, tbody));
}

async function loadRelawan() {
    const tbody = document.querySelector('#tableRelawan tbody'); if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">⏳ Memuat data...</td></tr>';
    const data = await fetchSheetData(SHEET_URLS.relawan); globalData.relawan = data;
    if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">⚠️ Data tidak tersedia</td></tr>'; return; }
    tbody.innerHTML = data.map((row, i) => {
        const waNumber = cleanWA(row['Nomor WA']);
        const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">${escapeHtml(row['Nomor WA'])}</a>` : '<span style="color:#999;">-</span>';
        const nikDisplay = maskNIK(row['NIK']);
        const nikClass = !checkAuth() ? 'masked-nik' : '';
        return `<tr><td>${i + 1}</td><td><strong>${escapeHtml(row['Nama'])}</strong></td><td class="${nikClass}">${nikDisplay}</td><td>${waCell}</td><td>${escapeHtml(row['Email'])}</td><td>${escapeHtml(row['Posisi'])}</td></tr>`;
    }).join('');
    document.getElementById('searchRelawan').addEventListener('input', (e) => filterTable(e, tbody)); 
    loadBirthday();
}

async function loadKoordinator() {
    const container = document.getElementById('cardKoordinator'); if (!container) return; 
    container.innerHTML = '<p style="text-align:center;padding:20px;">⏳ Memuat data...</p>';
    const data = await fetchSheetData(SHEET_URLS.koordinator); 
    if (data.length === 0) { container.innerHTML = '<p style="text-align:center;padding:20px;">⚠️ Data tidak tersedia</p>'; return; }
    container.innerHTML = data.map(row => {
        const waNumber = cleanWA(row['Nomor WA']); 
        const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">${escapeHtml(row['Nomor WA'])}</a>` : '<span style="color:#999;">Tidak ada</span>';
        const emailCell = row['Email'] ? `<p>📧 <a href="mailto:${row['Email']}">${escapeHtml(row['Email'])}</a></p>` : '';
        return `<div class="info-card"><h3>👔 ${escapeHtml(row['Nama'])}</h3><p><strong>${escapeHtml(row['Jabatan'])}</strong></p><p>💬 ${waCell}</p>${emailCell}</div>`;
    }).join('');
}

async function loadKontak() {
    const container = document.getElementById('cardKontak'); if (!container) return; 
    container.innerHTML = '<p style="text-align:center;padding:20px;">⏳ Memuat data...</p>';
    const data = await fetchSheetData(SHEET_URLS.kontak); 
    if (data.length === 0) { container.innerHTML = '<p style="text-align:center;padding:20px;">⚠️ Data tidak tersedia</p>'; return; }
    container.innerHTML = data.map(row => {
        const waNumber = cleanWA(row['Nomor WA']); 
        const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">${escapeHtml(row['Nomor WA'])}</a>` : '<span style="color:#999;">Tidak ada</span>';
        return `<div class="info-card"><h3>📞 ${escapeHtml(row['Nama'])}</h3><p><strong>${escapeHtml(row['Jabatan'])}</strong></p><p>💬 ${waCell}</p></div>`;
    }).join('');
}

async function loadSurat() {
    const container = document.getElementById('cardSurat'); if (!container) return; 
    container.innerHTML = '<p style="text-align:center;padding:20px;">⏳ Memuat data...</p>';
    const dataSP = await fetchSheetData(SHEET_URLS.surat); 
    if (dataSP.length === 0) { container.innerHTML = '<p style="text-align:center;padding:20px;">⚠️ Belum ada surat peringatan</p>'; return; }
    container.innerHTML = dataSP.map(row => {
        const namaRelawan = escapeHtml(row['Nama Relawan']); 
        const linkDokumen = isValidLink(row['Link Dokumen']) ? row['Link Dokumen'].trim() : null;
        const tanggalSP = escapeHtml(row['Tanggal SP']); 
        const status = escapeHtml(row['Status']);
        const relawan = globalData.relawan.find(r => r['Nama'] && r['Nama'].toLowerCase() === row['Nama Relawan'].toLowerCase());
        const email = relawan ? escapeHtml(relawan['Email']) : ''; 
        const waNumber = relawan ? cleanWA(relawan['Nomor WA']) : '';
        const posisi = relawan ? escapeHtml(relawan['Posisi']) : '-'; 
        const filename = `Surat Peringatan - ${row['Nama Relawan']}`;
        const downloadBtns = linkDokumen ? `<div class="doc-download"><a href="${linkDokumen}" target="_blank" class="btn-download pdf" download="${filename}.pdf"><i class="fas fa-file-pdf"></i> PDF</a><a href="${linkDokumen}" target="_blank" class="btn-download doc" download="${filename}.docx"><i class="fas fa-file-word"></i> DOC</a></div>` : '<span style="color:#999;">Tidak ada dokumen</span>';
        const shareMessage = encodeURIComponent(`Berikut Surat Peringatan untuk ${row['Nama Relawan']}. File terlampir.`);
        const shareBtns = `<div class="btn-share">${waNumber ? `<a href="https://wa.me/${waNumber}?text=${shareMessage}" target="_blank" class="btn-share-btn wa"><i class="fab fa-whatsapp"></i> WA</a>` : ''}${email ? `<a href="mailto:${email}?subject=${encodeURIComponent('Surat Peringatan - ' + row['Nama Relawan'])}&body=${shareMessage}" class="btn-share-btn email"><i class="fas fa-envelope"></i> Email</a>` : ''}</div>`;
        return `<div class="info-card warning-card"><h3>⚠️ ${namaRelawan} <span class="sp-badge">${status || 'SP'}</span></h3><div class="info-row"><div class="info-label">Posisi:</div><div class="info-value">${posisi}</div></div><div class="info-row"><div class="info-label">Tanggal SP:</div><div class="info-value">${tanggalSP}</div></div>${email ? `<div class="info-row"><div class="info-label">Email:</div><div class="info-value">${email}</div></div>` : ''}<div class="doc-actions"><div class="info-label">📥 Download Dokumen:</div>${downloadBtns}<div class="info-label" style="margin-top:10px;">📤 Bagikan:</div>${shareBtns}</div></div>`;
    }).join('');
    document.getElementById('searchSurat').addEventListener('input', (e) => { 
        const q = e.target.value.toLowerCase(); 
        container.querySelectorAll('.info-card').forEach(card => { card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none'; }); 
    });
}

async function loadDokumen() {
    const grid = document.getElementById('docGrid'); if (!grid) return;
    grid.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">⏳ Memuat dokumen...</p>';
    const data = await fetchSheetData(SHEET_URLS.dokumen);
    if (data.length === 0) { grid.innerHTML = '<div class="doc-empty"><div class="doc-empty-icon">📚</div><h3>Belum ada dokumen</h3></div>'; return; }
    const filteredData = currentFilter === 'all' ? data : data.filter(doc => doc['Kategori']?.toLowerCase() === currentFilter);
    const searchTerm = document.getElementById('searchDokumen')?.value.toLowerCase() || '';
    const searchedData = filteredData.filter(doc => doc['Judul']?.toLowerCase().includes(searchTerm) || doc['Deskripsi']?.toLowerCase().includes(searchTerm));
    
    const icons = { sop: '📋', template: '📝', form: '📊', sk: '📜', panduan: '📖', internal: '📁' };
    
    grid.innerHTML = searchedData.map((doc) => {
        const category = doc['Kategori']?.toLowerCase() || 'internal';
        const icon = icons[category] || '📄';
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
           ${doc['Deskripsi'] ? `<p style="font-size:13px;color:#f9a8d4;margin:10px 0;">${escapeHtml(doc['Deskripsi'])}</p>` : ''}
           <div class="doc-actions-grid">
               ${linkView ? `<a href="${linkView}" target="_blank" class="btn-doc-action btn-view"><i class="fas fa-eye"></i> Lihat</a>` : ''}
               ${linkDownload ? `<a href="${linkDownload}" download class="btn-doc-action btn-download-doc"><i class="fas fa-download"></i> Download</a>` : ''}
           </div>
       </div>`;
    }).join('');
    const searchInput = document.getElementById('searchDokumen'); 
    if (searchInput) searchInput.addEventListener('input', () => loadDokumen());
}

function filterDokumen(category, btn) { 
    currentFilter = category; 
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active')); 
    if (btn) btn.classList.add('active'); 
    loadDokumen(); 
}

async function loadInfo() {
    const board = document.getElementById('infoBoard'); if (!board) return;
    board.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat informasi...</p>';
    const data = await fetchSheetData(SHEET_URLS.info); globalData.info = data;
    document.getElementById('totalMemo').textContent = data.length;
    document.getElementById('totalBaru').textContent = data.filter(d => d['Baru']?.toLowerCase() === 'ya' || d['New']?.toLowerCase() === 'yes').length;
    document.getElementById('totalMendesak').textContent = data.filter(d => d['Prioritas']?.toLowerCase() === 'mendesak').length;
    const badge = document.getElementById('badgeInfo'); 
    const baruCount = data.filter(d => d['Baru']?.toLowerCase() === 'ya' || d['New']?.toLowerCase() === 'yes').length;
    if (badge) { badge.textContent = baruCount; badge.style.display = baruCount > 0 ? 'flex' : 'none'; }
    renderInfoBoard();
    const searchInput = document.getElementById('searchInfo'); 
    if (searchInput) searchInput.addEventListener('input', () => renderInfoBoard());
}

function filterInfo(category, btn) { 
    currentInfoFilter = category; 
    document.querySelectorAll('.info-cat-btn').forEach(b => b.classList.remove('active')); 
    if (btn) btn.classList.add('active'); 
    renderInfoBoard(); 
}

function formatInfoContent(text) {
    if (!text) return ''; 
    let formatted = escapeHtml(text);
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

function renderInfoBoard() {
    const board = document.getElementById('infoBoard'); if (!board) return;
    let data = globalData.info || [];
    if (currentInfoFilter !== 'all') { data = data.filter(item => item['Kategori']?.toLowerCase() === currentInfoFilter); }
    const searchTerm = document.getElementById('searchInfo')?.value.toLowerCase() || '';
    if (searchTerm) { data = data.filter(item => item['Judul']?.toLowerCase().includes(searchTerm) || item['Isi']?.toLowerCase().includes(searchTerm)); }
    if (data.length === 0) { board.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📭</div><h3>Tidak ada informasi</h3></div>'; return; }
    data.sort((a, b) => { const dateA = new Date(a['Tanggal'] || 0); const dateB = new Date(b['Tanggal'] || 0); return dateB - dateA; });
    
    board.innerHTML = data.map((item, idx) => {
        const judul = escapeHtml(item['Judul'] || 'Tanpa Judul'); const isi = item['Isi'] || '';
        const kategori = (item['Kategori'] || 'pengumuman').toLowerCase(); const prioritas = (item['Prioritas'] || 'normal').toLowerCase();
        const penulis = item['Penulis'] || 'Admin';
        const tanggal = item['Tanggal'] ? new Date(item['Tanggal']).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        const isNew = item['Baru']?.toLowerCase() === 'ya' || item['New']?.toLowerCase() === 'yes';
        const itemId = `info-content-${idx}`;
        const kategoriLabel = { pengumuman: '📢 Pengumuman', memo: '📝 Memo', catatan: '📒 Catatan', penting: '⚠️ Info Penting', update: '🔄 Update' }[kategori] || kategori;
        const prioritasLabel = { mendesak: '🔥 Mendesak', penting: '⚡ Penting', normal: '✅ Normal' }[prioritas] || '✅ Normal';
        const contentFormatted = formatInfoContent(isi); const isLong = isi.length > 400;
        const shareText = encodeURIComponent(`*${item['Judul']}*\n\n${isi}\n\n— ${penulis} (${tanggal})\n_Dari Portal ASLAP SPPG JATIAN_`);
        return `<div class="info-item priority-${prioritas}">
           <div class="info-item-header"><div class="info-item-title">${judul}</div>
           <div class="info-item-badges"><span class="info-badge kategori-${kategori}">${kategoriLabel}</span><span class="info-badge priority-${prioritas}">${prioritasLabel}</span>${isNew ? '<span class="info-badge info-badge-new">🆕 BARU</span>' : ''}</div></div>
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
        if (currentMenuFilter !== 'all') { displayDates = displayDates.filter(date => {
            const d = new Date(date);
            const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
            return days[d.getDay()] === currentMenuFilter;
        }); }
        if (displayDates.length === 0) { container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📭</div><h3>Tidak ada menu</h3></div>'; return; }
        displayDates.sort((a, b) => new Date(a) - new Date(b));
        const icons = { 'senin': '🌟', 'selasa': '🔥', 'rabu': '💎', 'kamis': '🌸', 'jumat': '🕌', 'sabtu': '🌈', 'minggu': '☀️' };
        
        container.innerHTML = displayDates.map(date => {
            const info = menuByDate[date];
            const menuItems = info.menu ? info.menu.split('+').map(m => m.trim()).filter(m => m) : [];
            const d = new Date(date);
            const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
            const icon = icons[dayName.toLowerCase()] || '📅';
            return `<div class="menu-day-card"><div class="menu-day-header"><div class="menu-day-icon">${icon}</div><div class="menu-day-title"><h3>${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</h3><div class="menu-day-date">${d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div></div><div class="menu-items"><h4>🍽️ Menu Hari Ini</h4><div class="menu-list">${menuItems.map(item => `<span class="menu-item-tag">${escapeHtml(item)}</span>`).join('')}</div></div><div class="menu-published">👨‍🍳 Dipublikasi oleh: <strong>${escapeHtml(info.publishedBy)}</strong></div></div>`;
        }).join('');
    } catch (error) { console.error('Error loading menu:', error); container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">⚠️</div><h3>Gagal memuat menu</h3></div>'; }
}

function filterMenuWeek(day, btn) { currentMenuFilter = day; document.querySelectorAll('.menu-week-btn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); renderMenuWeekly(); }
function renderMenuWeekly() { loadMenuWeekly(); }

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
        
        container.innerHTML = `<div class="rute-summary-grid"><div class="rute-summary-card south"><h3>🚌 Jalur Selatan</h3><div class="rute-summary-stats"><div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${totalSelatan.sekolah}</span></div><div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${totalSelatan.pk}</span></div><div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${totalSelatan.pb}</span></div></div><div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${totalSelatan.total}</span></div></div><div class="rute-summary-card north"><h3>🚐 Jalur Utara</h3><div class="rute-summary-stats"><div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${totalUtara.sekolah}</span></div><div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${totalUtara.pk}</span></div><div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${totalUtara.pb}</span></div></div><div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${totalUtara.total}</span></div></div></div><div class="rute-tables-grid"><div class="rute-table-wrapper south"><table class="rute-table"><thead><tr><th colspan="4">🚌 Distribusi Jalur Selatan</th></tr><tr><th>Sekolah</th><th class="center">PK</th><th class="center">PB</th><th class="center">Total</th></tr></thead><tbody>${renderTable(selatan)}</tbody><tfoot><tr><td>TOTAL SELATAN</td><td class="center">${totalSelatan.pk}</td><td class="center">${totalSelatan.pb}</td><td class="center">${totalSelatan.total}</td></tr></tfoot></table></div><div class="rute-table-wrapper north"><table class="rute-table"><thead><tr><th colspan="4">🚐 Distribusi Jalur Utara</th></tr><tr><th>Sekolah</th><th class="center">PK</th><th class="center">PB</th><th class="center">Total</th></tr></thead><tbody>${renderTable(utara)}</tbody><tfoot><tr><td>TOTAL UTARA</td><td class="center">${totalUtara.pk}</td><td class="center">${totalUtara.pb}</td><td class="center">${totalUtara.total}</td></tr></tfoot></table></div></div><div class="rute-total-box"><h3>📊 TOTAL KESELURUHAN</h3><div class="rute-total-stats"><div class="rute-total-item"><span class="rute-total-label">Total PK</span><span class="rute-total-value">${grandTotal.pk}</span></div><div class="rute-total-item"><span class="rute-total-label">Total PB</span><span class="rute-total-value">${grandTotal.pb}</span></div><div class="rute-total-item"><span class="rute-total-label">Grand Total</span><span class="rute-total-value">${grandTotal.total}</span></div></div></div>`;
    } catch (error) { console.error('Error loading rute:', error); container.innerHTML = '<p style="text-align:center;padding:40px;color:#dc3545;">⚠️ Gagal memuat data rute</p>'; }
}

async function loadQuote() { const data = await fetchSheetData(SHEET_URLS.quote); if (data.length > 0) { const random = data[Math.floor(Math.random() * data.length)]; document.getElementById('quoteText').textContent = `❝ ${random['Quote'] || random[Object.keys(random)[0]]} ❞`; } }
async function loadPengumuman() { const data = await fetchSheetData(SHEET_URLS.pengumuman); document.getElementById('runningText').textContent = data.length === 0 ? 'Tidak ada pengumuman.' : data.map(r => `📢 ${r['Judul'] || ''}: ${r['Isi'] || ''}`).join('   •   '); }
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

// =====================================================================
// ===== FIREBASE REAL-TIME CHAT ROOM SYSTEM =====
// =====================================================================

let chatUserName = localStorage.getItem('chatUserName') || '';
let userColor = '';
let chatRoomActive = false;
let chatListenersAttached = false;
let currentUserId = '';

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow.style.display === 'none') {
        chatWindow.style.display = 'flex';
        if (chatUserName) {
            enterChatRoom();
        } else {
            document.getElementById('chatNameForm').style.display = 'flex';
            document.getElementById('chatRoom').style.display = 'none';
        }
    } else {
        chatWindow.style.display = 'none';
        if (chatRoomActive) {
            leaveChatRoom();
        }
    }
}

function startChat() {
    const nameInput = document.getElementById('chatNameInput');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Silakan masukkan nama Anda terlebih dahulu.');
        return;
    }
    
    if (name.length < 2) {
        alert('Nama minimal 2 karakter.');
        return;
    }
    
    chatUserName = name;
    userColor = nameToColor(name);
    currentUserId = name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
    localStorage.setItem('chatUserName', chatUserName);
    
    enterChatRoom();
}

function enterChatRoom() {
    if (!chatUserName) return;
    
    userColor = nameToColor(chatUserName);
    currentUserId = chatUserName.replace(/\s+/g, '_').toLowerCase() + '_' + localStorage.getItem('chatSessionId');
    
    if (!localStorage.getItem('chatSessionId')) {
        localStorage.setItem('chatSessionId', Date.now().toString());
        currentUserId = chatUserName.replace(/\s+/g, '_').toLowerCase() + '_' + localStorage.getItem('chatSessionId');
    }
    
    document.getElementById('chatNameForm').style.display = 'none';
    document.getElementById('chatRoom').style.display = 'flex';
    document.getElementById('chatUserLabel').textContent = chatUserName;
    document.getElementById('chatUserLabel').style.color = userColor;
    
    chatRoomActive = true;
    
    // Setup Firebase listeners
    setupChatListeners();
    
    // Set user online
    updateUserPresence();
    
    // Focus on input
    document.getElementById('chatMessageInput').focus();
}

function leaveChatRoom() {
    chatRoomActive = false;
    
    // Remove user from online list
    if (currentUserId) {
        onlineUsersRef.child(currentUserId).remove();
    }
    
    // Detach listeners
    detachChatListeners();
}

function updateUserPresence() {
    if (!chatUserName || !currentUserId) return;
    
    const userRef = onlineUsersRef.child(currentUserId);
    const userData = {
        name: chatUserName,
        color: userColor,
        isAdmin: checkAuth(),
        lastSeen: firebase.database.ServerValue.TIMESTAMP
    };
    
    userRef.set(userData);
    
    // Remove user when disconnect
    userRef.onDisconnect().remove();
}

function setupChatListeners() {
    if (chatListenersAttached) return;
    
    // Clear existing messages
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    // Add system message
    addSystemMessage('🔗 Terhubung ke Room Chat SPPG Jatian');
    
    // Listen for new messages (last 50)
    chatMessagesRef.limitToLast(50).on('child_added', (snapshot) => {
        const message = snapshot.val();
        if (message) {
            appendMessage(message);
        }
    });
    
    // Listen for online users
    onlineUsersRef.on('value', (snapshot) => {
        const users = snapshot.val() || {};
        const count = Object.keys(users).length;
        document.getElementById('onlineCount').textContent = count;
    });
    
    chatListenersAttached = true;
}

function detachChatListeners() {
    if (!chatListenersAttached) return;
    
    chatMessagesRef.off();
    onlineUsersRef.off();
    
    chatListenersAttached = false;
}

function addSystemMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-system-msg';
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    
    // Remove loading message if exists
    const loading = messagesContainer.querySelector('.chat-loading');
    if (loading) loading.remove();
    
    const isSelf = message.sender === chatUserName;
    const isAdmin = message.isAdmin === true;
    
    let msgClass = 'chat-message-other';
    if (isAdmin) {
        msgClass = 'chat-message-admin';
    } else if (isSelf) {
        msgClass = 'chat-message-self';
    }
    
    const msgColor = message.color || nameToColor(message.sender);
    const bubbleColor = isSelf ? nameToDarkColor(message.sender) : (isAdmin ? '' : '#2d2d2d');
    
    const timeStr = message.timestamp ? formatTimestamp(message.timestamp) : '';
    
    const senderNameHtml = isAdmin 
        ? `${escapeHtml(message.sender)} <span class="admin-badge">👑 ADMIN</span>`
        : escapeHtml(message.sender);
    
    const msgHTML = `
        <div class="chat-message ${msgClass}">
            <div class="chat-message-sender" style="color: ${msgColor};">
                ${senderNameHtml}
            </div>
            <div class="chat-message-bubble" ${!isAdmin && isSelf ? `style="background: ${bubbleColor}; color: #fff;"` : ''}>
                ${escapeHtml(message.text)}
            </div>
            <div class="chat-message-time">${timeStr}</div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
    
    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Show badge on toggle button if chat is hidden
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow.style.display === 'none' && !isSelf) {
        const badge = document.getElementById('chatBadge');
        badge.classList.add('show');
        setTimeout(() => badge.classList.remove('show'), 3000);
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
        return timeStr;
    } else {
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + timeStr;
    }
}

function sendMessage() {
    const input = document.getElementById('chatMessageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    if (!chatUserName) {
        alert('Silakan masukkan nama terlebih dahulu.');
        return;
    }
    
    const messageData = {
        sender: chatUserName,
        text: text,
        color: userColor,
        isAdmin: checkAuth(),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    chatMessagesRef.push(messageData)
        .then(() => {
            input.value = '';
            input.focus();
        })
        .catch((error) => {
            console.error('Error sending message:', error);
            alert('Gagal mengirim pesan. Silakan coba lagi.');
        });
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
    const currentYear = new Date().getFullYear();
    document.getElementById('year').textContent = currentYear; 
    document.getElementById('footerYear').textContent = currentYear;
    
    await loadSekolah(); 
    await loadRelawan(); 
    await loadKoordinator(); 
    await loadKontak();
    loadSurat(); 
    loadDokumen(); 
    loadInfo(); 
    loadMenuWeekly(); 
    loadRuteDistribusi(); 
    loadQuote(); 
    loadPengumuman(); 
    loadAgenda(); 
    updateClock();
    
    document.getElementById('mascot').addEventListener('click', handleMascotClick);
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape') {
            if (sidebarOpen) toggleMenu();
            if (document.getElementById('pinModal').classList.contains('active')) hidePINModal();
        }
    });

    // Buka accordion pertama secara default
    const firstAccordion = document.querySelector('.accordion-header');
    if (firstAccordion) toggleAccordion(firstAccordion);

    // Handle External Link (Summary Insentif) dengan PIN Check
    document.querySelectorAll('.external-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!checkAuth()) {
                e.preventDefault();
                showPINModal();
            }
        });
    });

    // Handle Enter key on PIN input
    document.getElementById('pinInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyPIN();
    });
    
    // Download PNG Feature
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
                    backgroundColor: '#1a1a1a',
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
    
    // Cleanup chat on page unload
    window.addEventListener('beforeunload', () => {
        if (currentUserId && chatRoomActive) {
            onlineUsersRef.child(currentUserId).remove();
        }
        detachChatListeners();
    });
});