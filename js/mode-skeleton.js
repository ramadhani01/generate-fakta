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
================= TAHAP 1: IDE VIDEO =================
********************************************************/

async function generateVideoIdeas() {
    const systemPromptIde = `Anda adalah kreator konten video pendek yang viral.

Buat 3 ide video pendek dengan format "Seberapa lama kamu ___?".

Aturan:
- Tentang tubuh atau otak manusia saja
- Ada eskalasi seiring berjalannya waktu
- Dapat dijelaskan secara visual
- Sedikit berbahaya (tapi tidak mematikan langsung)
- Didasarkan pada kehidupan nyata

Contoh:
- Seberapa lama kamu bisa begadang tanpa tidur?
- Seberapa lama kamu bisa duduk diam tanpa bergerak?
- Seberapa lama kamu bisa menatap layar tanpa mengedip?

Output dalam format JSON:
{ "ide": [
    "Seberapa lama kamu bisa ___?",
    "Seberapa lama kamu bisa ___?",
    "Seberapa lama kamu bisa ___?"
]}`;

    const userPrompt = "Buat 3 ide video pendek dengan format Seberapa lama kamu...";  
    const raw = await callGroq(userPrompt, systemPromptIde);  
    
    let parsed;  
    try {  
        parsed = JSON.parse(raw);  
    } catch {  
        const jsonMatch = raw.match(/{[\s\S]*?}/);  
        if (jsonMatch) {  
            parsed = JSON.parse(jsonMatch[0]);  
        } else {  
            // Fallback manual  
            const lines = raw.split('\n').filter(l => l.includes('?'));  
            parsed = { ide: lines.slice(0, 3) };  
        }  
    }  
    
    return parsed.ide || [];
}

/********************************************************
================= TAHAP 2: SCRIPT ====================
********************************************************/

async function generateScript(judul, jumlahScene) {
    // Tentukan breakdown waktu berdasarkan jumlah scene
    // Scene 1: Hook
    // Scene 2 - (jumlahScene-2): Breakdown waktu
    // Scene (jumlahScene-1): Puncak efek
    // Scene jumlahScene: Closing pertanyaan

    const waktuBreakdown = [  
        "30 menit pertama",  
        "1 jam kemudian",  
        "2 jam berikutnya",  
        "4 jam berlalu",  
        "8 jam tanpa henti",  
        "12 jam kemudian",  
        "24 jam pertama",  
        "36 jam berlalu",  
        "48 jam berikutnya",  
        "3 hari kemudian",  
        "5 hari tanpa jeda",  
        "1 minggu penuh"  
    ];  
    
    // Ambil waktu sesuai jumlah scene yang dibutuhkan  
    const jumlahBreakdown = jumlahScene - 3; // hook + puncak + closing = 3 scene  
    const selectedWaktu = waktuBreakdown.slice(0, jumlahBreakdown);  
    
    const systemPromptScript = `Anda adalah penulis script video pendek viral dengan gaya "manusia tengkorak".

Buat script video dengan judul: "${judul}"
JUMLAH SCENE: ${jumlahScene}

STRUKTUR WAJIB:

1. HOOK (Scene 1):
   - Ulang judul sebagai pertanyaan pembuka
   - Contoh: "Seberapa lama kamu bisa begadang tanpa tidur?"

2. BREAKDOWN WAKTU (Scene 2 sampai Scene ${jumlahScene-2}):
   Gunakan urutan waktu berikut:
   ${selectedWaktu.map((w, i) => `Scene ${i+2}: ${w}`).join('\n')}
   
   Di setiap breakdown waktu, jelaskan:
   - Apa yang kamu rasakan secara fisik (sederhana, bisa dirasakan)
   - Perubahan kecil yang mulai terlihat
   - Contoh: "Kepala mulai berat. Mata perih. Fokus mulai buyar."

3. PUNCAK EFEK (Scene ${jumlahScene-1}):
   - Kondisi paling parah
   - Apa yang gagal berfungsi
   - Contoh: "Tangan gemetar gak terkendali. Pikiran kacau. Dunia terasa berputar."

4. CLOSING (Scene ${jumlahScene}):
   - Pertanyaan balik ke penonton
   - Contoh: "Kamu masih sanggup? Atau tubuhmu sudah menyerah dari tadi?"

ATURAN GAYA:
- Bahasa sangat sederhana, seperti orang ngobrol
- Setiap scene cukup 2-3 kalimat pendek
- Gunakan kata "kamu" agar terasa personal
- Tidak ada istilah medis atau biologi rumit

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
            // Fallback manual  
            const lines = raw.split('\n').filter(l => l.trim().length > 0);  
            parsed = { script: lines.slice(0, jumlahScene) };  
        }  
    }  
    
    return parsed.script || [];
}

/********************************************************
================= TAHAP 3: PROMPT VISUAL =============
********************************************************/

async function generateVisualPrompts(sceneText, sceneNumber, totalScene, sceneType) {
    // Tentukan framing berdasarkan tipe scene
    let framing = "wide shot";
    if (sceneType === "HOOK") {
        framing = "medium wide shot"; // Untuk hook, sedikit lebih dekat tapi tetap full body
    }

    const systemPrompt = `Anda adalah sutradara video AI yang membuat prompt untuk TEXT TO IMAGE dan IMAGE TO VIDEO secara terpisah.

Tugas: Buat prompt TEXT TO IMAGE dan IMAGE TO VIDEO untuk adegan berikut.

ADEGAN: "${sceneText}"
NOMOR ADEGAN: ${sceneNumber} dari ${totalScene}
TIPE ADEGAN: ${sceneType}
FRAMING: ${framing}

WAJIB: STYLE LOCK HARUS DITEMPATKAN DI AWAL SETIAP PROMPT.

STYLE LOCK:
${STYLE_LOCK_SKELETON}


PENTING UNTUK TEXT TO IMAGE:
- FOKUS pada material transparan seperti kristal/gelas yang menutupi tulang
- KONSISTEN dengan style lock, jangan ubah deskripsi material
- TIDAK BOLEH ada deskripsi gerakan atau aksi (karena ini gambar diam)
- TIDAK BOLEH menggunakan kata: bergerak, gemetar, bergoyah, berjalan, berlari, mengangkat, menunduk, bergeser
- Gunakan kata: berdiri, duduk, diam, dalam posisi, menunjukkan, memperlihatkan, tergambar

UNTUK TEXT TO IMAGE (gambar diam):

1. MULAI dengan STYLE LOCK di awal

2. Kemudian deskripsikan ADEGAN secara visual (APA yang terjadi, di mana lokasinya, apa yang dilakukan karakter) - GUNAKAN KATA STATIS

3. Deskripsikan POSE dan bahasa tubuh karakter secara STATIS

4. Deskripsikan FRAMING kamera (${framing}, full body visible, jangan close-up wajah)

5. Deskripsikan PENCAHAYAAN (suasana, sumber cahaya, intensitas) - FOKUS pada bagaimana cahaya berinteraksi dengan MATERIAL TRANSPARAN (efek kilau, pantulan, refraksi, bias cahaya)

6. Deskripsikan MOOD dan atmosfer yang ingin dicapai


UNTUK IMAGE TO VIDEO (video pendek):

1. MULAI dengan STYLE LOCK yang sama di awal

2. Kemudian deskripsikan adegan yang SAMA dengan TEXT TO IMAGE

3. TAMBAHKAN GERAKAN spesifik yang terjadi (tangan gemetar, kepala menunduk, tubuh bergoyah, dll)

4. Tambahkan DURASI gerakan (slow motion, normal speed, fast motion)

5. Tambahkan TRANSISI ke scene berikutnya (fade out, cut, dissolve)

6. Tambahkan EFEK KAMERA (zoom in/out, pan, tilt, handheld shake)


WAJIB:

- Full body visible (seluruh tubuh terlihat dari kepala sampai kaki)

- ${sceneType === "HOOK" ? "Medium wide shot (tubuh dari kepala sampai kaki, sedikit lebih dekat)" : "Wide shot (jarak jauh, full body)"}

- DILARANG close-up wajah

- DILARANG head-only framing

- Lingkungan HARUS relevan dengan narasi (ruangan, tempat kerja, kamar, dll sesuai konteks)

- Material transparan harus konsisten di SELURUH TUBUH, bukan hanya sebagian


Output HARUS dengan format EXACT:

TEXT TO IMAGE:
[prompt text to image lengkap dalam satu paragraf, DIMULAI DENGAN STYLE LOCK, FOKUS PADA MATERIAL TRANSPARAN, TANPA GERAKAN]

IMAGE TO VIDEO:
[prompt image to video lengkap dalam satu paragraf, DIMULAI DENGAN STYLE LOCK, DENGAN DESKRIPSI GERAKAN]`;

    const raw = await callGroq(
        `Buat prompt TEXT TO IMAGE dan IMAGE TO VIDEO untuk adegan berikut. 
        
PENTING UNTUK TEXT TO IMAGE:
- Material transparan harus KONSISTEN dengan style lock di SELURUH TUBUH
- TIDAK BOLEH ada gerakan (karena gambar diam)
- FOKUS pada pose statis dan pencahayaan yang menonjolkan efek transparan

ADEGAN:\n${sceneText}`,
        systemPrompt
    );

    // Parse TTI dan ITV dengan lebih akurat
    let textToImage = "";
    let imageToVideo = "";

    // Cari bagian TEXT TO IMAGE
    const ttiRegex = /TEXT TO IMAGE:?\s*([\s\S]*?)(?=IMAGE TO VIDEO:|$)/i;
    const ttiMatch = raw.match(ttiRegex);

    // Cari bagian IMAGE TO VIDEO
    const itvRegex = /IMAGE TO VIDEO:?\s*([\s\S]*?)$/i;
    const itvMatch = raw.match(itvRegex);

    if (ttiMatch && ttiMatch[1]) {
        textToImage = ttiMatch[1].trim();
        // Bersihkan dari kemungkinan label yang tersisa
        textToImage = textToImage.replace(/^TEXT TO IMAGE:?\s*/i, '').trim();
    }

    if (itvMatch && itvMatch[1]) {
        imageToVideo = itvMatch[1].trim();
        // Bersihkan dari kemungkinan label yang tersisa
        imageToVideo = imageToVideo.replace(/^IMAGE TO VIDEO:?\s*/i, '').trim();
    }

    // Fallback jika parsing gagal - Buat prompt TTI yang FOKUS MATERIAL TRANSPARAN TANPA GERAKAN
    if (!textToImage) {
        // Daftar pose statis berdasarkan scene type
        const poseStatis = {
            "HOOK": "berdiri tegak menghadap kamera dengan pose percaya diri, kedua tangan di samping tubuh",
            "BREAKDOWN": "duduk diam di kursi dengan kepala sedikit menunduk, tangan terkulai lemas di pangkuan, bahu sedikit membungkuk",
            "PUNCAK EFEK": "bersandar lemas di dinding, tubuh membungkuk, lutut sedikit ditekuk, tangan menggantung lemas di samping tubuh",
            "CLOSING": "berdiri diam memandang ke kejauhan dengan ekspresi tubuh lesu, tangan di saku atau terlipat"
        };
        
        // Deskripsi interaksi cahaya dengan material transparan
        const cahayaTransparan = {
            "HOOK": "Cahaya terang dari depan menyinari lapisan kristal transparan, menciptakan efek kilau dan pantulan cahaya pada permukaan gelas yang membungkus tulang, efek refraksi membuat tulang tampak seperti di dalam air",
            "BREAKDOWN": "Cahaya redup dari samping membuat lapisan transparan tampak tembus pandang dengan efek bias cahaya lembut, tulang di dalamnya terlihat samar-samar dengan efek kabur artistik",
            "PUNCAK EFEK": "Cahaya gelap dengan sumber dari belakang menciptakan efek siluet pada lapisan transparan, material kristal memantulkan cahaya remang-remang dengan efek dramatis",
            "CLOSING": "Cahaya senja hangat dari jendela menembus lapisan gelas transparan, menciptakan efek tembus pandang dan bayangan bias cahaya di lantai, kilau kristal terlihat jelas"
        };
        
        // Deskripsi material transparan yang detail dan konsisten
        const materialTransparan = "Lapisan tubuh seperti kristal/gelas bening dengan tekstur halus mengkilap di seluruh tubuh, tembus pandang sehingga tulang di dalamnya terlihat jelas, efek refraksi cahaya pada permukaan transparan, detail serat kristal yang halus, konsistensi material dari kepala sampai kaki, efek kaca bening dengan sedikit warna kebiruan pada tepinya";
        
        // Deskripsi lingkungan berdasarkan scene type
        const lingkungan = {
            "HOOK": "ruangan sederhana dengan dinding putih dan satu jendela kecil, lantai kayu",
            "BREAKDOWN": "ruangan kerja dengan meja dan kursi, lampu meja menyala redup, jam dinding menunjukkan waktu",
            "PUNCAK EFEK": "sudut ruangan dengan dinding gelap, bayangan tajam di dinding, suasana mencekam",
            "CLOSING": "ruangan dengan jendela besar menghadap ke luar, cahaya senja masuk, bayangan panjang di lantai"
        };
        
        textToImage = `${STYLE_LOCK_SKELETON} Karakter ${poseStatis[sceneType] || "berdiri diam"}. ${materialTransparan}. ${framing}, full body visible dari kepala sampai kaki. Pencahayaan: ${cahayaTransparan[sceneType] || "Cahaya dramatis menyinari lapisan transparan menciptakan efek kilau dan pantulan"}. Latar belakang: ${lingkungan[sceneType] || "ruangan dengan detail interior sesuai konteks narasi"}. Suasana ${sceneType === "PUNCAK EFEK" ? "gelap dan dramatis" : "tenang dan kontemplatif"}. SEMUA BAGIAN TUBUH memiliki lapisan transparan yang konsisten, tidak ada bagian yang opaque.`;
    }

    if (!imageToVideo) {
        // Daftar gerakan berdasarkan scene type
        const gerakan = {
            "HOOK": "Berdiri diam lalu perlahan mengangkat tangan ke depan, gerakan sangat lambat 2 detik, kamera zoom in subtle, transisi cut",
            "BREAKDOWN": "Kepala mulai terangguk-angguk lelah, bahu turun naik perlahan mengikuti napas, tangan sedikit gemetar halus, gerakan slow motion 5 detik, efek kamera handheld subtle, transisi fade out",
            "PUNCAK EFEK": "Tubuh bergoyah tidak stabil ke kiri dan kanan, tangan gemetar hebat, lutut gemetar hampir jatuh, napas tersengal terlihat dari gerakan dada, gerakan sangat lambat 6 detik dengan efek kamera handheld shake intens, transisi dissolve",
            "CLOSING": "Perlahan menunduk, bahu merosot ke bawah, napas terlihat dari gerakan dada naik turun perlahan, slow motion 4 detik, kamera zoom out subtle, transisi fade to black"
        };
        
        imageToVideo = `${STYLE_LOCK_SKELETON} Video sinematik dari adegan: ${sceneText}. Karakter kerangka humanoid dengan lapisan transparan seperti kristal/gelas konsisten di seluruh tubuh, ${framing}, full body visible. ${gerakan[sceneType] || "Gerakan lambat menunjukkan ekspresi tubuh selama 4 detik"}. Pencahayaan dinamis yang menyinari lapisan transparan menciptakan efek kilau dan pantulan saat bergerak. Material transparan tetap terlihat jelas selama gerakan. Transisi fade out di akhir.`;
    }

    // PASTIKAN STYLE LOCK ADA DI AWAL dan HAPUS DUPLIKASI
    const cleanTextToImage = textToImage.replace(new RegExp(STYLE_LOCK_SKELETON, 'g'), '').trim();
    textToImage = `${STYLE_LOCK_SKELETON} ${cleanTextToImage}`;

    // PASTIKAN TIDAK ADA KATA GERAKAN DALAM PROMPT TTI
    const kataGerakan = [
        'bergerak', 'gemetar', 'bergoyah', 'berjalan', 'berlari', 'melangkah', 
        'mengangkat', 'menunduk', 'menggeleng', 'mengangguk', 'bergeser', 
        'berpindah', 'mengayun', 'memutar', 'melambai', 'menggeliat', 'goyang',
        'shake', 'moving', 'gesture', 'aksi', 'action', 'movement'
    ];
    
    const kataTti = textToImage.split(' ');
    const filteredKata = kataTti.filter(kata => {
        const lowerKata = kata.toLowerCase();
        return !kataGerakan.some(gerak => lowerKata.includes(gerak));
    });
    textToImage = filteredKata.join(' ');

    // TAMBAHKAN PENEGAS MATERIAL TRANSPARAN jika belum ada
    if (!textToImage.toLowerCase().includes('transparan') && 
        !textToImage.toLowerCase().includes('kristal') && 
        !textToImage.toLowerCase().includes('gelas') &&
        !textToImage.toLowerCase().includes('bening')) {
        textToImage += ' Lapisan tubuh transparan seperti kristal/gelas konsisten di seluruh tubuh dari kepala sampai kaki, efek tembus pandang, material bening dengan tekstur kristal halus.';
    }

    // TAMBAHKAN PENEGAS KONSISTENSI MATERIAL
    if (!textToImage.toLowerCase().includes('seluruh tubuh') && 
        !textToImage.toLowerCase().includes('semua bagian')) {
        textToImage += ' Material transparan konsisten di seluruh tubuh, tidak ada bagian yang berbeda.';
    }

    // PASTIKAN FULL BODY VISIBLE
    if (!textToImage.toLowerCase().includes('full body') && 
        !textToImage.toLowerCase().includes('kepala sampai kaki')) {
        textToImage += ' Full body visible dari kepala sampai kaki, seluruh tubuh masuk dalam frame.';
    }

    // PASTIKAN TIDAK ADA CLOSE-UP
    if (textToImage.toLowerCase().includes('close up') || 
        textToImage.toLowerCase().includes('close-up')) {
        textToImage = textToImage.replace(/close[-\s]up/gi, 'medium wide shot');
    }

    // UNTUK ITV, pastikan style lock dan gerakan
    const cleanImageToVideo = imageToVideo.replace(new RegExp(STYLE_LOCK_SKELETON, 'g'), '').trim();
    imageToVideo = `${STYLE_LOCK_SKELETON} ${cleanImageToVideo}`;

    // TAMBAHKAN PENEGAS MATERIAL TRANSPARAN untuk ITV
    if (!imageToVideo.toLowerCase().includes('transparan') && 
        !imageToVideo.toLowerCase().includes('kristal') && 
        !imageToVideo.toLowerCase().includes('gelas')) {
        imageToVideo += ' Lapisan tubuh transparan seperti kristal/gelas konsisten di seluruh tubuh, efek tembus pandang terlihat selama gerakan.';
    }

    // PASTIKAN ITV FULL BODY
    if (!imageToVideo.toLowerCase().includes('full body')) {
        imageToVideo += ' Full body visible.';
    }

    return { 
        textToImage: textToImage,
        imageToVideo: imageToVideo,
        fullPrompt: `TEXT TO IMAGE:\n${textToImage}\n\nIMAGE TO VIDEO:\n${imageToVideo}`
    };
}

/********************************************************
================= MAIN GENERATOR =====================
********************************************************/

async function generateSkeleton() {
    // CEK APAKAH FUNGSI UTAMA TERSEDIA
    if (typeof updateStats !== 'function') {
        console.error("updateStats tidak ditemukan");
        return;
    }

    updateStats('total');  
    
    const load = document.getElementById('loading');  
    const output = document.getElementById('outputArea');  
    const errBox = document.getElementById('errorBox');  
    
    if (!load || !output || !errBox) {  
        alert("Error: Elemen tidak ditemukan. Refresh halaman.");  
        return;  
    }  
    
    load.style.display = 'block';  
    output.style.display = 'none';  
    errBox.innerHTML = '';  
    sceneData = [];  
    
    try {  
        // AMBIL JUMLAH SCENE DARI SLIDER  
        const sceneSlider = document.getElementById('sceneSlider');  
        const jumlahSceneManual = parseInt(sceneSlider?.value || 5);  
          
        // Validasi minimal scene  
        if (jumlahSceneManual < 4) {  
            throw new Error("Minimal 4 scene (Hook + 1 Breakdown + Puncak + Closing)");  
        }  
          
        document.getElementById('loadText').innerText = "💀 TAHAP 1: Mencari ide video...";  
          
        // TAHAP 1: Generate 3 ide video  
        const ideList = await generateVideoIdeas();  
          
        if (!ideList || ideList.length === 0) {  
            throw new Error("Gagal mendapatkan ide video");  
        }  
          
        // Filter ide yang sudah pernah digunakan  
        loadGeneratedSkeletonIdeas();  
        const availableIde = ideList.filter(ide => !generatedSkeletonIdeas.includes(ide));  
          
        let selectedJudul;  
        if (availableIde.length > 0) {  
            selectedJudul = availableIde[Math.floor(Math.random() * availableIde.length)];  
        } else {  
            selectedJudul = ideList[Math.floor(Math.random() * ideList.length)];  
        }  
          
        // Simpan ide yang sudah dipilih  
        generatedSkeletonIdeas.push(selectedJudul);  
        saveGeneratedSkeletonIdeas();  
          
        document.getElementById('loadText').innerText = `💀 TAHAP 2: Menulis script untuk "${selectedJudul.substring(0, 50)}..."`;  
          
        // TAHAP 2: Generate script berdasarkan judul  
        const scriptScenes = await generateScript(selectedJudul, jumlahSceneManual);  
          
        if (!scriptScenes || scriptScenes.length === 0) {  
            throw new Error("Gagal mendapatkan script");  
        }  
          
        // Gabungkan script jadi satu naskah untuk audio  
        currentJudul = selectedJudul;  
        currentNaskah = scriptScenes.join(' ');  
          
        document.getElementById('judulText').innerText = currentJudul;  
        document.getElementById('naskahUtama').innerText = currentNaskah;  
          
        // Generate audio  
        if (typeof elevenEnabled !== 'undefined' && elevenEnabled) {  
            document.getElementById('loadText').innerText = "🔊 Generate voice...";  
            try {   
                if (typeof generateAudio === 'function') {  
                    await generateAudio(currentNaskah, false);   
                }  
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
        document.getElementById('sceneInfo').innerHTML = `💀 ${scriptScenes.length} Scene × 8 detik = ${totalDurasi} detik (${minutes} menit ${seconds} detik)`;  
          
        let sceneHtml = '';  
        
        // Generate prompts untuk setiap scene dengan delay untuk menghindari rate limiting
        for(let i = 0; i < scriptScenes.length; i++) {  
            const sceneText = scriptScenes[i];  
              
            // Tentukan tipe scene  
            let sceneType = "BREAKDOWN";  
            if (i === 0) sceneType = "HOOK";  
            else if (i === scriptScenes.length - 2) sceneType = "PUNCAK EFEK";  
            else if (i === scriptScenes.length - 1) sceneType = "CLOSING";  
              
            // TAHAP 3: Generate visual prompt untuk setiap scene  
            const prompts = await generateVisualPrompts(sceneText, i+1, scriptScenes.length, sceneType);  
              
            sceneData.push({   
                textToImage: prompts.textToImage,
                imageToVideo: prompts.imageToVideo, 
                originalText: sceneText,  
                fullPrompt: prompts.fullPrompt
            });  
              
            sceneHtml += `  
                <div class="scene-item skeleton-mode" data-scene="${i}">  
                    <div class="scene-number">💀 SCENE ${i+1} - ${sceneType}</div>  
                    <div class="scene-original"><small>📝 ${sceneText.substring(0, 100)}${sceneText.length > 100 ? '...' : ''}</small></div>  
                      
                    <div class="prompt-section">  
                        <div class="prompt-label">🖼️ TEXT TO IMAGE</div>  
                        <div class="prompt-content" id="tti-${i}">${prompts.textToImage.substring(0, 120)}${prompts.textToImage.length > 120 ? '...' : ''}</div>  
                        <div class="scene-actions">  
                            <button onclick="if(typeof copyTextToImage==='function')copyTextToImage(${i})" class="copy-tti">📋 Copy TTI</button>  
                            <button onclick="if(typeof showFullPrompt==='function')showFullPrompt(${i}, 'tti')" class="view-full">👁️ Lihat</button>  
                        </div>  
                    </div>  
                      
                    <div class="prompt-section" style="margin-top: 12px;">  
                        <div class="prompt-label">🎬 IMAGE TO VIDEO</div>  
                        <div class="prompt-content" id="itv-${i}">${prompts.imageToVideo.substring(0, 120)}${prompts.imageToVideo.length > 120 ? '...' : ''}</div>  
                        <div class="scene-actions">  
                            <button onclick="if(typeof copyImageToVideo==='function')copyImageToVideo(${i})" class="copy-itv">📋 Copy ITV</button>  
                            <button onclick="if(typeof showFullPrompt==='function')showFullPrompt(${i}, 'itv')" class="view-full">👁️ Lihat</button>  
                        </div>  
                    </div>  
                      
                    <div class="scene-actions" style="margin-top: 8px;">  
                        <button onclick="if(typeof copyNarasi==='function')copyNarasi(${i})" class="copy-narasi">📝 Copy Narasi</button>  
                    </div>  
                </div>  
            `;  
            
            // Delay kecil antar scene untuk menghindari rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }  
          
        document.getElementById('sceneGrid').innerHTML = sceneHtml;  
        document.getElementById('copyPromptsBtn').style.display = 'block';  
          
        // Tampilkan tombol COPY ALL TTI dan COPY ALL ITV  
        const copyAllTTIBtn = document.getElementById('copyAllTTIBtn');  
        const copyAllITVBtn = document.getElementById('copyAllITVBtn');  
          
        if (copyAllTTIBtn) copyAllTTIBtn.style.display = 'block';  
        if (copyAllITVBtn) copyAllITVBtn.style.display = 'block';  
          
        output.style.display = 'block';  
          
        updateStats('gen');  
        updateStats('succ');  
          
        if (typeof showNotif === 'function') {  
            showNotif(`✅ ${scriptScenes.length} scene siap! Durasi: ${minutes} menit ${seconds} detik`);  
        }  

    } catch (e) {  
        console.error("Generate error:", e);  
        if (typeof updateStats === 'function') updateStats('fail');  
        errBox.innerHTML = `<div class="error-box">❌ Error: ${e.message}</div>`;  
    } finally {  
        load.style.display = 'none';  
    }
}

// Load ide yang sudah pernah digenerate (untuk mencegah duplikasi)
loadGeneratedSkeletonIdeas();

// Ekspor fungsi ke global
if (typeof window !== 'undefined') {
    window.generateSkeleton = generateSkeleton;
}
