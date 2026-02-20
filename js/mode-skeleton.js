// ========== MODE MANUSIA TENGKORAK ==========

const STYLE_LOCK_SKELETON = "Ultra-realistic cinematic 3D render dari sosok kerangka humanoid dengan lapisan tubuh transparan seperti kristal/gelas menutupi tulang, tengkorak anatomi yang jelas dengan gigi terlihat dan memiliki bola mata, tampilan semi-x-ray, biasan cahaya pelangi halus di dalam tubuh transparan, realitas edukatif dan surealis, tidak menakutkan, bukan kartun, detail ultra tinggi, fokus tajam, 8K.";

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

// Daftar waktu yang bisa digunakan untuk eskalasi
const timeMarkers = [
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
        // HITUNG JUMLAH SCENE UNTUK DURASI 45-70 DETIK (4-6 DETIK PER SCENE)
        // Target durasi: 45-70 detik, dengan asumsi 5 detik per scene
        const minScene = Math.ceil(45 / 6); // 45/6 = 8 scene (minimal)
        const maxScene = Math.floor(70 / 4); // 70/4 = 17 scene (maksimal)
        const idealScene = Math.floor((minScene + maxScene) / 2); // Sekitar 12-13 scene
        
        // Gunakan slider jika ada, tapi batasi dalam range
        const sceneSlider = document.getElementById('sceneSlider');
        let jumlahSceneManual = parseInt(sceneSlider.value);
        
        // Batasi agar durasi tetap 45-70 detik
        if (jumlahSceneManual < 8) jumlahSceneManual = 8;
        if (jumlahSceneManual > 17) jumlahSceneManual = 17;
        
        // Hitung estimasi durasi
        const durasiPerScene = 5; // 5 detik rata-rata
        const estimasiDurasi = jumlahSceneManual * durasiPerScene;
        
        document.getElementById('loadText').innerText = `💀 Mencari ide viral dengan ${jumlahSceneManual} scene (estimasi ${estimasiDurasi} detik)...`;
        
        // Load ide yang sudah pernah digenerate
        loadGeneratedSkeletonIdeas();
        
        // Buat daftar tema yang sudah pernah digunakan sebagai konteks
        const usedThemesContext = generatedSkeletonIdeas.length > 0 
            ? `Tema yang sudah pernah digunakan: ${generatedSkeletonIdeas.join(', ')}. JANGAN gunakan tema-tema ini, cari ide yang BENAR-BENAR BARU.`
            : `Belum ada tema yang digunakan, bebas memilih ide apapun yang fresh.`;
        
        // AI mencari ide sendiri - BUAT JUDUL PENDEK (MAX 8 KATA)
        const systemCariIde = `Anda adalah kreator konten edukasi viral dengan gaya "manusia tengkorak" yang ekstrem dan sinematik.

Tugas: Cari SATU ide konten yang BELUM PERNAH digunakan sebelumnya.

${usedThemesContext}

Buat ide dengan format:
"Berapa lama [aktivitas singkat]?"
ATAU
"Apa yang terjadi jika [aktivitas singkat]?"

PENTING: BUAT JUDUL SESINGKAT MUNGKIN (MAKSIMAL 8 KATA)

Contoh judul BAGUS (pendek):
- "Berapa lama begadang?"
- "Berapa lama di ruang gelap?"
- "Apa efek kopi setiap hari?"
- "Berapa lama main game?"
- "Apa terjadi jika tidur 4 jam?"

Contoh judul TERLALU PANJANG (JANGAN):
- "Berapa lama kamu bisa bertahan di ruangan gelap total tanpa cahaya?" (terlalu panjang)

Ide harus tentang aktivitas manusia sehari-hari yang jika dilakukan BERLEBIHAN akan menyebabkan efek ekstrem pada tubuh.

Cari ide yang fresh, unik, dan belum pernah ada.

Output HANYA ide dalam SATU KALIMAT PENDEK dengan format yang ditentukan:`;
        
        // Minta AI mencari ide
        const ideResponse = await callGroq("Cari ide viral pendek untuk skeleton...", systemCariIde);
        
        // Bersihkan ide dan pastikan pendek
        let randomIde = ideResponse
            .replace(/["']/g, '')
            .replace(/^[•\-*\d.\s]+/g, '')
            .trim();
        
        // Potong jika terlalu panjang (maks 8 kata)
        const words = randomIde.split(' ');
        if (words.length > 8) {
            randomIde = words.slice(0, 8).join(' ') + '...?';
        }
        
        // Pastikan ide memiliki format yang benar
        if (!randomIde.includes('?')) {
            randomIde = randomIde + '?';
        }
        
        // Simpan ide yang sudah dipilih
        generatedSkeletonIdeas.push(randomIde);
        saveGeneratedSkeletonIdeas();
        
        // Batasi array agar tidak terlalu besar
        if (generatedSkeletonIdeas.length > 100) {
            generatedSkeletonIdeas = generatedSkeletonIdeas.slice(-50);
            saveGeneratedSkeletonIdeas();
        }
        
        document.getElementById('loadText').innerText = `💀 Ide: ${randomIde} | Membuat narasi singkat...`;
        
        // Pilih time markers sesuai jumlah scene
        const selectedTimeMarkers = timeMarkers.slice(0, jumlahSceneManual - 1); // Scene 1 adalah hook
        
        // SYSTEM PROMPT UNTUK NARASI SINGKAT
        const systemNarasi = `Anda adalah penulis script video edukasi viral dengan gaya "manusia tengkorak".

Judul: ${randomIde}
JUMLAH SCENE: ${jumlahSceneManual} scene
TARGET DURASI: 45-70 detik (setiap scene 4-6 detik saat dibaca)

BUAT NARASI SANGAT SINGKAT PADAT JELAS:

Scene 1 (HOOK - MAKS 3 KALIMAT):
Tulis ulang judul sebagai pertanyaan, tambah 1 kalimat hook.

Scene 2 sampai Scene ${jumlahSceneManual} (ESKALASI - SETIAP SCENE 2-3 KALIMAT):
Gunakan checkpoint waktu secara berurutan:
${selectedTimeMarkers.map((marker, index) => `Scene ${index+2}: ${marker}`).join('\n')}

FORMAT SETIAP SCENE ESKALASI:
- Efek fisik (SINGKAT, 1 kalimat)
- Sensasi tubuh (SINGKAT, 1 kalimat)
- Kondisi mental (opsional, 1 kalimat jika perlu)

CONTOH GAYA SINGKAT:
Scene 1:
Berapa lama di ruang gelap? Tubuhmu akan memberontak tanpa kamu duga.

Scene 2:
30 menit pertama. Mata buta total. Pupil membesar maksimal. Kepala pusing.

Scene 3:
1 jam kemudian. Keseimbangan hilang. Tangan meraba dinding panik.

Gunakan tema: ${randomIde}

STYLE LOCK:
- Bahasa Indonesia SANGAT SINGKAT
- Scene 1: maksimal 3 kalimat
- Scene 2-${jumlahSceneManual}: 2-3 kalimat per scene
- Checkpoint waktu HARUS disebut di awal setiap scene
- Semakin cepat, semakin ekstrem

Output hanya narasi untuk setiap scene. Format WAJIB:
Scene 1: [narasi]
Scene 2: [narasi]
...
Scene ${jumlahSceneManual}: [narasi]`;
        
        const userPrompt = `Buat narasi SANGAT SINGKAT untuk video 45-70 detik dengan judul: ${randomIde}. ${jumlahSceneManual} scene, masing-masing 2-3 kalimat.`;
        
        const rawNarasi = await callGroq(userPrompt, systemNarasi);
        
        // Parse narasi menjadi array per scene
        const sceneLines = rawNarasi.split('\n').filter(line => line.trim().length > 0);
        const scenes = [];
        let currentScene = "";
        
        for (let line of sceneLines) {
            if (line.match(/^Scene \d+:/i)) {
                if (currentScene) scenes.push(currentScene.trim());
                currentScene = line.replace(/^Scene \d+:\s*/i, '').trim();
            } else {
                currentScene += " " + line.trim();
            }
        }
        if (currentScene) scenes.push(currentScene.trim());
        
        // Pastikan jumlah scene sesuai
        while (scenes.length < jumlahSceneManual) {
            scenes.push("...");
        }
        
        // Gabungkan semua scene menjadi satu naskah untuk audio
        currentNaskah = scenes.join(' ');
        currentJudul = randomIde;
        
        document.getElementById('judulText').innerText = currentJudul;
        document.getElementById('naskahUtama').innerText = currentNaskah;
        
        // Hitung durasi berdasarkan jumlah kata (asumsi 150 kata/menit)
        const wordCount = currentNaskah.split(' ').length;
        const estimatedDuration = Math.ceil(wordCount / 2.5); // 150 kata/menit = 2.5 kata/detik
        
        if (elevenEnabled) {
            document.getElementById('loadText').innerText = `🔊 Generate voice (estimasi ${estimatedDuration} detik)...`;
            
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
        
        const totalDurasi = jumlahSceneManual * 5; // 5 detik per scene (estimasi)
        const minutes = Math.floor(totalDurasi / 60);
        const seconds = totalDurasi % 60;
        document.getElementById('sceneInfo').innerHTML = `💀 ${jumlahSceneManual} Scene | ${totalDurasi} dtk | ${randomIde}`;
        
        document.getElementById('loadText').innerText = "🎨 Generate prompt visual...";
        
        let sceneHtml = '';
        
        for(let i = 0; i < scenes.length; i++) {
            const sceneText = scenes[i];
            const timeInfo = i === 0 ? "HOOK" : (selectedTimeMarkers[i-1] || `Scene ${i+1}`);
            
            // Tentukan angle kamera bervariasi
            const cameraAngles = [
                "low angle shot",
                "high angle shot", 
                "dutch angle shot",
                "eye level shot",
                "wide shot from side",
                "three-quarter angle",
                "long shot from behind"
            ];
            const cameraAngle = cameraAngles[i % cameraAngles.length];
            
            // ========== PROMPT TEXT-TO-IMAGE ==========
            const systemTTI = `You are an expert in creating TEXT-TO-IMAGE prompts.

SCENE: "${sceneText}"
TIME: ${timeInfo}

START with STYLE LOCK:
${STYLE_LOCK_SKELETON}

Then describe:
1. WHAT is happening in the scene
2. WHERE it takes place
3. WHAT the character is doing
4. SKELETON POSE (standing, sitting, leaning, etc.)
5. CAMERA: ${cameraAngle}, FULL BODY VISIBLE (head to toe, NO FACE CLOSE-UP)
6. LIGHTING: dim, shadows, rainbow refractions
7. BACKGROUND: relevant to scene

Output ONE PARAGRAPH starting with STYLE LOCK:`;

            // ========== PROMPT IMAGE-TO-VIDEO ==========
            const systemITV = `You are an expert in creating IMAGE-TO-VIDEO prompts.

SCENE: "${sceneText}"
TIME: ${timeInfo}

START with STYLE LOCK:
${STYLE_LOCK_SKELETON}

Then describe:
1. The SAME scene as TTI
2. MOVEMENTS: trembling, swaying, nodding, etc.
3. DURATION: 4-5 seconds, slow motion
4. TRANSITION: fade out/cut/dissolve
5. CAMERA ANGLE: ${cameraAngle} (varies per scene)
6. FULL BODY VISIBLE throughout

Output ONE PARAGRAPH starting with STYLE LOCK:`;
            
            try {
                // Generate TTI prompt
                const ttiPrompt = await callGroq(sceneText, systemTTI);
                
                // Generate ITV prompt
                const itvPrompt = await callGroq(sceneText, systemITV);
                
                // Bersihkan dan pastikan format
                let cleanTTI = ttiPrompt.trim();
                if (!cleanTTI.startsWith(STYLE_LOCK_SKELETON.substring(0, 30))) {
                    cleanTTI = `${STYLE_LOCK_SKELETON} ${cleanTTI}`;
                }
                
                let cleanITV = itvPrompt.trim();
                if (!cleanITV.startsWith(STYLE_LOCK_SKELETON.substring(0, 30))) {
                    cleanITV = `${STYLE_LOCK_SKELETON} ${cleanITV}`;
                }
                
                // Hapus instruksi yang tersisa
                cleanTTI = cleanTTI
                    .replace(/Output.*?(?=Ultra)/gi, '')
                    .replace(/You.*?(?=Ultra)/gi, '')
                    .replace(/^"|"$/g, '')
                    .trim();
                
                cleanITV = cleanITV
                    .replace(/Output.*?(?=Ultra)/gi, '')
                    .replace(/You.*?(?=Ultra)/gi, '')
                    .replace(/^"|"$/g, '')
                    .trim();
                
                // Pastikan full body visible
                if (!cleanTTI.toLowerCase().includes('full body')) {
                    cleanTTI += ' Full body visible from head to toe, no face close-up.';
                }
                
                if (!cleanITV.toLowerCase().includes('full body')) {
                    cleanITV += ' Full body visible throughout movement.';
                }
                
                sceneData.push({ 
                    textToImage: cleanTTI,
                    imageToVideo: cleanITV,
                    originalText: sceneText,
                    fullPrompt: `text to image:\n${cleanTTI}\n\nimage to video\n${cleanITV}`
                });
                
                sceneHtml += `
                    <div class="scene-item skeleton-mode" data-scene="${i}">
                        <div class="scene-number">💀 SCENE ${i+1} - ${timeInfo}</div>
                        <div class="scene-original"><small>📝 ${sceneText.substring(0, 100)}${sceneText.length > 100 ? '...' : ''}</small></div>
                        
                        <div class="prompt-section">
                            <div class="prompt-label">🖼️ TTI</div>
                            <div class="prompt-content" id="tti-${i}">${cleanTTI.substring(0, 100)}...</div>
                            <div class="scene-actions">
                                <button onclick="copyTextToImage(${i})" class="copy-tti">📋 Copy TTI</button>
                                <button onclick="showFullPrompt(${i}, 'tti')" class="view-full">👁️ Lihat</button>
                            </div>
                        </div>
                        
                        <div class="prompt-section" style="margin-top: 8px;">
                            <div class="prompt-label">🎬 ITV</div>
                            <div class="prompt-content" id="itv-${i}">${cleanITV.substring(0, 100)}...</div>
                            <div class="scene-actions">
                                <button onclick="copyImageToVideo(${i})" class="copy-itv">📋 Copy ITV</button>
                                <button onclick="showFullPrompt(${i}, 'itv')" class="view-full">👁️ Lihat</button>
                            </div>
                        </div>
                        
                        <div style="margin-top: 8px;">
                            <button onclick="copyNarasi(${i})" class="copy-narasi">📝 Copy Scene ${i+1}</button>
                        </div>
                    </div>
                `;
            } catch (promptError) {
                sceneHtml += `<div class="scene-item">Error scene ${i+1}</div>`;
            }
            
            // Delay kecil
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        document.getElementById('sceneGrid').innerHTML = sceneHtml;
        document.getElementById('copyPromptsBtn').style.display = 'block';
        document.getElementById('copyAllTTIBtn').style.display = 'block';
        document.getElementById('copyAllITVBtn').style.display = 'block';
        output.style.display = 'block';
        
        updateStats('gen');
        updateStats('succ');
        showNotif(`✅ ${jumlahSceneManual} scene | ${totalDurasi} dtk | ${randomIde}`);

    } catch (e) {
        updateStats('fail');
        errBox.innerHTML = `<div class="error-box">❌ Error: ${e.message}</div>`;
    } finally {
        load.style.display = 'none';
    }
}

// Load ide yang sudah pernah digenerate
loadGeneratedSkeletonIdeas();

// Ekspor fungsi ke global
if (typeof window !== 'undefined') {
    window.generateSkeleton = generateSkeleton;
}
