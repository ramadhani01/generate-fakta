// ========== MODE FAKTA UNIK ==========

// Style lock untuk fakta unik (lebih umum)
const STYLE_LOCK_FAKTA = "Sinematik ultra realistis, pencahayaan dramatis, detail tinggi, sudut kamera sinematik, depth of field, warna vibrant, 8K, fokus tajam, bukan animasi.";

async function generateFaktaUnik() {
    updateStats('total');
    
    const load = document.getElementById('loading');
    const output = document.getElementById('outputArea');
    const errBox = document.getElementById('errorBox');
    
    load.style.display = 'block';
    output.style.display = 'none';
    errBox.innerHTML = '';
    sceneData = [];
    
    try {
        if (elevenEnabled) {
            document.getElementById('loadText').innerText = "🧠 Mencari ide fakta unik...";
        } else {
            document.getElementById('loadText').innerText = "🧠 Mencari ide fakta unik (voice OFF)...";
        }
        
        const topics = [
            "luar angkasa", "sains", "hewan", "sejarah", "tubuh manusia",
            "teknologi", "psikologi", "alam", "makanan", "budaya aneh",
            "fenomena alam", "misteri", "penemuan", "mitos", "rahasia",
            "kesehatan", "otak manusia", "dinosaurus", "samudra", "gunung berapi"
        ];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        
        const systemPromptNaskah = `Anda adalah penulis konten viral. Buat naskah dengan FORMAT WAJIB:

1. Judul clickbait ambil dari fakta tersebut (pakai emoji, maks 60 karakter)
2. Naskah DIMULAI dengan "Apa kamu tahu," (HANYA SEKALI di awal)
3. Setelah itu, berikan SATU fakta unik tentang ${topic}
4. Jelaskan fakta tersebut dengan PANJANG dan DETAIL (minimal 100 kata)
5. Naskah harus mengalir dengan baik, terdiri dari 5-7 kalimat yang saling berkesinambungan

Output JSON murni: { "judul": "string", "naskah": "string" }`;
        
        const userPromptNaskah = `Buat konten video pendek tentang SATU fakta unik ${topic}. Berikan SATU fakta dengan penjelasan panjang dan detail minimal 100 kata.`;
        
        const rawNaskah = await callGroq(userPromptNaskah, systemPromptNaskah);
        
        const cleanNaskah = parseJSONRobust(rawNaskah);
        
        currentJudul = cleanNaskah.judul;
        currentNaskah = cleanNaskah.naskah;
        
        if (!currentNaskah || currentNaskah.length < 100) {
            throw new Error("Naskah terlalu pendek");
        }
        
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
        
        const jumlahScene = hitungJumlahScene(currentNaskah);
        const scenes = bagiNaskahMenjadiScene(currentNaskah, jumlahScene);
        
        const totalDurasi = jumlahScene * DURASI_PER_SCENE;
        document.getElementById('sceneInfo').innerHTML = `🎬 ${jumlahScene} Scene × ${DURASI_PER_SCENE} detik = ${totalDurasi} detik video`;
        
        document.getElementById('loadText').innerText = "🎨 Generate prompt visual (TTI & ITV)...";
        
        let sceneHtml = '';
        
        for(let i = 0; i < scenes.length; i++) {
            const systemVisual = `Anda pembuat prompt video sinematik. Buat prompt Text-to-Image dan Image-to-Video terpisah untuk adegan berikut: "${scenes[i]}". WAJIB gunakan style lock berikut di awal setiap prompt: ${STYLE_LOCK_FAKTA}. Adegan harus merefleksikan narasi secara visual, sesuai dengan konteks fakta yang diceritakan.

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
                    <div class="scene-item fakta-mode" data-scene="${i}">
                        <div class="scene-number">🎬 SCENE ${i+1} (${DURASI_PER_SCENE} detik)</div>
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
                        <div class="scene-number">🎬 SCENE ${i+1}</div>
                        <div class="scene-prompt">Error: ${promptError.message}</div>
                    </div>
                `;
            }
        }
        
        document.getElementById('sceneGrid').innerHTML = sceneHtml;
        document.getElementById('copyPromptsBtn').style.display = 'block';
        // Tampilkan tombol TTI/ITV untuk fakta mode juga
        document.getElementById('copyAllTTIBtn').style.display = 'block';
        document.getElementById('copyAllITVBtn').style.display = 'block';
        output.style.display = 'block';
        
        updateStats('gen');
        updateStats('succ');
        showNotif(`✅ ${jumlahScene} scene fakta unik siap!`);

    } catch (e) {
        updateStats('fail');
        errBox.innerHTML = `<div class="error-box">❌ Error: ${e.message}</div>`;
    } finally {
        load.style.display = 'none';
    }
}

// ==================== PARSING JSON ROBUST ====================
function parseJSONRobust(rawText) {
    try {
        return JSON.parse(rawText);
    } catch (e) {
        console.log("Parse langsung gagal, coba metode lain...");
    }
    
    const jsonMatch = rawText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[1]);
        } catch (e) {}
    }
    
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
            const jsonStr = rawText.substring(firstBrace, lastBrace + 1);
            return JSON.parse(jsonStr);
        } catch (e) {}
    }
    
    // Fallback manual
    const cleanText = rawText
        .replace(/```[a-z]*/gi, '')
        .replace(/`/g, '')
        .replace(/\*\*/g, '')
        .replace(/#/g, '')
        .trim();
    
    const lines = cleanText.split('\n').filter(l => l.trim().length > 0);
    
    let judul = "🔴 FAKTA UNIK YANG MENGEJUTKAN!";
    let naskah = cleanText;
    
    for (let line of lines) {
        if (line.match(/[🔴🟠🟡🟢🔵🟣⚡🔥💫]/) && line.length < 100) {
            judul = line.trim();
            naskah = cleanText.replace(line, '').trim();
            break;
        }
    }
    
    judul = judul.replace(/^(judul|title):?\s*/i, '').trim();
    naskah = naskah.replace(/^(naskah|script):?\s*/i, '').trim();
    
    if (!naskah.toLowerCase().includes('apa kamu tahu')) {
        naskah = "Apa kamu tahu, " + naskah;
    }
    
    return { judul, naskah };
}

// ==================== HITUNG JUMLAH SCENE ====================
function hitungJumlahScene(naskah) {
    const teksTanpaPembuka = naskah.replace(/^tahukah\s+kamu\??\s*/i, "");
    const kalimat = teksTanpaPembuka
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
    return Math.max(kalimat.length, 1);
}

// ==================== BAGI NASKAH MENJADI SCENE ====================
function bagiNaskahMenjadiScene(naskah, jumlahScene) {
    const teksTanpaPembuka = naskah.replace(/^tahukah\s+kamu\??\s*/i, "");
    const kalimat = teksTanpaPembuka
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
    
    if (kalimat.length === 0) {
        return [naskah];
    }
    
    const scenes = [];
    for (let i = 0; i < kalimat.length; i++) {
        scenes.push(kalimat[i] + '.');
    }
    return scenes;
}
