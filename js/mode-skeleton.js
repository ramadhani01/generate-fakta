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
        // AMBIL JUMLAH SCENE DARI SLIDER
        const sceneSlider = document.getElementById('sceneSlider');
        const jumlahSceneManual = parseInt(sceneSlider.value);
        
        document.getElementById('loadText').innerText = `💀 Mencari ide viral dengan ${jumlahSceneManual} scene...`;
        
        // Load ide yang sudah pernah digenerate
        loadGeneratedSkeletonIdeas();
        
        // Buat daftar tema yang sudah pernah digunakan sebagai konteks
        const usedThemesContext = generatedSkeletonIdeas.length > 0 
            ? `Tema yang sudah pernah digunakan: ${generatedSkeletonIdeas.join(', ')}. JANGAN gunakan tema-tema ini, cari ide yang BENAR-BENAR BARU.`
            : `Belum ada tema yang digunakan, bebas memilih ide apapun yang fresh.`;
        
        // AI mencari ide sendiri dengan format "Berapa lama kamu bisa___?" atau "Apa yang terjadi jika kamu___setiap hari?"
        const systemCariIde = `Anda adalah kreator konten edukasi viral dengan gaya "manusia tengkorak" yang ekstrem dan sinematik.

Tugas: Cari SATU ide konten yang BELUM PERNAH digunakan sebelumnya.

${usedThemesContext}

Buat ide dengan format:
"Berapa lama kamu bisa [aktivitas]?"
ATAU
"Apa yang terjadi jika kamu [aktivitas] setiap hari?"

Ide harus tentang aktivitas manusia sehari-hari yang jika dilakukan BERLEBIHAN akan menyebabkan efek ekstrem pada tubuh.

Contoh ide (jangan gunakan ini):
- "Berapa lama kamu bisa memakai VR tanpa dilepas?"
- "Apa yang terjadi jika kamu minum kopi setiap hari?"
- "Berapa lama kamu bisa begadang tanpa tidur?"
- "Apa yang terjadi jika kamu makan mie instan setiap hari?"

Cari ide yang fresh, unik, dan belum pernah ada. Pikirkan aktivitas modern yang bisa dieksploitasi secara edukatif dan ekstrem.

Output HANYA ide dalam SATU KALIMAT dengan format yang ditentukan:`;
        
        // Minta AI mencari ide
        const ideResponse = await callGroq("Cari ide viral untuk skeleton...", systemCariIde);
        
        // Bersihkan ide dari kemungkinan tanda baca berlebih
        let randomIde = ideResponse
            .replace(/["']/g, '')
            .replace(/^[•\-*\d.\s]+/g, '')
            .trim();
        
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
        
        document.getElementById('loadText').innerText = `💀 Ide ditemukan: ${randomIde.substring(0, 50)}... Membuat narasi...`;
        
        // Pilih time markers sesuai jumlah scene
        const selectedTimeMarkers = timeMarkers.slice(0, jumlahSceneManual - 1); // Scene 1 adalah hook
        
        // SYSTEM PROMPT UNTUK NARASI
        const systemNarasi = `Anda adalah penulis script video edukasi viral dengan gaya "manusia tengkorak".

Judul: ${randomIde}
JUMLAH SCENE: ${jumlahSceneManual} scene

BUAT NARASI DENGAN FORMAT WAJIB:

Scene 1 (HOOK):
Tulis ulang judul sebagai pertanyaan, lalu tambahkan 2-3 kalimat hook yang menarik.

Scene 2 sampai Scene ${jumlahSceneManual} (ESKALASI):
Gunakan checkpoint waktu secara berurutan:
${selectedTimeMarkers.map((marker, index) => `Scene ${index+2}: ${marker}`).join('\n')}

Setiap scene eskalasi HARUS mengandung:
- Deskripsi efek fisik yang semakin parah
- Sensasi yang bisa dirasakan
- Perubahan pada tubuh
- Semakin ekstrem setiap scene
- SETIAP SCENE HARUS 3-4 KALIMAT

CONTOH GAYA (untuk referensi, jangan dicopy):
Scene 1 (HOOK):
Berapa lama kamu bisa bertahan di ruangan gelap total tanpa cahaya sedikit pun? Mungkin awalnya terasa seperti petualangan seru, tapi tubuhmu akan bereaksi dengan cara yang tidak kamu duga. Kegelapan total ternyata bisa mengacaukan sistem sarafmu.

Scene 2:
30 menit pertama. Matamu berusaha keras mencari cahaya tapi tidak menemukan apa-apa. Pupil matamu membesar maksimal mencoba menangkap bayangan. Kepala mulai terasa pusing dan dunia terasa berputar meski kamu diam.

Gunakan tema: ${randomIde}

STYLE LOCK:
- Bahasa Indonesia yang deskriptif dan mengalir
- Setiap scene 3-4 kalimat
- Gunakan checkpoint waktu yang sudah ditentukan
- Semakin lama semakin ekstrem

Output hanya narasi untuk setiap scene. Format:
Scene 1: [narasi]
Scene 2: [narasi]
...
Scene ${jumlahSceneManual}: [narasi]`;
        
        const userPrompt = `Buat narasi edukasi viral dengan judul: ${randomIde}. Gunakan ${jumlahSceneManual} scene dengan checkpoint waktu yang sesuai. SETIAP SCENE HARUS 3-4 KALIMAT.`;
        
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
        
        const totalDurasi = jumlahSceneManual * 8; // 8 detik per scene
        const minutes = Math.floor(totalDurasi / 60);
        const seconds = totalDurasi % 60;
        document.getElementById('sceneInfo').innerHTML = `💀 ${jumlahSceneManual} Scene × 8 detik = ${totalDurasi} detik | ${randomIde.substring(0, 40)}...`;
        
        document.getElementById('loadText').innerText = "🎨 Generate prompt TTI & ITV untuk setiap scene...";
        
        let sceneHtml = '';
        
        for(let i = 0; i < scenes.length; i++) {
            const sceneText = scenes[i];
            const timeInfo = i === 0 ? "HOOK" : (selectedTimeMarkers[i-1] || `Scene ${i+1}`);
            
            // Tentukan angle kamera bervariasi untuk setiap scene
            const cameraAngles = [
                "low angle shot",
                "high angle shot",
                "dutch angle shot",
                "eye level shot", 
                "over the shoulder shot",
                "wide shot from side",
                "three-quarter angle",
                "long shot from behind"
            ];
            const cameraAngle = cameraAngles[i % cameraAngles.length];
            
            // ========== PROMPT TEXT-TO-IMAGE ==========
            const systemTTI = `You are an expert in creating TEXT-TO-IMAGE prompts for AI generative art.

SCENE: "${sceneText}"
TIME: ${timeInfo}

You MUST include this STYLE LOCK at the BEGINNING of your prompt:
${STYLE_LOCK_SKELETON}

CREATE A TEXT-TO-IMAGE PROMPT with EXACTLY this format:

1. START with STYLE LOCK at the beginning

2. Then describe WHAT is happening in the scene, WHERE it takes place, and WHAT the character is doing

3. Describe the SKELETON BODY POSITION and POSE in detail

4. Describe CAMERA FRAMING: ${cameraAngle}, FULL BODY VISIBLE from head to toe (NO CLOSE-UP on face)

5. Describe LIGHTING: dim, long shadows, high contrast, with subtle rainbow light refractions through transparent body

6. Describe BACKGROUND that matches the narrative context

7. Describe MOOD and atmosphere

IMPORTANT RULES:
- FULL BODY MUST BE VISIBLE at all times
- NO CLOSE-UP on face or head-only framing
- DO NOT add movement instructions, duration, or transitions
- Use STATIC descriptions only (standing, sitting, leaning, etc.)
- Environment MUST be relevant to the scene

Output ONE PARAGRAPH TEXT-TO-IMAGE PROMPT that starts with STYLE LOCK:`;

            // ========== PROMPT IMAGE-TO-VIDEO ==========
            const systemITV = `You are an expert in creating IMAGE-TO-VIDEO prompts for AI generative art.

SCENE: "${sceneText}"
TIME: ${timeInfo}

You MUST include this STYLE LOCK at the BEGINNING of your prompt:
${STYLE_LOCK_SKELETON}

CREATE AN IMAGE-TO-VIDEO PROMPT with EXACTLY this format:

1. START with STYLE LOCK at the beginning

2. Then describe the SAME scene as TEXT-TO-IMAGE

3. ADD SPECIFIC MOVEMENTS that occur (trembling hands, head nodding, body swaying, etc.)

4. Add MOVEMENT DURATION: 3-5 seconds, slow motion

5. Add TRANSITION to next scene (fade out, cut, dissolve)

6. Add CAMERA EFFECTS (slow zoom, pan, tilt, handheld shake)

7. Describe CAMERA ANGLE: ${cameraAngle}, vary for each scene

IMPORTANT RULES:
- FULL BODY MUST BE VISIBLE at all times
- NO CLOSE-UP on face or head-only framing
- Background must match the scene context
- Focus on visual clarity, anatomical emphasis, story through environment
- DO NOT include narration, dialogue, or explanations

Output ONE PARAGRAPH IMAGE-TO-VIDEO PROMPT that starts with STYLE LOCK and focuses on MOVEMENT and DURATION:`;
            
            try {
                // Generate TTI prompt
                const ttiPrompt = await callGroq(sceneText, systemTTI);
                
                // Generate ITV prompt
                const itvPrompt = await callGroq(sceneText, systemITV);
                
                // Pastikan STYLE LOCK ada di awal
                let cleanTTI = ttiPrompt.trim();
                if (!cleanTTI.startsWith(STYLE_LOCK_SKELETON.substring(0, 30))) {
                    cleanTTI = `${STYLE_LOCK_SKELETON} ${cleanTTI}`;
                }
                
                let cleanITV = itvPrompt.trim();
                if (!cleanITV.startsWith(STYLE_LOCK_SKELETON.substring(0, 30))) {
                    cleanITV = `${STYLE_LOCK_SKELETON} ${cleanITV}`;
                }
                
                // Pastikan tidak ada instruksi yang tersisa
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
                
                // Pastikan full body visible disebutkan
                if (!cleanTTI.toLowerCase().includes('full body')) {
                    cleanTTI += ' Full body visible from head to toe, no close-up on face.';
                }
                
                if (!cleanITV.toLowerCase().includes('full body')) {
                    cleanITV += ' Full body visible from head to toe throughout the movement.';
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
                        <div class="scene-original"><small>📝 ${sceneText.substring(0, 150)}${sceneText.length > 150 ? '...' : ''}</small></div>
                        
                        <div class="prompt-section">
                            <div class="prompt-label">🖼️ TEXT TO IMAGE</div>
                            <div class="prompt-content" id="tti-${i}">${cleanTTI.substring(0, 120)}${cleanTTI.length > 120 ? '...' : ''}</div>
                            <div class="scene-actions">
                                <button onclick="copyTextToImage(${i})" class="copy-tti">📋 Copy TTI</button>
                                <button onclick="showFullPrompt(${i}, 'tti')" class="view-full">👁️ Lihat</button>
                            </div>
                        </div>
                        
                        <div class="prompt-section" style="margin-top: 12px;">
                            <div class="prompt-label">🎬 IMAGE TO VIDEO</div>
                            <div class="prompt-content" id="itv-${i}">${cleanITV.substring(0, 120)}${cleanITV.length > 120 ? '...' : ''}</div>
                            <div class="scene-actions">
                                <button onclick="copyImageToVideo(${i})" class="copy-itv">📋 Copy ITV</button>
                                <button onclick="showFullPrompt(${i}, 'itv')" class="view-full">👁️ Lihat</button>
                            </div>
                        </div>
                        
                        <div class="scene-actions" style="margin-top: 12px;">
                            <button onclick="copyNarasi(${i})" class="copy-narasi">📝 Copy Narasi (${i+1})</button>
                            <button onclick="copyFullPrompt(${i})" class="copy-full">📋 Copy Full</button>
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
            
            // Delay untuk menghindari rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        document.getElementById('sceneGrid').innerHTML = sceneHtml;
        document.getElementById('copyPromptsBtn').style.display = 'block';
        document.getElementById('copyAllTTIBtn').style.display = 'block';
        document.getElementById('copyAllITVBtn').style.display = 'block';
        output.style.display = 'block';
        
        updateStats('gen');
        updateStats('succ');
        showNotif(`✅ ${jumlahSceneManual} scene siap! Ide: ${randomIde.substring(0, 60)}...`);

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
