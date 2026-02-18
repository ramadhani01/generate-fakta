// ========== MODE MANUSIA TENGKORAK ==========

const STYLE_LOCK_SKELETON = "Ultra-realistic cinematic 3D render dari sosok kerangka humanoid dengan lapisan tubuh transparan seperti kristal/gelas menutupi tulang, tengkorak anatomi yang jelas dengan gigi terlihat dan memiliki bola mata asli, tampilan semi-x-ray, realitas edukatif dan surealis, tidak menakutkan, bukan kartun, detail ultra tinggi, fokus tajam, 8K.";

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
        
        const systemNarasi = `Anda adalah kreator konten video pendek dengan gaya "manusia tengkorak". 
Tugas: buat SATU narasi dengan format berikut:

[JUDUL] : kalimat clickbait "Seberapa [kuat/ lama/ banyak] ... sampai ...?" (pakai emoji)

[NARASI] : Struktur wajib seperti contoh:
"Seberapa kuat kamu tahan pedas dari level gorengan sampai level neraka jahanam? Level 1. Jalapeno. 5.000 scoville. Rasanya cuma geli-geli hangat di lidah. Kamu masih bisa senyum. Level 2. Cabe rawit 100.000 scoville. Keringat mulai netes. Bibirmu mulai menyala. Level 3. Habanero 350.000 scoville. Kupingmu berdenging. Kamu mulai cegukan. Level 4. Ghost pepper 1 juta scoville. Air matamu keluar deras, rasanya seperti menelan paku panas. Level 5. Carolina Reaper 2,2 juta scoville. Muntah api. Lambungmu terasa diperas. Level 6. Pepper X 2,69 juta scoville. Tenggorokanmu bengkak sampai menutup. Level 7. Pure capsaicin crystal 16 juta scoville. Lidahmu menyerah dan kabur."

Gunakan tema yang berhubungan dengan batas tubuh manusia, tulang, saraf. 
Contoh ide: 
- Seberapa lama kamu kuat nyetir motor nonstop sampai tulang punggungmu menyatu?
- Seberapa banyak kopi yang harus kamu minum sampai jantungmu nyerah?
- Seberapa lama kamu bisa tidur nonstop sampai tubuhmu membusuk di atas kasur?

Narasi harus memiliki LEVEL (minimal 5 level, maksimal 8), setiap level menjelaskan efek fisik yang makin ekstrem. Sertakan reaksi fisik seperti nyeri, otot, saraf, tulang. Bahasa Indonesia.
Output JSON murni: { "judul": "string", "naskah": "string" }`;
        
        const userPrompt = `Buat narasi "manusia tengkorak" dengan tema batas fisik ekstrem. Contoh: nyetir motor, tidur, minum kopi, menahan buang air, main game, scroll tiktok, angkat beban.`;
        
        const raw = await callGroq(userPrompt, systemNarasi);
        
        let parsed;
        try { 
            parsed = JSON.parse(raw); 
        } catch {
            const match = raw.match(/{[\s\S]*?}/);
            if(match) parsed = JSON.parse(match[0]); else throw new Error("Gagal parse JSON");
        }
        
        currentJudul = parsed.judul;
        currentNaskah = parsed.naskah;
        if(!currentJudul || !currentNaskah || currentNaskah.length < 150) throw new Error("Naskah terlalu pendek");
        
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
                
                let textToImage = "";
                let imageToVideo = "";
                
                const ttiMatch = visualPrompt.match(/TEXT TO IMAGE:?\s*([\s\S]*?)(?=IMAGE TO VIDEO:|$)/i);
                if (ttiMatch && ttiMatch[1]) {
                    textToImage = ttiMatch[1].trim();
                }
                
                const itvMatch = visualPrompt.match(/IMAGE TO VIDEO:?\s*([\s\S]*?)$/i);
                if (itvMatch && itvMatch[1]) {
                    imageToVideo = itvMatch[1].trim();
                }
                
                if (!textToImage && !imageToVideo) {
                    textToImage = visualPrompt;
                    imageToVideo = "Prompt tidak terdeteksi dengan format yang benar";
                }
                
                sceneData.push({ 
                    textToImage: textToImage,
                    imageToVideo: imageToVideo,
                    originalText: scenes[i],
                    fullPrompt: visualPrompt
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