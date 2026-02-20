// ========== MODE MANUSIA TENGKORAK ==========

const STYLE_LOCK_SKELETON = "Ultra-realistic cinematic 3D render dari sosok kerangka humanoid dengan lapisan tubuh transparan seperti kristal/gelas menutupi tulang, tengkorak anatomi yang jelas dengan gigi terlihat dan memiliki bola mata asli, tampilan semi-x-ray, realitas edukatif dan surealis, tidak menakutkan, bukan kartun, detail ultra tinggi, fokus tajam, 8K.";

// Array untuk menyimpan ide yang sudah pernah digenerate
let generatedSkeletonIdeas = [];

// Load ide yang sudah pernah digenerate dari localStorage
function loadGeneratedSkeletonIdeas() {
    const saved = localStorage.getItem('generated_skeleton_ideas');
    if (saved) {
        generatedSkeletonIdeas = JSON.parse(saved);
    } else {
        generatedSkeletonIdeas = [];
    }
}

// Simpan ide yang sudah digenerate ke localStorage
function saveGeneratedSkeletonIdeas() {
    localStorage.setItem('generated_skeleton_ideas', JSON.stringify(generatedSkeletonIdeas));
}

/********************************************************
 * ================= TAHAP 1: IDE VIDEO =================
 ********************************************************/

async function generateVideoIdeas() {
    const systemPromptIde = `Anda adalah kreator konten video pendek yang viral.

Buat 3 ide video pendek dengan format:

* "Berapa Lama Anda Bisa ___?"
* "Apa Yang Terjadi Jika Anda ___ Setiap Hari?"

Aturan:
- Tentang tubuh atau otak manusia saja
- Ada eskalasi seiring berjalannya waktu
- Dapat dijelaskan secara visual
- Sedikit berbahaya (tapi tidak mematikan langsung)
- Didasarkan pada kehidupan nyata

Untuk setiap ide, tulis:
[JUDUL] : [judul clickbait]
[DESKRIPSI] : jalur kegagalan satu kalimat dalam bahasa sederhana.

Contoh:
[JUDUL] : Berapa Lama Anda Bisa Duduk Diam Tanpa Bergerak?
[DESKRIPSI] : Otot kaku, sendi mengunci, aliran darah melambat sampai kaki mati rasa.

Output dalam format JSON:
{ "ide": [
    { "judul": "string", "deskripsi": "string" },
    { "judul": "string", "deskripsi": "string" },
    { "judul": "string", "deskripsi": "string" }
]}`;

    const userPrompt = "Buat 3 ide video pendek tentang batas tubuh manusia";
    const raw = await callGroq(userPrompt, systemPromptIde);
    
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        const jsonMatch = raw.match(/{[\s\S]*?}/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("Gagal parse ide video");
        }
    }
    
    return parsed.ide || [];
}

/********************************************************
 * ================= TAHAP 2: SCRIPT ====================
 ********************************************************/

async function generateScript(judul, jumlahScene) {
    const systemPromptScript = `Anda adalah penulis script video pendek viral.

Buat script berdurasi ${jumlahScene} scene dengan struktur ini:

STRUKTUR WAJIB:
* Scene 1: Pertanyaan pembuka (1 kalimat) - gunakan judul: "${judul}"
* Scene 2 sampai ${jumlahScene-2}: Pos pemeriksaan waktu (Jam / Hari / Minggu / Bulan / Tahun)
* Scene ${jumlahScene-1}: Momen realisasi tiba-tiba
* Scene ${jumlahScene}: Kegagalan akhir

Di setiap pos pemeriksaan (scene 2 sampai ${jumlahScene-2}) WAJIB mencakup:
- Apa yang Anda rasakan secara fisik (sederhana, bisa dirasakan)
- Apa yang Anda perhatikan secara mental (perubahan pikiran)
- Satu perbandingan yang familiar (seperti mabuk, seperti kelelahan, seperti mesin kepanasan, seperti kehilangan sinyal)
- Satu kalimat pendek lainnya

ATURAN GAYA:
- Bahasa sangat sederhana, seperti orang ngobrol
- Tidak ada nama penyakit (jangan: dehidrasi, hipertensi, dll)
- Tidak ada istilah lab atau biologi abstrak
- Setiap baris harus mudah dibayangkan secara visual
- Gunakan kata "kamu" agar terasa personal

Contoh gaya:
"Jam ke-12. Matamu mulai perih. Kepala terasa berat. Konsentrasimu buyar, seperti sinyal HP yang hilang di tengah hutan."

Output JSON murni: { "script": [ "string", "string", ... ] }`;

    const userPrompt = `Buat script ${jumlahScene} scene dengan judul: ${judul}`;
    const raw = await callGroq(userPrompt, systemPromptScript);
    
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        const jsonMatch = raw.match(/{[\s\S]*?}/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("Gagal parse script");
        }
    }
    
    return parsed.script || [];
}

/********************************************************
 * ================= TAHAP 3: PROMPT VISUAL =============
 ********************************************************/

async function generateVisualPrompt(sceneText, sceneNumber, totalScene) {
    const systemVisual = `Anda adalah sutradara video AI dan pembuat prompt untuk video fotorealistik.

Tugas: Ubah naskah narasi menjadi TEXT TO IMAGE prompt yang detail.

ADEGAN: "${sceneText}"
NOMOR ADEGAN: ${sceneNumber} dari ${totalScene}

WAJIB gunakan STYLE LOCK di AWAL setiap prompt:
${STYLE_LOCK_SKELETON}

BUAT PROMPT TEXT TO IMAGE yang MENCakup:

1. Deskripsi karakter LENGKAP (kerangka dengan lapisan transparan, detail anatomi)
2. Lingkungan spesifik yang sesuai dengan adegan
3. Pose dan bahasa tubuh yang mencerminkan narasi
4. Pembingkaian kamera (close-up, wide shot, low angle, dll)
5. Pencahayaan (dramatis, remang, kontras tinggi)
6. Suasana hati (mencekam, menegangkan, lelah)
7. Detail realisme (tekstur, bayangan, kedalaman)

Output SATU PARAGRAF PROMPT LENGKAP (80-120 kata)`;

    const raw = await callGroq(sceneText, systemVisual);
    
    let cleanPrompt = raw
        .replace(/Output.*?(?=Ultra)/gi, '')
        .replace(/Anda.*?(?=Ultra)/gi, '')
        .replace(/^"|"$/g, '')
        .trim();
    
    return cleanPrompt;
}

/********************************************************
 * ================= MAIN GENERATOR =====================
 ********************************************************/

async function generateSkeleton() {
    updateStats('total');
    
    const load = document.getElementById('loading');
    const output = document.getElementById('outputArea');
    const errBox = document.getElementById('errorBox');
    
    load.style.display = 'block';
    output.style.display = 'none';
    errBox.innerHTML = '';
    sceneData = [];
    
    try {
        // AMBIL JUMLAH SCENE DARI SLIDER
        const sceneSlider = document.getElementById('sceneSlider');
        const jumlahSceneManual = parseInt(sceneSlider?.value || 5);
        
        document.getElementById('loadText').innerText = "💀 TAHAP 1: Mencari ide video...";
        
        // TAHAP 1: Generate 3 ide video
        const ideList = await generateVideoIdeas();
        
        if (!ideList || ideList.length === 0) {
            throw new Error("Gagal mendapatkan ide video");
        }
        
        // Pilih ide pertama sebagai default (atau random)
        const selectedIde = ideList[Math.floor(Math.random() * ideList.length)];
        const selectedJudul = selectedIde.judul;
        const selectedDeskripsi = selectedIde.deskripsi;
        
        document.getElementById('loadText').innerText = `💀 TAHAP 2: Menulis script untuk "${selectedJudul.substring(0, 50)}..."`;
        
        // TAHAP 2: Generate script berdasarkan judul
        const scriptScenes = await generateScript(selectedJudul, jumlahSceneManual);
        
        if (!scriptScenes || scriptScenes.length === 0) {
            throw new Error("Gagal mendapatkan script");
        }
        
        // Gabungkan script jadi satu naskah
        currentJudul = selectedJudul;
        currentNaskah = scriptScenes.join(' ');
        
        document.getElementById('judulText').innerText = currentJudul;
        document.getElementById('naskahUtama').innerText = currentNaskah;
        
        // Generate audio
        if (elevenEnabled) {
            document.getElementById('loadText').innerText = "🔊 Generate voice...";
            try { 
                await generateAudio(currentNaskah, false); 
            } catch (audioError) {
                document.getElementById('audioBox').innerHTML = `<div style="color:#b91c1c;">❌ Voice error: ${audioError.message}</div>`;
                document.getElementById('audioBox').style.display = 'block';
            }
        } else {
            document.getElementById('loadText').innerText = "⏸️ Voice disabled, lanjut ke scene...";
            document.getElementById('audioBox').style.display = 'none';
        }
        
        document.getElementById('loadText').innerText = `💀 TAHAP 3: Membuat prompt visual untuk ${scriptScenes.length} scene...`;
        
        const totalDurasi = scriptScenes.length * 8; // 8 detik per scene
        const minutes = Math.floor(totalDurasi / 60);
        const seconds = totalDurasi % 60;
        document.getElementById('sceneInfo').innerHTML = `💀 ${scriptScenes.length} Scene × 8 detik = ${totalDurasi} detik | Ide: ${selectedDeskripsi}`;
        
        let sceneHtml = '';
        
        for(let i = 0; i < scriptScenes.length; i++) {
            const sceneText = scriptScenes[i];
            
            // TAHAP 3: Generate visual prompt untuk setiap scene
            const visualPrompt = await generateVisualPrompt(sceneText, i+1, scriptScenes.length);
            
            sceneData.push({ 
                textToImage: visualPrompt,
                originalText: sceneText,
                fullPrompt: visualPrompt
            });
            
            // Tentukan tipe scene untuk label
            let sceneType = "ESKALASI";
            if (i === 0) sceneType = "PEMBUKA";
            else if (i === scriptScenes.length - 2) sceneType = "REALISASI";
            else if (i === scriptScenes.length - 1) sceneType = "AKHIR";
            
            sceneHtml += `
                <div class="scene-item skeleton-mode" data-scene="${i}">
                    <div class="scene-number">💀 SCENE ${i+1} - ${sceneType}</div>
                    <div class="scene-original"><small>📝 ${sceneText.substring(0, 100)}${sceneText.length > 100 ? '...' : ''}</small></div>
                    
                    <div class="prompt-section">
                        <div class="prompt-label">🖼️ TEXT TO IMAGE</div>
                        <div class="prompt-content" id="tti-${i}">${visualPrompt.substring(0, 150)}${visualPrompt.length > 150 ? '...' : ''}</div>
                        <div class="scene-actions">
                            <button onclick="copyTextToImage(${i})" class="copy-tti">📋 Copy Prompt</button>
                            <button onclick="showFullPrompt(${i}, 'tti')" class="view-full">👁️ Lihat</button>
                        </div>
                    </div>
                    
                    <div class="scene-actions" style="margin-top: 8px;">
                        <button onclick="copyNarasi(${i})" class="copy-narasi">📝 Copy Narasi</button>
                    </div>
                </div>
            `;
        }
        
        document.getElementById('sceneGrid').innerHTML = sceneHtml;
        document.getElementById('copyPromptsBtn').style.display = 'block';
        output.style.display = 'block';
        
        updateStats('gen');
        updateStats('succ');
        showNotif(`✅ ${scriptScenes.length} scene siap! Durasi: ${minutes} menit ${seconds} detik`);

    } catch (e) {
        updateStats('fail');
        errBox.innerHTML = `<div class="error-box">❌ Error: ${e.message}</div>`;
        console.error(e);
    } finally {
        load.style.display = 'none';
    }
}

// Load ide yang sudah pernah digenerate (untuk mencegah duplikasi)
loadGeneratedSkeletonIdeas();
