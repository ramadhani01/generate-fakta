// ========== MODE MANUSIA TENGKORAK ==========

const STYLE_LOCK_SKELETON = "Ultra-realistic cinematic 3D render dari sosok kerangka humanoid dengan lapisan tubuh transparan seperti kristal/gelas menutupi tulang, tengkorak anatomi yang jelas dengan gigi terlihat dan memiliki bola mata asli, tampilan semi-x-ray, realitas edukatif dan surealis, tidak menakutkan, bukan kartun, detail ultra tinggi, fokus tajam, 8K.";

// Array untuk menyimpan ide yang sudah pernah digenerate (disimpan di localStorage agar permanen)
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
        document.getElementById('loadText').innerText = "💀 AI mencari tema fresh untuk skeleton...";
        
        // Load ide yang sudah pernah digenerate
        loadGeneratedSkeletonIdeas();
        
        // Buat daftar tema yang sudah pernah digunakan sebagai konteks
        const usedThemesContext = generatedSkeletonIdeas.length > 0 
            ? `Tema yang sudah pernah digunakan: ${generatedSkeletonIdeas.join(', ')}. JANGAN gunakan tema-tema ini, cari tema yang BENAR-BENAR BARU dan BELUM PERNAH ADA di daftar ini.`
            : `Belum ada tema yang digunakan, bebas memilih tema apapun yang fresh dan unik.`;
        
        // AI akan mencari tema sendiri
        const systemCariTema = `Anda adalah kreator konten video pendek dengan gaya "manusia tengkorak" yang ekstrem dan sinematik.

Tugas PERTAMA: Cari SATU tema FRESH dan UNIK yang BELUM PERNAH digunakan sebelumnya.

${usedThemesContext}

Tema harus tentang aktivitas manusia sehari-hari yang jika dilakukan BERLEBIHAN akan menyebabkan kerusakan fisik ekstrem pada tubuh, terutama tulang, otot, saraf, dan organ dalam.

Contoh tema (hanya referensi, JANGAN gunakan ini jika sudah ada di daftar):
- "scroll tiktok sampai otak tumpah"
- "nyetir motor nonstop sampai tulang punggung menyatu"
- "minum kopi sampai jantung berhenti"
- "tidur nonstop sampai tubuh membusuk"
- "main game sampai mata buta"

Tema harus KREATIF, BELUM PERNAH ADA, dan MENARIK. Pikirkan aktivitas modern atau tradisional yang bisa dieksploitasi secara ekstrem.

Output HANYA tema dalam SATU KALIMAT (tanpa penjelasan lain):`;
        
        // Minta AI mencari tema
        const temaResponse = await callGroq("Cari tema skeleton yang fresh dan belum pernah digunakan", systemCariTema);
        
        // Bersihkan tema dari kemungkinan tanda baca berlebih
        let randomTheme = temaResponse
            .replace(/["']/g, '')
            .replace(/^[•\-*\d.\s]+/g, '')
            .trim();
        
        // Jika tema terlalu panjang, potong
        if (randomTheme.length > 100) {
            randomTheme = randomTheme.substring(0, 100) + '...';
        }
        
        // Simpan tema yang sudah dipilih
        generatedSkeletonIdeas.push(randomTheme);
        
        // Simpan ke localStorage
        saveGeneratedSkeletonIdeas();
        
        // Batasi array agar tidak terlalu besar
        if (generatedSkeletonIdeas.length > 100) {
            generatedSkeletonIdeas = generatedSkeletonIdeas.slice(-50);
            saveGeneratedSkeletonIdeas();
        }
        
        document.getElementById('loadText').innerText = `💀 Tema ditemukan: ${randomTheme.substring(0, 50)}... Menulis narasi...`;
        
        const systemNarasi = `Anda adalah kreator konten video pendek dengan gaya "manusia tengkorak" yang ekstrem dan sinematik.

Tugas: Buat SATU narasi dengan format berikut:

[JUDUL] : Kalimat clickbait "Seberapa [kuat/lama/banyak] ... sampai ...?" (pakai emoji, maks 60 karakter)

[NARASI] : Ceritakan perubahan fisik yang terjadi secara PROGRESIF dengan struktur:

"Awalnya cuma [gejala awal]. Setelah [waktu], [penjelasan detail]. Selama [waktu] berikutnya, [penjelasan lebih ekstrem]. Memasuki [waktu], [kondisi semakin parah]. Di titik [waktu], [puncak keparahan]. Akhirnya, [kondisi paling ekstrem/kematian]."

Gunakan tema: ${randomTheme}

Kriteria WAJIB:
- Setiap tahapan memiliki PENJELASAN DETAIL (bukan cuma 1 kalimat)
- Gunakan variasi waktu: detik, menit, jam, hari (sesuai tema)
- Gambarkan sensasi fisik: nyeri, mati rasa, kram, panas, dingin, getaran, dll
- Gambarkan efek pada TUBUH: otot, tulang, saraf, organ dalam
- Narasi total 150-200 kata (cukup panjang untuk detail, tidak terlalu pendek)
- JANGAN gunakan kata "Level 1, Level 2" atau angka level
- Akhiri dengan kondisi paling ekstrem/kematian
- Bahasa Indonesia yang deskriptif, sinematik, dan mengalir

Contoh gaya (BUKAN untuk dicopy, tapi referensi struktur):
"Awalnya cuma getaran kecil di tangan, seperti handphone bergetar di saku. Setelah 2 jam duduk di motor, mati rasa menjalar dari ujung jari hingga pergelangan, kamu tidak bisa menggenggam erat. Selama 4 jam berikutnya, kram menyiksa menjalar ke lengan, otot-otot menegang seperti kabel yang ditarik, nyeri menusuk di siku. Memasuki 8 jam perjalanan, tulang belakang mulai bergeser, setiap lubang di aspal terasa seperti palu godam di punggung. Di titik 12 jam, kamu tidak bisa berdiri tegak, postur tubuh membungkuk permanen, saraf kejepit di mana-mana. Akhirnya setelah 16 jam, tulang punggung menyatu sempurna, tubuhmu kaku seperti patung, kamu menjadi bagian dari motor selamanya."

Output JSON murni: { "judul": "string", "naskah": "string" }`;
        
        const userPrompt = `Buat narasi "manusia tengkorak" dengan tema: ${randomTheme}. Narasi progresif dengan detail setiap tahapan, total 150-200 kata, tanpa level angka.`;
        
        const raw = await callGroq(userPrompt, systemNarasi);
        
        // Parse JSON dengan validasi ketat
        let parsed;
        try { 
            parsed = JSON.parse(raw); 
        } catch {
            // Coba ambil JSON dari dalam teks
            const jsonMatch = raw.match(/{[\s\S]*?}/);
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                } catch {
                    throw new Error("Gagal parse JSON dari response AI");
                }
            } else {
                throw new Error("Response AI tidak mengandung JSON yang valid");
            }
        }
        
        // Validasi parsed object
        if (!parsed || typeof parsed !== 'object') {
            throw new Error("Parsed result bukan object");
        }
        
        if (!parsed.judul || typeof parsed.judul !== 'string' || parsed.judul.trim() === '') {
            throw new Error("Judul tidak valid dari AI");
        }
        
        if (!parsed.naskah || typeof parsed.naskah !== 'string' || parsed.naskah.length < 100) {
            throw new Error("Naskah terlalu pendek atau tidak valid");
        }
        
        currentJudul = parsed.judul;
        currentNaskah = parsed.naskah;
        
        document.getElementById('judulText').innerText = currentJudul;
        document.getElementById('naskahUtama').innerText = currentNaskah;
        
        if (elevenEnabled) {
            document.getElementById('loadText').innerText = "🔊 Generate voice Rachel...";
        } else {
            document.getElementById('loadText').innerText = "⏸️ Voice disabled, lanjut ke scene...";
        }
        
        try { 
            await generateAudio(currentNaskah, false); 
        } catch (audioError) {
            if (elevenEnabled) {
                document.getElementById('audioBox').innerHTML = `<div style="color:#b91c1c;">❌ Voice error: ${audioError.message}</div>`;
            } else {
                document.getElementById('audioBox').innerHTML = `<div style="color:#6b7280;">⏸️ Voice generation dimatikan</div>`;
            }
            document.getElementById('audioBox').style.display = 'block';
        }
        
        document.getElementById('loadText').innerText = "✂️ Membagi naskah menjadi scene...";
        
        // Bagi naskah menjadi scene berdasarkan kalimat
        const kalimat = currentNaskah
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 15);
        
        const scenes = kalimat.length >= 3 ? kalimat : [currentNaskah];
        
        const jumlahScene = scenes.length;
        const totalDurasi = jumlahScene * DURASI_PER_SCENE;
        document.getElementById('sceneInfo').innerHTML = `💀 ${jumlahScene} Scene × ${DURASI_PER_SCENE} detik = ${totalDurasi} detik visual tengkorak sinematik (Tema baru: ${randomTheme.substring(0, 50)}...)`;
        
        document.getElementById('loadText').innerText = "🎨 Generate prompt visual skeleton (detail ekstrem)...";
        
        let sceneHtml = '';
        
        for(let i = 0; i < scenes.length; i++) {
            // Prompt visual yang SANGAT DETAIL berdasarkan narasi
            const systemVisual = `Anda adalah ahli pembuat prompt video sinematik untuk AI generatif. 
Buat prompt Text-to-Image dan Image-to-Video yang SANGAT DETAIL dan SINEMATIK untuk adegan berikut dari narasi "manusia tengkorak":

ADEGAN: "${scenes[i]}"

WAJIB gunakan style lock ini di AWAL setiap prompt:
${STYLE_LOCK_SKELETON}

INSTRUKSI DETAIL UNTUK PROMPT:
- Visualisasikan secara TEPAT apa yang terjadi dalam adegan tersebut
- Deskripsikan POSISI TUBUH kerangka, EKSPRESI (meskipun kerangka), dan GERAKAN
- Gambarkan EFEK FISIK yang disebutkan: nyeri, kram, getaran, patah, menyatu, dll
- Sertakan LINGKUNGAN sekitar yang relevan dengan narasi (jalan, kamar, dll)
- Gunakan istilah sinematik: close-up, extreme close-up, wide shot, dutch angle, slow motion, dll
- Deskripsikan PENCAHAYAAN: dramatis, remang-remang, silau, dll
- Deskripsikan WARNA DOMINAN dan SUASANA
- Panjang prompt 60-100 kata, sangat deskriptif

Output HARUS dengan format EXACT berikut (tanpa tambahan teks lain):

TEXT TO IMAGE:
[prompt text to image yang sangat detail disini]

IMAGE TO VIDEO:
[prompt image to video yang sangat detail disini - tambahkan instruksi gerakan, durasi, transisi]`;
            
            try {
                const visualPrompt = await callGroq(scenes[i], systemVisual);
                
                // Bersihkan visual prompt
                let cleanVisual = visualPrompt
                    .replace(/Output.*?(?=TEXT)/gi, '')
                    .replace(/Anda pembuat.*?(?=TEXT)/gi, '')
                    .trim();
                
                // Parse prompt menjadi text-to-image dan image-to-video
                let textToImage = "";
                let imageToVideo = "";
                
                const ttiMatch = cleanVisual.match(/TEXT TO IMAGE:?\s*([\s\S]*?)(?=IMAGE TO VIDEO:|$)/i);
                if (ttiMatch && ttiMatch[1]) {
                    textToImage = ttiMatch[1].trim();
                }
                
                const itvMatch = cleanVisual.match(/IMAGE TO VIDEO:?\s*([\s\S]*?)$/i);
                if (itvMatch && itvMatch[1]) {
                    imageToVideo = itvMatch[1].trim();
                }
                
                if (!textToImage) textToImage = "Prompt tidak tersedia";
                if (!imageToVideo) imageToVideo = "Prompt tidak tersedia";
                
                sceneData.push({ 
                    textToImage: textToImage,
                    imageToVideo: imageToVideo,
                    originalText: scenes[i],
                    fullPrompt: cleanVisual
                });
                
                sceneHtml += `
                    <div class="scene-item skeleton-mode" data-scene="${i}">
                        <div class="scene-number">💀 SCENE ${i+1} (${DURASI_PER_SCENE} detik)</div>
                        <div class="scene-original"><small>📝 ${scenes[i].substring(0, 80)}${scenes[i].length > 80 ? '...' : ''}</small></div>
                        
                        <div class="prompt-section">
                            <div class="prompt-label">🖼️ TEXT TO IMAGE</div>
                            <div class="prompt-content" id="tti-${i}">${textToImage.substring(0, 100)}${textToImage.length > 100 ? '...' : ''}</div>
                            <div class="scene-actions">
                                <button onclick="copyTextToImage(${i})" class="copy-tti">📋 Copy TTI</button>
                                <button onclick="showFullPrompt(${i}, 'tti')" class="view-full">👁️ Lihat</button>
                            </div>
                        </div>
                        
                        <div class="prompt-section" style="margin-top: 12px;">
                            <div class="prompt-label">🎬 IMAGE TO VIDEO</div>
                            <div class="prompt-content" id="itv-${i}">${imageToVideo.substring(0, 100)}${imageToVideo.length > 100 ? '...' : ''}</div>
                            <div class="scene-actions">
                                <button onclick="copyImageToVideo(${i})" class="copy-itv">📋 Copy ITV</button>
                                <button onclick="showFullPrompt(${i}, 'itv')" class="view-full">👁️ Lihat</button>
                            </div>
                        </div>
                        
                        <div class="scene-actions" style="margin-top: 12px;">
                            <button onclick="copyFullPrompt(${i})" class="copy-full">📋 Copy Full</button>
                            <button onclick="copyNarasi(${i})" class="copy-narasi">📝 Narasi</button>
                        </div>
                    </div>
                `;
            } catch (promptError) {
                sceneHtml += `
                    <div class="scene-item">
                        <div class="scene-number">💀 SCENE ${i+1}</div>
                        <div class="scene-prompt">Error: ${promptError.message}</div>
                    </div>
                `;
            }
        }
        
        document.getElementById('sceneGrid').innerHTML = sceneHtml;
        document.getElementById('copyPromptsBtn').style.display = 'block';
        output.style.display = 'block';
        
        updateStats('gen');
        updateStats('succ');
        showNotif(`✅ ${jumlahScene} scene skeleton dengan tema fresh: ${randomTheme.substring(0, 60)}...`);

    } catch (e) {
        updateStats('fail');
        errBox.innerHTML = `<div class="error-box">❌ Error: ${e.message}</div>`;
    } finally {
        load.style.display = 'none';
    }
}
