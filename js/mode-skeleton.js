// ========== MODE MANUSIA TENGKORAK ==========

const STYLE_LOCK_SKELETON = "Ultra-realistic cinematic 3D render dari sosok kerangka humanoid dengan lapisan tubuh transparan seperti kristal/gelas menutupi tulang, tengkorak anatomi yang jelas dengan gigi terlihat dan memiliki bola mata asli, tampilan semi-x-ray, realitas edukatif dan surealis, tidak menakutkan, bukan kartun, detail ultra tinggi, fokus tajam, 8K.";

// Array untuk menyimpan ide yang sudah pernah digenerate
let generatedSkeletonIdeas = [];

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
        document.getElementById('loadText').innerText = "💀 Meracik ide extreme tengkorak...";
        
        // Daftar tema yang lebih bervariasi
        const skeletonThemes = [
            "nyetir motor nonstop sampai tulang punggung menyatu",
            "minum kopi sampai jantung berhenti",
            "tidur nonstop sampai tubuh membusuk",
            "menahan buang air kecil sampai kandung kemih pecah",
            "main game sampai mata buta",
            "scroll tiktok sampai otak tumpah",
            "angkat beban sampai otot robek",
            "lari marathon sampai tulang hancur",
            "puasa sampai lambung bolong",
            "tertawa sampai rahang lepas",
            "nangis sampai mata kering",
            "diem di tempat sampai kaki membusuk",
            "makan pedas sampai usus terbakar",
            "minum alkohol sampai hati rusak",
            "merokok sampai paru-paru hitam",
            "begadang sampai halusinasi",
            "stres sampai rambut rontok semua",
            "kerja lembur sampai jantung kolaps"
        ];
        
        // Filter tema yang belum pernah digenerate
        let availableThemes = skeletonThemes.filter(theme => !generatedSkeletonIdeas.includes(theme));
        
        // Jika semua tema sudah pernah, reset array
        if (availableThemes.length === 0) {
            generatedSkeletonIdeas = [];
            availableThemes = skeletonThemes;
        }
        
        // Pilih tema random dari yang tersedia
        const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
        
        // Simpan tema yang sudah dipilih
        generatedSkeletonIdeas.push(randomTheme);
        
        // Batasi array agar tidak terlalu besar (opsional)
        if (generatedSkeletonIdeas.length > 50) {
            generatedSkeletonIdeas = generatedSkeletonIdeas.slice(-30);
        }
        
        const systemNarasi = `Anda adalah kreator konten video pendek dengan gaya "manusia tengkorak". 
Tugas: buat SATU narasi dengan format berikut:

[JUDUL] : kalimat clickbait "Seberapa [kuat/ lama/ banyak] ... sampai ...?" (pakai emoji)

[NARASI] : Struktur wajib seperti contoh:
"Seberapa kuat kamu tahan pedas dari level gorengan sampai level neraka jahanam? Level 1. Jalapeno. 5.000 scoville. Rasanya cuma geli-geli hangat di lidah. Kamu masih bisa senyum. Level 2. Cabe rawit 100.000 scoville. Keringat mulai netes. Bibirmu mulai menyala. Level 3. Habanero 350.000 scoville. Kupingmu berdenging. Kamu mulai cegukan. Level 4. Ghost pepper 1 juta scoville. Air matamu keluar deras, rasanya seperti menelan paku panas. Level 5. Carolina Reaper 2,2 juta scoville. Muntah api. Lambungmu terasa diperas. Level 6. Pepper X 2,69 juta scoville. Tenggorokanmu bengkak sampai menutup. Level 7. Pure capsaicin crystal 16 juta scoville. Lidahmu menyerah dan kabur."

Gunakan tema: ${randomTheme}

Narasi harus memiliki LEVEL (maksimal 6), setiap level menjelaskan efek fisik yang makin ekstrem. Sertakan reaksi fisik seperti nyeri, otot, saraf, tulang. Gunakan satuan fiktif atau ilmiah yang sesuai. Bahasa Indonesia.

Output JSON murni: { "judul": "string", "naskah": "string" }`;
        
        const userPrompt = `Buat narasi "manusia tengkorak" dengan tema: ${randomTheme}. Buat level-level yang semakin ekstrem dengan efek fisik yang brutal.`;
        
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
        
        const kalimat = currentNaskah.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15 && !s.toLowerCase().startsWith('seberapa'));
        const scenes = kalimat.length >= 3 ? kalimat : [currentNaskah];
        
        const jumlahScene = scenes.length;
        const totalDurasi = jumlahScene * DURASI_PER_SCENE;
        document.getElementById('sceneInfo').innerHTML = `💀 ${jumlahScene} Scene × ${DURASI_PER_SCENE} detik = ${totalDurasi} detik visual tengkorak sinematik`;
        
        document.getElementById('loadText').innerText = "🎨 Generate prompt visual skeleton...";
        
        let sceneHtml = '';
        
        for(let i = 0; i < scenes.length; i++) {
            const systemVisual = `Anda pembuat prompt video sinematik. Buat prompt Text-to-Image dan Image-to-Video terpisah untuk adegan berikut: "${scenes[i]}". WAJIB gunakan style lock berikut di awal setiap prompt: ${STYLE_LOCK_SKELETON}. Adegan harus merefleksikan narasi secara visual, ekspresi/gerakan kerangka sesuai skrip, sudut kamera variatif, latar belakang mendukung. 

Output HARUS dengan format EXACT berikut (tanpa tambahan teks lain):

TEXT TO IMAGE:
[prompt text to image disini]

IMAGE TO VIDEO:
[prompt image to video disini]`;
            
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
        showNotif(`✅ ${jumlahScene} scene skeleton siap!`);

    } catch (e) {
        updateStats('fail');
        errBox.innerHTML = `<div class="error-box">❌ Error: ${e.message}</div>`;
    } finally {
        load.style.display = 'none';
    }
}
