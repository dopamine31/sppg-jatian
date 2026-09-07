// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://hjeohrmhublwemarlpni.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZW9ocm1odWJsd2VtYXJscG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjM2OTEsImV4cCI6MjA5NzQzOTY5MX0.3K12v7tgWX-UUkeO7eveYo-RlWPuTmZg2Ro3bRKkrUE';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchJsonData(tableName) { 
  try { 
    const { data, error } = await supabaseClient.from(tableName).select('*'); 
    if (error) { console.error('Error fetching', tableName, error); return []; } 
    return data || []; 
  } catch (error) { 
    console.error(`Error loading table ${tableName}:`, error); 
    return []; 
  } 
}

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
  } else { 
    alert('❌ PIN salah! Silakan coba lagi.'); 
    document.getElementById('pinInput').value = ''; 
    document.getElementById('pinInput').focus(); 
  } 
}
function maskNIK(nik) { if (!nik) return '-'; if (!checkAuth()) { const str = String(nik).trim(); if (str.length > 4) return str.substring(0, 4) + '•'.repeat(str.length - 4); return '•'.repeat(str.length); } return nik; }
function checkAndShow(sectionName) { const lockedSections = ['surat', 'dokumen']; if (lockedSections.includes(sectionName) && !checkAuth()) { showPINModal(); return; } showSection(sectionName); }

// ===== SIDEBAR & ACCORDION =====
function toggleMenu() { const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('sidebarOverlay'); sidebarOpen = !sidebarOpen; if (sidebarOpen) { sidebar.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; } else { sidebar.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; } }
function toggleAccordion(header) { const group = header.parentElement; const content = group.querySelector('.accordion-content'); const icon = header.querySelector('.accordion-icon'); const isOpen = group.classList.contains('active'); document.querySelectorAll('.accordion-group').forEach(g => { g.classList.remove('active'); const c = g.querySelector('.accordion-content'); const i = g.querySelector('.accordion-icon'); if (c) c.style.maxHeight = null; if (i) i.style.transform = 'rotate(0deg)'; }); if (!isOpen) { group.classList.add('active'); content.style.maxHeight = content.scrollHeight + 50 + 'px'; icon.style.transform = 'rotate(180deg)'; } }

// ===== NAVIGATION =====
function showHome() { document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none'); const home = document.getElementById('section-home'); if (home) { home.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); } if (sidebarOpen) toggleMenu(); }
function showSection(sectionName) { 
  document.getElementById('section-home').style.display = 'none'; 
  document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none'); 
  const section = document.getElementById('section-' + sectionName); 
  if (section) { section.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); } 
  if (sidebarOpen) toggleMenu();    
  const loaders = { sekolah: loadSekolah, relawan: loadRelawan, koordinator: loadKoordinator, kontak: loadKontak, surat: loadSurat, dokumen: loadDokumen, info: loadInfo, menu: loadMenuWeekly, rute: loadRuteDistribusi, stok: loadStok }; 
  if (loaders[sectionName]) loaders[sectionName](); 
}

// ===== CLOCK =====
function updateClock() { const now = new Date(); const utc = now.getTime() + (now.getTimezoneOffset() * 60000); const wibTime = new Date(utc + (3600000 * 7)); document.getElementById('digitalTime').textContent = `${String(wibTime.getHours()).padStart(2, '0')}:${String(wibTime.getMinutes()).padStart(2, '0')}:${String(wibTime.getSeconds()).padStart(2, '0')}`; document.getElementById('msDisplay').textContent = String(wibTime.getMilliseconds()).padStart(3, '0'); document.getElementById('dateDisplay').textContent = wibTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); document.getElementById('secondHand').style.transform = `rotate(${(wibTime.getSeconds() / 60) * 360}deg)`; document.getElementById('minuteHand').style.transform = `rotate(${((wibTime.getMinutes() + wibTime.getSeconds() / 60) / 60) * 360}deg)`; document.getElementById('hourHand').style.transform = `rotate(${((wibTime.getHours() % 12 + wibTime.getMinutes() / 60) / 12) * 360}deg)`; }
setInterval(updateClock, 10);

// ===== UTILS =====
function escapeHtml(text) { if (!text) return '-'; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function cleanWA(number) { if (!number) return ''; let clean = String(number).replace(/\D/g, ''); if (clean.startsWith('0')) clean = '62' + clean.substring(1); return clean; }
function isValidLink(link) { if (!link) return false; const trimmed = link.trim().toLowerCase(); return trimmed !== '' && trimmed !== '-' && trimmed !== 'null'; }
function filterTable(e, tbody) { const q = e.target.value.toLowerCase(); tbody.querySelectorAll('tr').forEach(tr => { tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none'; }); }

// ===== KTP =====
function getKTPUrl(nama) { if (!nama) return null; const KTP_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/ktp/`; return `${KTP_BASE_URL}${encodeURIComponent(nama.trim())}.jpg`; }
function showKTPModal(url, nama) { let modal = document.getElementById('ktpModal'); if (!modal) { modal = document.createElement('div'); modal.id = 'ktpModal'; modal.className = 'ktp-modal-overlay'; modal.onclick = function(e) { if (e.target === modal) closeKTPModal(); }; modal.innerHTML = `<div class="ktp-modal-content"><button class="ktp-modal-close" onclick="closeKTPModal()">✕</button><h3 class="ktp-modal-title">📷 KTP: <span id="ktpModalNama"></span></h3><img id="ktpModalImg" src="" alt="KTP"></div>`; document.body.appendChild(modal); } document.getElementById('ktpModalNama').textContent = nama; document.getElementById('ktpModalImg').src = url; modal.classList.add('active'); }
function closeKTPModal() { const modal = document.getElementById('ktpModal'); if (modal) modal.classList.remove('active'); }
function handleKTPClick(nama, ktpUrl) { if (checkAuth()) { showKTPModal(ktpUrl, nama); } else { showPINModal(); const checkInterval = setInterval(() => { if (checkAuth()) { clearInterval(checkInterval); showKTPModal(ktpUrl, nama); } }, 500); setTimeout(() => clearInterval(checkInterval), 120000); } }

// ===== LOADERS (Sekolah, Relawan, Koordinator, Kontak, Surat, Dokumen, Info, Menu, Rute) =====
async function loadSekolah() { const tbody = document.querySelector('#tableSekolah tbody'); if (!tbody) return; tbody.innerHTML = '<tr><td colspan="16" style="text-align:center;padding:20px;">⏳ Memuat data...</td></tr>'; const data = await fetchJsonData('sekolah'); globalData.sekolah = data; if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="16" style="text-align:center;padding:20px;">⚠️ Data tidak tersedia</td></tr>'; return; } tbody.innerHTML = data.map((row, i) => { const npsn = escapeHtml(row['NPSN'] || '-'); const jenjang = escapeHtml(row['Jenjang'] || row['jenjang'] || '-'); const namaSekolah = escapeHtml(row['Nama Sekolah'] || row['nama_sekolah'] || '-'); const status = escapeHtml(row['Status'] || row['Status Kepemilikan'] || row['status'] || '-'); const kecamatan = escapeHtml(row['Kecamatan'] || row['kecamatan'] || '-'); const kelDesa = escapeHtml(row['Kel/Desa'] || row['Kelurahan'] || row['Desa'] || row['kel_desa'] || '-'); const alamat = escapeHtml(row['Alamat'] || row['alamat'] || '-'); const totalPM = escapeHtml(row['Total PM'] || row['total_pm'] || row['Jumlah Siswa'] || '-'); const namaPIC = escapeHtml(row['Nama PIC'] || row['PIC'] || '-'); const kepalaSekolah = escapeHtml(row['Kepala Sekolah'] || row['Kepsek'] || '-'); const noTelp = escapeHtml(row['No Telp'] || row['No. Telp'] || row['No Telp Sekolah'] || row['no_telp'] || '-'); const email = escapeHtml(row['Email'] || row['email'] || row['Email Sekolah'] || '-'); const rekening = escapeHtml(row['Rekening Insentif'] || row['Rekening'] || '-'); const mapsLink = isValidLink(row['Link Maps']) ? row['Link Maps'].trim() : null; const mapsCell = mapsLink ? `<a href="${mapsLink}" target="_blank" rel="noopener noreferrer">📍 Maps</a>` : '<span style="color:#999;">-</span>'; const waNumber = cleanWA(row['WA PIC']); const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">💬 ${escapeHtml(row['WA PIC'])}</a>` : '<span style="color:#999;">-</span>'; const emailCell = isValidLink(row['Email']) ? `<a href="mailto:${row['Email'].trim()}" target="_blank" rel="noopener noreferrer">📧 ${email}</a>` : '<span style="color:#999;">-</span>'; const noTelpClean = cleanWA(row['No Telp'] || row['No. Telp'] || row['No Telp Sekolah']); const noTelpCell = noTelpClean ? `<a href="https://wa.me/${noTelpClean}" target="_blank" rel="noopener noreferrer"> ${noTelp}</a>` : '<span style="color:#999;">-</span>'; const statusLower = (row['Status'] || row['Status Kepemilikan'] || '').toString().toLowerCase(); let statusBadge = status; if (statusLower.includes('negeri')) statusBadge = `<span style="background:linear-gradient(135deg,#22c55e,#15803d);color:#fff;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:800;">NEGERI</span>`; else if (statusLower.includes('swasta')) statusBadge = `<span style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:800;">SWASTA</span>`; return `<tr><td>${i + 1}</td><td><span class="npsn-badge">${npsn}</span></td><td><strong>${jenjang}</strong></td><td><strong>${namaSekolah}</strong></td><td>${statusBadge}</td><td>${kecamatan}</td><td>${kelDesa}</td><td style="max-width:200px;">${alamat}</td><td style="text-align:center;"><strong>${totalPM}</strong></td><td>${namaPIC}</td><td>${waCell}</td><td>${kepalaSekolah}</td><td>${noTelpCell}</td><td>${emailCell}</td><td>${rekening}</td><td>${mapsCell}</td></tr>`; }).join(''); const searchInput = document.getElementById('searchSekolah'); if (searchInput) searchInput.addEventListener('input', (e) => filterTable(e, tbody)); }
async function loadRelawan() { const tbody = document.querySelector('#tableRelawan tbody'); if (!tbody) return; tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">⏳ Memuat data...</td></tr>'; const data = await fetchJsonData('relawan'); globalData.relawan = data; if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">⚠️ Data tidak tersedia</td></tr>'; return; } tbody.innerHTML = data.map((row, i) => { const waNumber = cleanWA(row['Nomor WA']); const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">${escapeHtml(row['Nomor WA'])}</a>` : '<span style="color:#999;">-</span>'; const nikDisplay = maskNIK(row['NIK']); const nikClass = !checkAuth() ? 'masked-nik' : ''; const ktpUrl = getKTPUrl(row['Nama']); const ktpCell = row['Nama'] ? `<div class="ktp-container" onclick="handleKTPClick('${escapeHtml(row['Nama'])}', '${ktpUrl}')"><img src="${ktpUrl}" alt="KTP ${escapeHtml(row['Nama'])}" class="ktp-thumbnail" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span style="display:none;color:#666;font-size:10px;">📷 Belum ada</span></div>` : '<span style="color:#999;">-</span>'; return `<tr><td>${i + 1}</td><td><strong>${escapeHtml(row['Nama'])}</strong></td><td class="${nikClass}">${nikDisplay}</td><td>${waCell}</td><td>${escapeHtml(row['Email'])}</td><td>${escapeHtml(row['Posisi'])}</td><td>${ktpCell}</td></tr>`; }).join(''); const searchRelawan = document.getElementById('searchRelawan'); if (searchRelawan) searchRelawan.addEventListener('input', (e) => filterTable(e, tbody)); loadBirthday(); }
async function loadKoordinator() { const container = document.getElementById('cardKoordinator'); if (!container) return; container.innerHTML = '<p style="text-align:center;padding:20px;">⏳ Memuat data...</p>'; const data = await fetchJsonData('koordinator'); if (data.length === 0) { container.innerHTML = '<p style="text-align:center;padding:20px;">⚠️ Data tidak tersedia</p>'; return; } container.innerHTML = data.map(row => { const waNumber = cleanWA(row['Nomor WA']); const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">${escapeHtml(row['Nomor WA'])}</a>` : '<span style="color:#999;">Tidak ada</span>'; const emailCell = row['Email'] ? `<p>📧 <a href="mailto:${row['Email']}">${escapeHtml(row['Email'])}</a></p>` : ''; return `<div class="info-card"><h3>👔 ${escapeHtml(row['Nama'])}</h3><p><strong>${escapeHtml(row['Jabatan'])}</strong></p><p>💬 ${waCell}</p>${emailCell}</div>`; }).join(''); }
async function loadKontak() { const container = document.getElementById('cardKontak'); if (!container) return; container.innerHTML = '<p style="text-align:center;padding:20px;">⏳ Memuat data...</p>'; const data = await fetchJsonData('staff'); if (data.length === 0) { container.innerHTML = '<p style="text-align:center;padding:20px;">⚠️ Data tidak tersedia</p>'; return; } container.innerHTML = data.map(row => { const waNumber = cleanWA(row['Nomor WA']); const waCell = waNumber ? `<a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer">${escapeHtml(row['Nomor WA'])}</a>` : '<span style="color:#999;">Tidak ada</span>'; return `<div class="info-card"><h3>📞 ${escapeHtml(row['Nama'])}</h3><p><strong>${escapeHtml(row['Jabatan'])}</strong></p><p>💬 ${waCell}</p></div>`; }).join(''); }
async function loadSurat() { const container = document.getElementById('cardSurat'); if (!container) return; container.innerHTML = '<p style="text-align:center;padding:20px;"> Memuat data...</p>'; if (!globalData.relawan || globalData.relawan.length === 0) await loadRelawan(); const dataSP = await fetchJsonData('Surat Peringatan'); if (dataSP.length === 0) { container.innerHTML = '<p style="text-align:center;padding:20px;">⚠️ Belum ada surat peringatan</p>'; return; } container.innerHTML = dataSP.map(row => { const namaRelawan = escapeHtml(row['Nama Relawan']); const linkDokumen = isValidLink(row['Link Dokumen']) ? row['Link Dokumen'].trim() : null; const tanggalSP = escapeHtml(row['Tanggal SP']); const status = escapeHtml(row['Status']); const relawan = globalData.relawan.find(r => r['Nama'] && r['Nama'].toLowerCase() === row['Nama Relawan'].toLowerCase()); const email = relawan ? escapeHtml(relawan['Email']) : ''; const waNumber = relawan ? cleanWA(relawan['Nomor WA']) : ''; const posisi = relawan ? escapeHtml(relawan['Posisi']) : '-'; const filename = `Surat Peringatan - ${row['Nama Relawan']}`; const downloadBtns = linkDokumen ? `<div class="doc-download"><a href="${linkDokumen}" target="_blank" class="btn-download pdf" download="${filename}.pdf"><i class="fas fa-file-pdf"></i> PDF</a><a href="${linkDokumen}" target="_blank" class="btn-download doc" download="${filename}.docx"><i class="fas fa-file-word"></i> DOC</a></div>` : '<span style="color:#999;">Tidak ada dokumen</span>'; const shareMessage = encodeURIComponent(`Berikut Surat Peringatan untuk ${row['Nama Relawan']}. File terlampir.`); const shareBtns = `<div class="btn-share">${waNumber ? `<a href="https://wa.me/${waNumber}?text=${shareMessage}" target="_blank" class="btn-share-btn wa"><i class="fab fa-whatsapp"></i> WA</a>` : ''}${email ? `<a href="mailto:${email}?subject=${encodeURIComponent('Surat Peringatan - ' + row['Nama Relawan'])}&body=${shareMessage}" class="btn-share-btn email"><i class="fas fa-envelope"></i> Email</a>` : ''}</div>`; return `<div class="info-card warning-card"><h3>⚠️ ${namaRelawan}<span class="sp-badge">${status || 'SP'}</span></h3><div class="info-row"><div class="info-label">Posisi:</div><div class="info-value">${posisi}</div></div><div class="info-row"><div class="info-label">Tanggal SP:</div><div class="info-value">${tanggalSP}</div></div>${email ? `<div class="info-row"><div class="info-label">Email:</div><div class="info-value">${email}</div></div>` : ''}<div class="doc-actions"><div class="info-label">📥 Download Dokumen:</div>${downloadBtns}<div class="info-label" style="margin-top:10px;">Bagikan:</div>${shareBtns}</div></div>`; }).join(''); const searchSurat = document.getElementById('searchSurat'); if (searchSurat) searchSurat.addEventListener('input', (e) => { const q = e.target.value.toLowerCase(); container.querySelectorAll('.info-card').forEach(card => { card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none'; }); }); }
async function loadDokumen() { const grid = document.getElementById('docGrid'); if (!grid) return; grid.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">⏳ Memuat dokumen...</p>'; const data = await fetchJsonData('dokumen'); if (data.length === 0) { grid.innerHTML = '<div class="doc-empty"><div class="doc-empty-icon"></div><h3>Belum ada dokumen</h3></div>'; return; } const filteredData = currentFilter === 'all' ? data : data.filter(doc => doc['Kategori']?.toLowerCase() === currentFilter); const searchTerm = document.getElementById('searchDokumen')?.value.toLowerCase() || ''; const searchedData = filteredData.filter(doc => doc['Judul']?.toLowerCase().includes(searchTerm) || doc['Deskripsi']?.toLowerCase().includes(searchTerm)); const icons = { sop: '📋', template: '📝', form: '📊', sk: '📜', panduan: '📖', internal: '' }; grid.innerHTML = searchedData.map((doc) => { const category = doc['Kategori']?.toLowerCase() || 'internal'; const icon = icons[category] || ''; const linkView = isValidLink(doc['Link View']) ? doc['Link View'].trim() : (isValidLink(doc['Link Download']) ? doc['Link Download'].trim() : null); const linkDownload = isValidLink(doc['Link Download']) ? doc['Link Download'].trim() : null; let tanggalUpdate = '-'; if (doc['Tanggal Update']) { const date = new Date(doc['Tanggal Update']); tanggalUpdate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); } return `<div class="doc-item" data-category="${category}"><div class="doc-header"><div class="doc-icon">${icon}</div><div class="doc-info"><div class="doc-title">${escapeHtml(doc['Judul'])}</div><span class="doc-category">${category}</span></div></div><div class="doc-meta"><div class="doc-meta-item"><span>📅</span><span>Update: ${tanggalUpdate}</span></div>${doc['Ukuran'] ? `<div class="doc-meta-item"><span>💾</span><span>${doc['Ukuran']}</span></div>` : ''}</div>${doc['Deskripsi'] ? `<p style="font-size:13px;color:#f9a8d4;margin:10px 0;">${escapeHtml(doc['Deskripsi'])}</p>` : ''}<div class="doc-actions-grid">${linkView ? `<a href="${linkView}" target="_blank" class="btn-doc-action btn-view"><i class="fas fa-eye"></i> Lihat</a>` : ''}${linkDownload ? `<a href="${linkDownload}" download class="btn-doc-action btn-download-doc"><i class="fas fa-download"></i> Download</a>` : ''}</div></div>`; }).join(''); const searchInput = document.getElementById('searchDokumen'); if (searchInput) searchInput.addEventListener('input', () => loadDokumen()); }
function filterDokumen(category, btn) { currentFilter = category; document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); loadDokumen(); }
async function loadInfo() { const board = document.getElementById('infoBoard'); if (!board) return; board.innerHTML = '<p style="text-align:center;padding:40px;">Memuat informasi...</p>'; const data = await fetchJsonData('Papan Informasi'); globalData.info = data; document.getElementById('totalMemo').textContent = data.length; document.getElementById('totalBaru').textContent = data.filter(d => d['Baru']?.toLowerCase() === 'ya' || d['New']?.toLowerCase() === 'yes').length; document.getElementById('totalMendesak').textContent = data.filter(d => d['Prioritas']?.toLowerCase() === 'mendesak').length; renderInfoBoard(); const searchInput = document.getElementById('searchInfo'); if (searchInput) searchInput.addEventListener('input', () => renderInfoBoard()); }
function filterInfo(category, btn) { currentInfoFilter = category; document.querySelectorAll('.info-cat-btn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); renderInfoBoard(); }
function formatInfoContent(text) { if (!text) return ''; let formatted = escapeHtml(text); formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); formatted = formatted.replace(/\n/g, '<br>'); return formatted; }
function renderInfoBoard() { const board = document.getElementById('infoBoard'); if (!board) return; let data = globalData.info || []; if (currentInfoFilter !== 'all') data = data.filter(item => item['Kategori']?.toLowerCase() === currentInfoFilter); const searchTerm = document.getElementById('searchInfo')?.value.toLowerCase() || ''; if (searchTerm) data = data.filter(item => item['Judul']?.toLowerCase().includes(searchTerm) || item['Isi']?.toLowerCase().includes(searchTerm)); if (data.length === 0) { board.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📭</div><h3>Tidak ada informasi</h3></div>'; return; } data.sort((a, b) => { const dateA = new Date(a['Tanggal'] || 0); const dateB = new Date(b['Tanggal'] || 0); return dateB - dateA; }); board.innerHTML = data.map((item, idx) => { const judul = escapeHtml(item['Judul'] || 'Tanpa Judul'); const isi = item['Isi'] || ''; const kategori = (item['Kategori'] || 'pengumuman').toLowerCase(); const prioritas = (item['Prioritas'] || 'normal').toLowerCase(); const penulis = item['Penulis'] || 'Admin'; const tanggal = item['Tanggal'] ? new Date(item['Tanggal']).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'; const isNew = item['Baru']?.toLowerCase() === 'ya' || item['New']?.toLowerCase() === 'yes'; const itemId = `info-content-${idx}`; const kategoriLabel = { pengumuman: '📢 Pengumuman', memo: '📝 Memo', catatan: '📒 Catatan', penting: '⚠️ Info Penting', update: '🔄 Update' }[kategori] || kategori; const prioritasLabel = { mendesak: ' Mendesak', penting: '⚡ Penting', normal: '✅ Normal' }[prioritas] || '✅ Normal'; const contentFormatted = formatInfoContent(isi); const isLong = isi.length > 400; const shareText = encodeURIComponent(`*${item['Judul']}*\n\n${isi}\n\n— ${penulis} (${tanggal})\n_Dari Portal ASLAP SPPG JATIAN_`); return `<div class="info-item priority-${prioritas}"><div class="info-item-header"><div class="info-item-title">${judul}</div><div class="info-item-badges"><span class="info-badge kategori-${kategori}">${kategoriLabel}</span><span class="info-badge priority-${prioritas}">${prioritasLabel}</span>${isNew ? `<span class="info-badge info-badge-new">🆕 BARU</span>` : ''}</div></div><div class="info-item-meta"><div class="info-meta-item">👤 <strong>${escapeHtml(penulis)}</strong></div><div class="info-meta-item">📅 ${tanggal}</div></div><div class="info-item-content ${isLong ? 'collapsed' : ''}" id="${itemId}">${contentFormatted}</div>${isLong ? `<button class="info-toggle-btn" onclick="toggleInfoContent('${itemId}', this)">📖 Baca Selengkapnya</button>` : ''}<div class="info-item-footer"><a href="https://wa.me/?text=${shareText}" target="_blank" class="info-share-btn"><i class="fab fa-whatsapp"></i> Bagikan via WA</a></div></div>`; }).join(''); }
function toggleInfoContent(id, btn) { const el = document.getElementById(id); if (el.classList.contains('collapsed')) { el.classList.remove('collapsed'); btn.innerHTML = '📕 Tutup'; } else { el.classList.add('collapsed'); btn.innerHTML = '📖 Baca Selengkapnya'; el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }
async function loadMenuWeekly() { const container = document.getElementById('menuWeeklyContainer'); if (!container) return; container.innerHTML = '<p style="text-align:center;padding:40px;">⏳ Memuat menu mingguan...</p>'; try { const data = await fetchJsonData('Menu Mingguan'); if (data.length === 0) { container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">📅</div><h3>Belum ada menu</h3></div>'; return; } const menuByDate = {}; data.forEach(row => { const tanggal = row['Tanggal'] || ''; const menu = row['Menu'] || ''; const publishedBy = row['Dipublikasi'] || row['Penulis'] || row['Ahli Gizi'] || 'Ahli Gizi'; if (tanggal && menu && !menuByDate[tanggal]) menuByDate[tanggal] = { menu: menu, publishedBy: publishedBy }; }); let displayDates = Object.keys(menuByDate); if (currentMenuFilter !== 'all') displayDates = displayDates.filter(date => { const d = new Date(date); const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']; return days[d.getDay()] === currentMenuFilter; }); if (displayDates.length === 0) { container.innerHTML = '<div class="info-empty"><div class="info-empty-icon"></div><h3>Tidak ada menu</h3></div>'; return; } displayDates.sort((a, b) => new Date(a) - new Date(b)); const icons = { 'senin': '🌟', 'selasa': '', 'rabu': '💎', 'kamis': '🌸', 'jumat': '🕌', 'sabtu': '🎉', 'minggu': '☀️' }; container.innerHTML = displayDates.map(date => { const info = menuByDate[date]; const menuItems = info.menu ? info.menu.split('+').map(m => m.trim()).filter(m => m) : []; const d = new Date(date); const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' }); const icon = icons[dayName.toLowerCase()] || ''; return `<div class="menu-day-card"><div class="menu-day-header"><div class="menu-day-icon">${icon}</div><div class="menu-day-title"><h3>${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</h3><div class="menu-day-date">${d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div></div><div class="menu-items"><h4>🍽️ Menu Hari Ini</h4><div class="menu-list">${menuItems.map(item => `<span class="menu-item-tag">${escapeHtml(item)}</span>`).join('')}</div></div><div class="menu-published">👨 Dipublikasi oleh: <strong>${escapeHtml(info.publishedBy)}</strong></div></div>`; }).join(''); } catch (error) { console.error('Error loading menu:', error); container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">⚠️</div><h3>Gagal memuat menu</h3></div>'; } }
function filterMenuWeek(day, btn) { currentMenuFilter = day; document.querySelectorAll('.menu-week-btn').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); loadMenuWeekly(); }
async function loadRuteDistribusi() { const container = document.getElementById('ruteContent'); if (!container) return; container.innerHTML = '<p style="text-align:center;padding:40px;">Memuat data rute...</p>'; try { const data = await fetchJsonData('RuteDistribusi'); if (data.length === 0) { container.innerHTML = '<div class="info-empty"><div class="info-empty-icon">🚚</div><h3>Belum ada data rute</h3></div>'; return; } const selatan = data.filter(row => (row['Rute'] || '').toLowerCase().trim() === 'selatan'); const utara = data.filter(row => (row['Rute'] || '').toLowerCase().trim() === 'utara'); const totalSelatan = { sekolah: selatan.length, pk: selatan.reduce((sum, row) => sum + (parseInt(row['PK']) || 0), 0), pb: selatan.reduce((sum, row) => sum + (parseInt(row['PB']) || 0), 0), total: selatan.reduce((sum, row) => sum + (parseInt(row['Total']) || 0), 0) }; const totalUtara = { sekolah: utara.length, pk: utara.reduce((sum, row) => sum + (parseInt(row['PK']) || 0), 0), pb: utara.reduce((sum, row) => sum + (parseInt(row['PB']) || 0), 0), total: utara.reduce((sum, row) => sum + (parseInt(row['Total']) || 0), 0) }; const grandTotal = { pk: totalSelatan.pk + totalUtara.pk, pb: totalSelatan.pb + totalUtara.pb, total: totalSelatan.total + totalUtara.total }; const renderTable = (rows) => rows.map(row => `<tr><td><strong>${escapeHtml(row['Sekolah'])}</strong></td><td class="center">${row['PK'] || 0}</td><td class="center">${row['PB'] || 0}</td><td class="center"><strong>${row['Total'] || 0}</strong></td></tr>`).join(''); container.innerHTML = `<div class="rute-summary-grid"><div class="rute-summary-card south"><h3>🚌 Jalur Selatan</h3><div class="rute-summary-stats"><div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${totalSelatan.sekolah}</span></div><div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${totalSelatan.pk}</span></div><div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${totalSelatan.pb}</span></div></div><div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${totalSelatan.total}</span></div></div><div class="rute-summary-card north"><h3>🚐 Jalur Utara</h3><div class="rute-summary-stats"><div class="rute-summary-stat"><span class="label">Sekolah</span><span class="value">${totalUtara.sekolah}</span></div><div class="rute-summary-stat"><span class="label">Total PK</span><span class="value">${totalUtara.pk}</span></div><div class="rute-summary-stat"><span class="label">Total PB</span><span class="value">${totalUtara.pb}</span></div></div><div class="rute-summary-grand"><span class="label">Grand Total</span><span class="value">${totalUtara.total}</span></div></div></div><div class="rute-tables-grid"><div class="rute-table-wrapper south"><table class="rute-table"><thead><tr><th colspan="4">🚌 Distribusi Jalur Selatan</th></tr><tr><th>Sekolah</th><th class="center">PK</th><th class="center">PB</th><th class="center">Total</th></tr></thead><tbody>${renderTable(selatan)}</tbody><tfoot><tr><td>TOTAL SELATAN</td><td class="center">${totalSelatan.pk}</td><td class="center">${totalSelatan.pb}</td><td class="center">${totalSelatan.total}</td></tr></tfoot></table></div><div class="rute-table-wrapper north"><table class="rute-table"><thead><tr><th colspan="4"> Distribusi Jalur Utara</th></tr><tr><th>Sekolah</th><th class="center">PK</th><th class="center">PB</th><th class="center">Total</th></tr></thead><tbody>${renderTable(utara)}</tbody><tfoot><tr><td>TOTAL UTARA</td><td class="center">${totalUtara.pk}</td><td class="center">${totalUtara.pb}</td><td class="center">${totalUtara.total}</td></tr></tfoot></table></div></div><div class="rute-total-box"><h3>📊 TOTAL KESELURUHAN</h3><div class="rute-total-stats"><div class="rute-total-item"><span class="rute-total-label">Total PK</span><span class="rute-total-value">${grandTotal.pk}</span></div><div class="rute-total-item"><span class="rute-total-label">Total PB</span><span class="rute-total-value">${grandTotal.pb}</span></div><div class="rute-total-item"><span class="rute-total-label">Grand Total</span><span class="rute-total-value">${grandTotal.total}</span></div></div></div>`; } catch (error) { console.error('Error loading rute:', error); container.innerHTML = '<p style="text-align:center;padding:40px;color:#dc3545;">⚠️ Gagal memuat data rute</p>'; } }
async function loadQuote() { const data = await fetchJsonData('quote'); if (data.length > 0) { const random = data[Math.floor(Math.random() * data.length)]; document.getElementById('quoteText').textContent = `❝ ${random['Quote'] || random[Object.keys(random)[0]]} ❞`; } }
async function loadPengumuman() { const data = await fetchJsonData('pengumuman'); document.getElementById('runningText').textContent = data.length === 0 ? 'Tidak ada pengumuman.' : data.map(r => `${r['Judul'] || ''}: ${r['Isi'] || ''}`).join('   •   '); }
async function loadAgenda() { const data = await fetchJsonData('agenda'); const agendaList = document.getElementById('agendaList'); if (data.length === 0) { agendaList.innerHTML = '<p>Tidak ada agenda.</p>'; return; } const sorted = data.sort((a, b) => (a['Tanggal'] || '').localeCompare(b['Tanggal'] || '')); const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']; agendaList.innerHTML = sorted.map(row => { const date = new Date(row['Tanggal']); const day = date.getDate() || '-'; const month = bulan[date.getMonth()] || ''; return `<div class="agenda-item"><div class="agenda-date"><div class="day">${day}</div><div class="month">${month}</div></div><div class="agenda-info"><h4>${escapeHtml(row['Kegiatan'])}</h4><p>${escapeHtml(row['Keterangan'])}</p></div></div>`; }).join(''); }
async function loadBirthday() { const data = globalData.relawan; if (!data || data.length === 0) return; const today = new Date(); const todayMonth = today.getMonth() + 1; const todayDay = today.getDate(); const birthdayPersons = data.filter(row => { const tglLahir = row['Tanggal Lahir']; if (!tglLahir) return false; const date = new Date(tglLahir); return (date.getMonth() + 1) === todayMonth && date.getDate() === todayDay; }); if (birthdayPersons.length > 0) { const names = birthdayPersons.map(p => p['Nama']).join(', '); document.getElementById('birthdayText').textContent = `${names} 🎈`; const firstPerson = birthdayPersons[0]; const waNumber = cleanWA(firstPerson['Nomor WA']); if (waNumber) { const message = encodeURIComponent(`Halo ${firstPerson['Nama']}! 🎉 Selamat ulang tahun! Semoga sehat selalu. - Dari SPPG Jatian`); document.getElementById('birthdayWaLink').href = `https://wa.me/${waNumber}?text=${message}`; document.getElementById('birthdayCard').style.display = 'flex'; } } }

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => { const currentYear = new Date().getFullYear(); document.getElementById('year').textContent = currentYear; document.getElementById('footerYear').textContent = currentYear; await loadQuote(); await loadPengumuman(); await loadAgenda(); updateClock(); document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (sidebarOpen) toggleMenu(); if (document.getElementById('pinModal').classList.contains('active')) hidePINModal(); if (document.getElementById('ktpModal')?.classList.contains('active')) closeKTPModal(); } }); const firstAccordion = document.querySelector('.accordion-header'); if (firstAccordion) toggleAccordion(firstAccordion); document.getElementById('pinInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') verifyPIN(); }); const btnDownload = document.getElementById('btnDownloadRute'); if (btnDownload) { btnDownload.addEventListener('click', async () => { const element = document.getElementById('ruteContent'); if (!element) return; const originalText = btnDownload.innerHTML; btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...'; btnDownload.disabled = true; try { const canvas = await html2canvas(element, { scale: 3, backgroundColor: '#1a1a1a', useCORS: true, allowTaint: true, logging: false, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight }); const link = document.createElement('a'); link.download = 'Rute-Distribusi-SPPG-Jatian.png'; link.href = canvas.toDataURL('image/png'); link.click(); } catch (error) { console.error('Gagal mengunduh gambar:', error); alert('Gagal mengunduh gambar. Silakan coba lagi.'); } finally { btnDownload.innerHTML = originalText; btnDownload.disabled = false; } }); } });
let isAlert = false;
setInterval(() => { if (isAlert) { document.title = 'SPPG JATIAN 🚨'; } else { document.title = 'SPPG JATIAN 💥'; } isAlert = !isAlert; }, 50);

// ===== KAMERA GPS & GOOGLE DRIVE =====
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYWNJtghYhHFc_PyCqkARBruNcMNQqqJsa7-ecY_uJpj_TVo8kz31V_gkTNcodoScl/exec';
let streamKamera = null; let cameraTrack = null; let availableRearCameras = [];
let latKamera = "Mencari..."; let lngKamera = "Mencari..."; let waktuKamera = "-";
const logoImg = new Image(); logoImg.crossOrigin = "Anonymous"; logoImg.src = 'https://raw.githubusercontent.com/dopamine31/sppg-jatian/main/favicon.png';
async function startKameraGPS() { const statusEl = document.getElementById('kameraStatus'); statusEl.innerText = "Mencari lokasi & mengakses kamera..."; if (navigator.geolocation) { navigator.geolocation.watchPosition((pos) => { latKamera = pos.coords.latitude.toFixed(6); lngKamera = pos.coords.longitude.toFixed(6); }, (err) => { console.warn("GPS gagal:", err); }, { enableHighAccuracy: true }); } try { const constraints = { video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560, min: 1920 }, height: { ideal: 1440, min: 1080 } } }; const stream = await navigator.mediaDevices.getUserMedia(constraints); const videoEl = document.getElementById('kameraStream'); videoEl.srcObject = stream; streamKamera = stream; cameraTrack = stream.getVideoTracks()[0]; const capabilities = cameraTrack.getCapabilities ? cameraTrack.getCapabilities() : null; if (capabilities && capabilities.zoom) { document.getElementById('zoomSlider').max = capabilities.zoom.max || 10; } await detectCameraLenses(); videoEl.style.display = 'block'; document.getElementById('kameraCanvas').style.display = 'none'; document.getElementById('cameraLensControls').style.display = 'flex'; document.getElementById('btnStartKamera').style.display = 'none'; document.getElementById('btnJepret').style.display = 'inline-flex'; document.getElementById('btnUlangi').style.display = 'none'; document.getElementById('btnKirimDrive').style.display = 'none'; statusEl.innerText = "Kamera & GPS Siap"; } catch (err) { statusEl.innerText = "❌ Izin kamera ditolak atau kamera tidak tersedia."; } }
async function detectCameraLenses() { const devices = await navigator.mediaDevices.enumerateDevices(); availableRearCameras = devices.filter(d => d.kind === 'videoinput' && (d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment'))); ['0.5', '1', '2', '3'].forEach(zoom => { const btn = document.getElementById(`btnLens${zoom}x`); if (btn) { btn.disabled = true; btn.classList.remove('active'); } }); const lensMap = { '0.5': /0\.5|ultra wide|wide angle/i, '1': /1x|wide|back camera(?!.*\d)/i, '2': /2x|telephoto|portrait/i, '3': /3x|telephoto/i }; let foundLenses = []; availableRearCameras.forEach(cam => { for (let [zoom, regex] of Object.entries(lensMap)) { if (regex.test(cam.label)) foundLenses.push({ zoom, deviceId: cam.deviceId }); } }); if (foundLenses.length === 0 && availableRearCameras.length > 1) { availableRearCameras.forEach((cam, index) => { if (index === 0) foundLenses.push({ zoom: '1', deviceId: cam.deviceId }); if (index === 1) foundLenses.push({ zoom: '0.5', deviceId: cam.deviceId }); if (index === 2) foundLenses.push({ zoom: '2', deviceId: cam.deviceId }); }); } foundLenses.forEach(lens => { const btn = document.getElementById(`btnLens${lens.zoom}x`); if (btn) { btn.disabled = false; if (lens.zoom === '1') btn.classList.add('active'); } }); }
async function switchLens(zoomLevel) { if (!cameraTrack) return; document.querySelectorAll('.lens-btn').forEach(btn => btn.classList.remove('active')); const activeBtn = document.getElementById(`btnLens${zoomLevel}x`); if (activeBtn) activeBtn.classList.add('active'); const lensMap = { '0.5': /0\.5|ultra wide|wide angle/i, '1': /1x|wide|back camera(?!.*\d)/i, '2': /2x|telephoto|portrait/i, '3': /3x|telephoto/i }; let targetDevice = null; for (let cam of availableRearCameras) { if (lensMap[zoomLevel] && lensMap[zoomLevel].test(cam.label)) { targetDevice = cam.deviceId; break; } } if (!targetDevice && availableRearCameras.length > 1) { const index = ['0.5', '1', '2', '3'].indexOf(zoomLevel); if (index >= 0 && index < availableRearCameras.length) targetDevice = availableRearCameras[index].deviceId; } if (targetDevice) { try { await cameraTrack.applyConstraints({ deviceId: { exact: targetDevice } }); document.getElementById('zoomSlider').value = 1; document.getElementById('zoomValueDisplay').innerText = '1.0x'; } catch (e) { console.warn("Gagal switch lensa fisik:", e); } } else { applyDigitalZoom(parseFloat(zoomLevel)); } }
function applyDigitalZoom(zoomValue) { if (!cameraTrack) return; zoomValue = parseFloat(zoomValue); document.getElementById('zoomValueDisplay').innerText = zoomValue.toFixed(1) + 'x'; cameraTrack.applyConstraints({ advanced: [{ zoom: zoomValue }] }).catch(e => console.warn("Zoom tidak didukung:", e)); }
function jepretKamera() { const videoEl = document.getElementById('kameraStream'); const canvasEl = document.getElementById('kameraCanvas'); const ctx = canvasEl.getContext('2d'); const width = videoEl.videoWidth; const height = videoEl.videoHeight; canvasEl.width = width; canvasEl.height = height; ctx.drawImage(videoEl, 0, 0, width, height); const scale = width / 1000; const padding = 40 * scale; ctx.shadowColor = "rgba(0, 0, 0, 0.95)"; ctx.shadowBlur = 12 * scale; ctx.shadowOffsetX = 3 * scale; ctx.shadowOffsetY = 3 * scale; if (logoImg.complete && logoImg.naturalWidth !== 0) { ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; ctx.shadowBlur = 10 * scale; ctx.drawImage(logoImg, padding, padding, 100 * scale, 100 * scale); } ctx.fillStyle = "#ffffff"; ctx.font = `900 ${36 * scale}px Nunito, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; const textX = padding + (120 * scale); ctx.fillText("SPPG JATIAN", textX, padding + (30 * scale)); ctx.font = `bold ${28 * scale}px Nunito, sans-serif`; ctx.fillText("PAKUSARI", textX, padding + (75 * scale)); ctx.fillText("JEMBER", textX, padding + (115 * scale)); const now = new Date(); const jamString = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'); const tanggalString = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear(); const hariString = now.toLocaleDateString('id-ID', { weekday: 'long' }); waktuKamera = tanggalString + ' ' + jamString; ctx.textAlign = "right"; ctx.fillStyle = "#ffffff"; ctx.font = `bold ${32 * scale}px Nunito, sans-serif`; ctx.fillText(tanggalString, width - padding, padding + (40 * scale)); ctx.fillStyle = "#fbbf24"; ctx.font = `bold ${28 * scale}px Nunito, sans-serif`; ctx.fillText(hariString, width - padding, padding + (85 * scale)); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#ffffff"; ctx.font = `900 ${120 * scale}px Nunito, sans-serif`; ctx.fillText(jamString, padding, height - (120 * scale)); ctx.fillStyle = "#ffffff"; ctx.font = `bold ${34 * scale}px Nunito, sans-serif`; ctx.fillText("Kabupaten Jember, Jawa Timur", padding, height - (65 * scale)); ctx.fillStyle = "#fbbf24"; ctx.font = `bold ${30 * scale}px Nunito, sans-serif`; ctx.fillText(`📍 Koordinat: ${latKamera}°S, ${lngKamera}°E`, padding, height - (25 * scale)); ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; videoEl.style.display = 'none'; canvasEl.style.display = 'block'; document.getElementById('cameraLensControls').style.display = 'none'; document.getElementById('btnJepret').style.display = 'none'; document.getElementById('btnUlangi').style.display = 'inline-flex'; document.getElementById('btnKirimDrive').style.display = 'inline-flex'; document.getElementById('kameraStatus').innerText = "✅ Foto 2K berhasil distempel! Siap dikirim."; }
function ulangiFoto() { document.getElementById('kameraStream').style.display = 'block'; document.getElementById('kameraCanvas').style.display = 'none'; document.getElementById('cameraLensControls').style.display = 'flex'; document.getElementById('btnJepret').style.display = 'inline-flex'; document.getElementById('btnUlangi').style.display = 'none'; document.getElementById('btnKirimDrive').style.display = 'none'; document.getElementById('kameraStatus').innerText = "Kamera & GPS Siap! (Pilih lensa 0.5x/1x/2x)"; }
function kirimKeDrive() { const btnKirim = document.getElementById('btnKirimDrive'); const statusEl = document.getElementById('kameraStatus'); const canvasEl = document.getElementById('kameraCanvas'); btnKirim.disabled = true; btnKirim.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim 2K...'; statusEl.innerText = "⏳ Mengompres & mengunggah foto 2K ke Drive..."; const base64Image = canvasEl.toDataURL('image/jpeg', 0.92); const payload = { image: base64Image, latitude: latKamera, longitude: lngKamera, waktu: waktuKamera }; fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(() => { statusEl.innerText = "✅ Berhasil! Foto 2K masuk ke Google Drive & Sheets."; btnKirim.style.display = 'none'; btnKirim.disabled = false; btnKirim.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Kirim ke Drive'; }).catch(err => { statusEl.innerText = "❌ Gagal mengirim. Pastikan internet stabil."; btnKirim.disabled = false; btnKirim.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Coba Kirim Lagi'; }); }

// ===== REDZONE CHAT ROOM =====
const CHAT_TABLE = 'redzone_chat';
let chatUser = localStorage.getItem('redzoneUser') || '';
let chatIsAdmin = false; let replyTo = null; let unreadCount = 0; let chatOpened = false; let chatSubscribed = false;
function toggleChat() { const win = document.getElementById('chatWindow'); const visible = win.style.display !== 'none'; win.style.display = visible ? 'none' : 'flex'; if (!visible) { chatOpened = true; unreadCount = 0; updateBadge(); if (chatUser) { document.getElementById('chatNameForm').style.display = 'none'; document.getElementById('chatRoom').style.display = 'flex'; loadChat(); } } }
function updateBadge() { document.getElementById('chatBadge').textContent = unreadCount; }
function joinChat() { const name = document.getElementById('chatNameInput').value.trim(); if (!name) { alert('Nama tidak boleh kosong!'); return; } if (name.toLowerCase().startsWith('admin')) chatIsAdmin = true; chatUser = name; localStorage.setItem('redzoneUser', name); document.getElementById('chatUserLabel').textContent = name; document.getElementById('chatNameForm').style.display = 'none'; document.getElementById('chatRoom').style.display = 'flex'; loadChat(); }
function changeChatName() { localStorage.removeItem('redzoneUser'); chatUser = ''; document.getElementById('chatRoom').style.display = 'none'; document.getElementById('chatNameForm').style.display = 'flex'; }
async function loadChat() { const box = document.getElementById('chatMessages'); const { data } = await supabaseClient.from(CHAT_TABLE).select('*').order('created_at', { ascending: true }).limit(100); box.innerHTML = ''; (data || []).forEach(renderChatMsg); box.scrollTop = box.scrollHeight; subscribeChat(); }
function subscribeChat() { if (chatSubscribed) return; chatSubscribed = true; supabaseClient.channel('redzone').on('postgres_changes', { event: 'INSERT', schema: 'public', table: CHAT_TABLE }, payload => { renderChatMsg(payload.new); const box = document.getElementById('chatMessages'); box.scrollTop = box.scrollHeight; if (!chatOpened) { unreadCount++; updateBadge(); } }).subscribe(); }
function renderChatMsg(row) { const box = document.getElementById('chatMessages'); const loading = box.querySelector('.chat-loading'); if (loading) loading.remove(); const own = row.sender === chatUser; const cls = own ? 'chat-message-self' : (row.is_admin ? 'chat-message-admin' : 'chat-message-other'); const time = new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); const div = document.createElement('div'); div.className = `chat-message ${cls}`; div.innerHTML = `${!own ? `<span class="chat-message-sender">${escapeHtml(row.sender)}</span>` : ''}<div class="chat-message-bubble">${row.reply_to ? `<div class="chat-message-reply">↩ ${escapeHtml(row.reply_to)}</div>` : ''}${escapeHtml(row.message)}</div><span class="chat-message-time">${time} <button class="reply-btn" onclick="setReply('${escapeHtml(row.sender)}')">↩</button></span>`; box.appendChild(div); }
function setReply(name) { replyTo = name; document.getElementById('chatReplyPreview').style.display = 'flex'; document.getElementById('chatReplyText').textContent = 'Membalas: ' + name; }
function cancelReply() { replyTo = null; document.getElementById('chatReplyPreview').style.display = 'none'; }
async function sendChat() { const input = document.getElementById('chatInput'); const msg = input.value.trim(); if (!msg || !chatUser) return; await supabaseClient.from(CHAT_TABLE).insert([{ sender: chatUser, message: msg, reply_to: replyTo, is_admin: chatIsAdmin }]); input.value = ''; cancelReply(); }
function toggleEmoji() { const picker = document.getElementById('chatEmojiPicker'); if (picker.style.display === 'grid') { picker.style.display = 'none'; return; } const emojis = ['😀','😂','🤣','😊','😍','😘','👍','','🔥','💪','','❤️','😢','😡','👏','🤝','','🥳','😭','💖','🚨','⚠️','✅','']; picker.innerHTML = emojis.map(e => `<button class="emoji-btn" onclick="document.getElementById('chatInput').value+='${e}'">${e}</button>`).join(''); picker.style.display = 'grid'; }

// ==========================================
// STOK BARANG (Master + Mutasi + Ringkasan Mobile Friendly)
// ==========================================
let globalStok = { barang: [], totalTransaksi: 0 };

async function loadStok() {
  const grid = document.getElementById('stokGrid');
  if (!grid) return;
  document.getElementById('kartuStokView').style.display = 'none';
  document.getElementById('stokSummaryView').style.display = 'none';
  document.getElementById('stokListView').style.display = 'block';
  grid.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">⏳ Memuat data stok...</p>';
  const [barang, countRes] = await Promise.all([
    fetchJsonData('v_stok_saat_ini'),
    supabaseClient.from('mutasi_stok').select('id', { count: 'exact', head: true })
  ]);
  globalStok.barang = barang || [];
  globalStok.totalTransaksi = countRes.count || 0;
  renderStokStats();
  renderStokGrid();
  populateSelectBarang();
  const s = document.getElementById('searchStok');
  if (s) s.oninput = () => renderStokGrid();
}

function renderStokStats() {
  const el = document.getElementById('stokStats');
  if (!el) return;
  let aman = 0, menipis = 0, habis = 0;
  globalStok.barang.forEach(b => {
    const sisa = Number(b.stok_saat_ini) || 0;
    if (sisa <= 0) habis++;
    else if (sisa <= (Number(b.stok_minimum) || 0)) menipis++;
    else aman++;
  });
  el.innerHTML = `
    <div class="info-stat-item"><span class="info-stat-icon"></span><span class="info-stat-label">Jenis Barang</span><span class="info-stat-value">${globalStok.barang.length}</span></div>
    <div class="info-stat-item"><span class="info-stat-icon">🟢</span><span class="info-stat-label">Stok Aman</span><span class="info-stat-value">${aman}</span></div>
    <div class="info-stat-item"><span class="info-stat-icon">🟠</span><span class="info-stat-label">Stok Menipis</span><span class="info-stat-value">${menipis}</span></div>
    <div class="info-stat-item"><span class="info-stat-icon"></span><span class="info-stat-label">Stok Habis</span><span class="info-stat-value">${habis}</span></div>
    <div class="info-stat-item"><span class="info-stat-icon">🔄</span><span class="info-stat-label">Total Transaksi</span><span class="info-stat-value">${globalStok.totalTransaksi}</span></div>`;
}

function renderStokGrid() {
  const grid = document.getElementById('stokGrid');
  if (!grid) return;
  const q = (document.getElementById('searchStok')?.value || '').toLowerCase();
  const data = globalStok.barang.filter(b => (b.nama_barang || '').toLowerCase().includes(q) || (b.kode_barang || '').toLowerCase().includes(q));
  if (data.length === 0) {
    grid.innerHTML = '<div class="doc-empty"><div class="doc-empty-icon"></div><h3>Belum ada barang</h3><p>Klik "➕ Tambah Barang" untuk mulai mencatat.</p></div>';
    return;
  }
  grid.innerHTML = data.map(b => {
    const sisa = Number(b.stok_saat_ini) || 0;
    const min = Number(b.stok_minimum) || 0;
    const status = sisa <= 0 ? 'habis' : (sisa <= min ? 'menipis' : 'aman');
    const label = { habis: '🔴 HABIS', menipis: '🟠 MENIPIS', aman: '🟢 AMAN' }[status];
    const kodeSafe = escapeHtml(b.kode_barang);
    return `<div class="info-card stok-card ${status}">
      <span class="stok-badge ${status}">${label}</span>
      <h3>📦 ${escapeHtml(b.nama_barang)}</h3>
      <p><span class="npsn-badge">${kodeSafe}</span></p>
      <div class="info-row"><div class="info-label">Sisa Stok</div><div class="info-value stok-sisa">${sisa} ${escapeHtml(b.satuan || '')}</div></div>
      <div class="info-row"><div class="info-label">Stok Minimum</div><div class="info-value">${min} ${escapeHtml(b.satuan || '')}</div></div>
      <div class="info-row"><div class="info-label">Lokasi Rak</div><div class="info-value">${escapeHtml(b.lokasi_rak || '-')}</div></div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="info-toggle-btn" style="flex:1;margin-top:0;" onclick="openKartuStok('${kodeSafe}')">📇 Kartu Stock</button>
        <button class="btn-hapus-stok" onclick="hapusBarang('${kodeSafe}')" title="Hapus barang ini">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function populateSelectBarang() {
  const sel = document.getElementById('inputMutasiKode');
  if (!sel) return;
  sel.innerHTML = globalStok.barang.map(b => `<option value="${escapeHtml(b.kode_barang)}">${escapeHtml(b.kode_barang)} - ${escapeHtml(b.nama_barang)}</option>`).join('');
}

async function openKartuStok(kode) {
  const b = globalStok.barang.find(x => x.kode_barang === kode);
  if (!b) return;
  document.getElementById('stokListView').style.display = 'none';
  document.getElementById('stokSummaryView').style.display = 'none';
  document.getElementById('kartuStokView').style.display = 'block';
  document.getElementById('kartuStokJudul').textContent = '📇 Kartu Stock: ' + b.nama_barang;
  document.getElementById('ksNama').textContent = b.nama_barang || '-';
  document.getElementById('ksKode').textContent = b.kode_barang || '-';
  document.getElementById('ksSatuan').textContent = b.satuan || '-';
  document.getElementById('ksLokasi').textContent = b.lokasi_rak || '-';
  document.getElementById('ksMin').textContent = b.stok_minimum || 0;
  document.getElementById('ksSisa').textContent = (Number(b.stok_saat_ini) || 0) + ' ' + (b.satuan || '');
  const tbody = document.querySelector('#tableKartuStok tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">⏳ Memuat riwayat...</td></tr>';
  const { data: rows } = await supabaseClient.from('mutasi_stok').select('id,tanggal,no_nota,keterangan,jenis,jumlah,petugas').eq('kode_barang', kode).order('tanggal', { ascending: true }).order('created_at', { ascending: true });
  let sisa = 0;
  tbody.innerHTML = (rows || []).map(m => {
    const masuk = m.jenis === 'masuk' ? Number(m.jumlah) : 0;
    const keluar = m.jenis === 'keluar' ? Number(m.jumlah) : 0;
    sisa += masuk - keluar;
    const tgl = m.tanggal ? new Date(m.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-';
    return `<tr><td>${tgl}</td><td>${escapeHtml(m.no_nota)}</td><td>${escapeHtml(m.keterangan)}</td><td class="masuk" style="text-align:center;">${masuk || '-'}</td><td class="keluar" style="text-align:center;">${keluar || '-'}</td><td style="text-align:center;"><strong>${sisa}</strong></td><td>${escapeHtml(m.petugas)}</td><td style="text-align:center;"><button class="btn-hapus-stok" onclick="hapusMutasi(${m.id},'${escapeHtml(kode)}')" title="Hapus">🗑️</button></td></tr>`;
  }).join('') || '<tr><td colspan="8" style="text-align:center;padding:20px;">Belum ada transaksi</td></tr>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function tutupKartuStok() {
  document.getElementById('kartuStokView').style.display = 'none';
  document.getElementById('stokListView').style.display = 'block';
}

function toggleFormBarang() {
  const f = document.getElementById('formBarang');
  const buka = (f.style.display === 'none' || f.style.display === '');
  f.style.display = buka ? 'grid' : 'none';
  document.getElementById('formMutasi').style.display = 'none';
}

function toggleFormMutasi() {
  const f = document.getElementById('formMutasi');
  const buka = (f.style.display === 'none' || f.style.display === '');
  f.style.display = buka ? 'grid' : 'none';
  document.getElementById('formBarang').style.display = 'none';
  if (buka) {
    document.getElementById('inputTanggal').value = new Date().toISOString().slice(0, 10);
    populateSelectBarang();
  }
}

async function simpanBarang(e) {
  e.preventDefault();
  if (!checkAuth()) { alert('🔒 Input stok terkunci! Masukkan PIN terlebih dahulu.'); showPINModal(); return; }
  const payload = {
    kode_barang: document.getElementById('inputKode').value.trim().toUpperCase(),
    nama_barang: document.getElementById('inputNama').value.trim(),
    satuan: document.getElementById('inputSatuan').value.trim() || 'pcs',
    stok_minimum: Number(document.getElementById('inputMin').value) || 0,
    lokasi_rak: document.getElementById('inputLokasi').value.trim()
  };
  const { error } = await supabaseClient.from('master_barang').insert([payload]);
  if (error) { alert('❌ Gagal simpan barang: ' + error.message); return; }
  alert('✅ Barang baru berhasil ditambahkan!');
  e.target.reset();
  document.getElementById('formBarang').style.display = 'none';
  loadStok();
}

async function simpanMutasi(e) {
  e.preventDefault();
  if (!checkAuth()) { alert('🔒 Input stok terkunci! Masukkan PIN terlebih dahulu.'); showPINModal(); return; }
  const kode = document.getElementById('inputMutasiKode').value;
  const jenis = document.getElementById('inputJenis').value;
  const jumlah = Number(document.getElementById('inputJumlah').value);
  if (!kode || !jumlah || jumlah <= 0) { alert('️ Lengkapi pilihan barang dan jumlah!'); return; }
  if (jenis === 'keluar') {
    const { data: rowStok } = await supabaseClient.from('v_stok_saat_ini').select('stok_saat_ini').eq('kode_barang', kode).single();
    const sisa = Number(rowStok?.stok_saat_ini || 0);
    if (jumlah > sisa) { alert(`❌ Stok tidak cukup! Sisa saat ini: ${sisa}`); return; }
  }
  const payload = {
    tanggal: document.getElementById('inputTanggal').value || new Date().toISOString().slice(0, 10),
    kode_barang: kode,
    jenis: jenis,
    jumlah: jumlah,
    no_nota: document.getElementById('inputNota').value.trim(),
    keterangan: document.getElementById('inputKet').value.trim(),
    petugas: document.getElementById('inputPetugas').value.trim()
  };
  const { error } = await supabaseClient.from('mutasi_stok').insert([payload]);
  if (error) { alert('❌ Gagal simpan transaksi: ' + error.message); return; }
  alert('✅ Transaksi stok berhasil dicatat!');
  e.target.reset();
  document.getElementById('formMutasi').style.display = 'none';
  loadStok();
}

async function hapusBarang(kode) {
  if (!checkAuth()) { alert('🔒 Fitur hapus terkunci! Masukkan PIN terlebih dahulu.'); showPINModal(); return; }
  const b = globalStok.barang.find(x => x.kode_barang === kode);
  if (!b) return;
  const { count } = await supabaseClient.from('mutasi_stok').select('id', { count: 'exact', head: true }).eq('kode_barang', kode);
  const pesan = count > 0 ? `⚠️ PERHATIAN!\nBarang "${b.nama_barang}" memiliki ${count} riwayat transaksi.\nSemua riwayat akan IKUT TERHAPUS permanen.\n\nLanjutkan?` : `Hapus barang "${b.nama_barang}" dari daftar?`;
  if (!confirm(pesan)) return;
  if (!confirm(' KONFIRMASI FINAL: Barang benar-benar akan dihapus permanen. Klik OK untuk melanjutkan.')) return;
  const { error: e1 } = await supabaseClient.from('mutasi_stok').delete().eq('kode_barang', kode);
  if (e1) { alert('❌ Gagal hapus riwayat: ' + e1.message); return; }
  const { error: e2 } = await supabaseClient.from('master_barang').delete().eq('kode_barang', kode);
  if (e2) { alert('❌ Gagal hapus barang: ' + e2.message); return; }
  alert('✅ Barang beserta riwayatnya berhasil dihapus.');
  loadStok();
}

async function hapusMutasi(id, kode) {
  if (!checkAuth()) { alert('🔒 Fitur hapus terkunci! Masukkan PIN terlebih dahulu.'); showPINModal(); return; }
  if (!confirm('Hapus baris transaksi ini?\nSisa stok akan dihitung ulang otomatis.')) return;
  const { error } = await supabaseClient.from('mutasi_stok').delete().eq('id', id);
  if (error) { alert(' Gagal hapus transaksi: ' + error.message); return; }
  alert('✅ Transaksi dihapus. Sisa stok dihitung ulang.');
  await loadStok();
  openKartuStok(kode);
}

// ==========================================
// FITUR RINGKASAN STOK (Mobile Friendly Card View)
// ==========================================
function toggleStokSummary() {
  const listView = document.getElementById('stokListView');
  const summaryView = document.getElementById('stokSummaryView');
  const kartuView = document.getElementById('kartuStokView');

  if (summaryView.style.display === 'none' || summaryView.style.display === '') {
    listView.style.display = 'none';
    kartuView.style.display = 'none';
    summaryView.style.display = 'block';
    renderStokSummary();
  } else {
    summaryView.style.display = 'none';
    listView.style.display = 'block';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderStokSummary() {
  const tbody = document.getElementById('tbodyRingkasanStok');
  if (!tbody || globalStok.barang.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">Belum ada data barang</td></tr>';
    return;
  }
  const sortedBarang = [...globalStok.barang].sort((a, b) => a.kode_barang.localeCompare(b.kode_barang));
  tbody.innerHTML = sortedBarang.map((b, index) => {
    const sisa = Number(b.stok_saat_ini) || 0;
    const min = Number(b.stok_minimum) || 0;
    let status = 'AMAN';
    let statusClass = 'status-aman';
    if (sisa <= 0) { status = 'HABIS'; statusClass = 'status-habis'; }
    else if (sisa <= min) { status = 'MENIPIS'; statusClass = 'status-menipis'; }

    return `
      <tr>
        <td data-label="No">${index + 1}</td>
        <td data-label="Kode"><span class="npsn-badge">${escapeHtml(b.kode_barang)}</span></td>
        <td data-label="Nama Barang"><strong>${escapeHtml(b.nama_barang)}</strong></td>
        <td data-label="Sisa Stok" class="${statusClass}" style="text-align: center;">${sisa}</td>
        <td data-label="Satuan">${escapeHtml(b.satuan || 'pcs')}</td>
      </tr>
    `;
  }).join('');
}
