// ========== MODE KISAH ISLAMI ==========

// ==================== FUNGSI PARSING KHUSUS ISLAMI ====================
function parseNarasiIslami(rawText) {
    // Hapus instruksi-instruksi yang sering muncul
    let cleanText = rawText
        .replace(/Pembukaan yang menarik:?\s*/gi, '')
        .replace(/Inti kisah:?\s*/gi, '')
        .replace(/Hikmah yang bisa diambil:?\s*/gi, '')
        .replace(/Penutup yang mengena:?\s*/gi, '')
        .replace(/Output JSON murni:.*?({)/gi, '$1')
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .replace(/^\s*[\*\-\+]\s*/gm, '') // Hapus bullet points
        .trim();
    
    // Coba parse JSON
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        console.log("Parse JSON gagal, coba metode lain");
    }
    
    // Jika bukan JSON, ambil judul dan naskah manual
    const lines = cleanText.split('\n').filter(l => l.trim().length > 0);
    let judul = "";
    let naskah = "";
    
    // Cari baris yang mungkin judul (diawali emoji atau pendek)
    for (let line of lines) {
        if (line.match(/[🕌📖🤲☪️✨🌟⭐]/) || line.includes('!') || line.length < 100) {
            judul = line.trim();
            break;
        }
    }
    
    // Jika tidak ketemu, cari baris pertama sebagai judul
    if (!judul && lines.length > 0) {
        judul = lines[0].trim();
        lines.shift();
    }
    
    // Ambil sisa sebagai naskah
    if (judul) {
        naskah = cleanText.replace(judul, '').trim();
    } else {
        judul = "🕌 Kisah Islami Penuh Hikmah";
        naskah = cleanText;
    }
    
    // Bersihkan naskah dari instruksi yang tersisa
    naskah = naskah
        .replace(/^[:\s\-_*]+/g, '')
        .replace(/Pembukaan.*?(?=[A-Za-z])/gi, '')
        .replace(/Inti.*?(?=[A-Za-z])/gi, '')
        .replace(/Hikmah.*?(?=[A-Za-z])/gi, '')
        .replace(/Penutup.*?(?=[A-Za-z])/gi, '')
        .replace(/^\s*[\*\-\+]\s*/gm, '')
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Hapus enter berlebih
        .trim();
    
    // Pastikan judul tidak terlalu panjang
    if (judul.length > 100) {
        judul = judul.substring(0, 97) + '...';
    }
    
    return { judul, naskah };
}

const STYLE_LOCK_ISLAMI = "Sinematik epik bergaya Timur Tengah, pencahayaan hangat keemasan, arsitektur masjid kuno, detail kaligrafi Arab, suasana mistis dan sakral, efek cahaya lembut, warna dominan emas dan hijau, depth of field, 8K, ultra realistic, bukan kartun.";

async function generateIslami() {
    updateStats('total');
    
    const load = document.getElementById('loading');
    const output = document.getElementById('outputArea');
    const errBox = document.getElementById('errorBox');
    
    load.style.display = 'block';
    output.style.display = 'none';
    errBox.innerHTML = '';
    sceneData = [];
    
    try {
        document.getElementById('loadText').innerText = "🕌 Menggali kisah islami penuh hikmah...";
        
        const systemNarasi = `Anda adalah pencerita kisah islami yang inspiratif. 
Tugas: buat SATU narasi kisah islami dengan format berikut:

[JUDUL] : judul menarik tentang kisah nabi, sahabat, atau peristiwa islami (pakai emoji)

[NARASI] : Ceritakan kisah dengan struktur:
- Pembukaan yang menarik
- Inti kisah (apa yang terjadi)
- Hikmah yang bisa diambil
- Penutup yang mengena

Contoh tema:
- Kisah Nabi Musa membelah laut
- Kisah kesabaran Nabi Ayyub
- Kisah kejujuran para sahabat
- Kisah perang Badar
- Kisah Isra Miraj
- Kisah keajaiban Al-Quran

Gunakan bahasa Indonesia yang indah dan menggugah. Panjang cerita 150-200 kata.
Output JSON murni: { "judul": "string", "naskah": "string" }`;
        
        const userPrompt = `Buat satu kisah islami yang inspiratif dan penuh hikmah. Bisa tentang nabi, sahabat, atau peristiwa bersejarah dalam Islam.`;
        
        const raw = await callGroq(userPrompt, systemNarasi);
        console.log("RAW ISLAMI:", raw);
        
        // ========== GUNAKAN FUNGSI PARSING ==========
        let parsed;
        try { 
            parsed = JSON.parse(raw); 
        } catch {
            parsed = parseNarasiIslami(raw);
            if (!parsed.judul || !parsed.naskah || parsed.naskah.length < 50) {
                // Fallback: jika masih gagal, buat manual
                parsed = {
                    judul: "🕌 Kisah Islami Penuh Hikmah",
                    naskah: raw.replace(/[\[\]{}"]/g, '').trim()
                };
            }
        }
        
        currentJudul = parsed.judul;
        currentNaskah = parsed.naskah;
        
        if (!currentNaskah || currentNaskah.length < 100) {
            throw new Error("Naskah terlalu pendek");
        }
        
        document.getElementById('judulText').innerText = currentJudul;
        document.getElementById('naskahUtama').innerText = currentNaskah;
        
        if (elevenEnabled) {
            document.getElementById('loadText').innerText = "🔊 Generate voice Adam (Cowok)...";
        } else {
            document.getElementById('loadText').innerText = "⏸️ Voice disabled, lanjut ke scene...";
        }
        
        try { 
            await generateAudio(currentNaskah, true); 
        } catch (audioError) {
            if (elevenEnabled) {
                document.getElementById('audioBox').innerHTML = `<div style="color:#b91c1c;">❌ Voice error: ${audioError.message}</div>`;
            } else {
                document.getElementById('audioBox').innerHTML = `<div style="color:#6b7280;">⏸️ Voice generation dimatikan</div>`;
            }
            document.getElementById('audioBox').style.display = 'block';
        }
        
        document.getElementById('loadText').innerText = "✂️ Membagi kisah menjadi scene...";
        
        // Split naskah menjadi kalimat untuk scene
        const kalimat = currentNaskah.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
        const scenes = kalimat.length >= 3 ? kalimat : [currentNaskah];
        
        const jumlahScene = scenes.length;
        const totalDurasi = jumlahScene * DURASI_PER_SCENE;
        document.getElementById('sceneInfo').innerHTML = `🕌 ${jumlahScene} Scene × ${DURASI_PER_SCENE} detik = ${totalDurasi} detik visual islami epik`;
        
        document.getElementById('loadText').innerText = "🎨 Generate prompt visual islami...";
        
        let sceneHtml = '';
        
        for(let i = 0; i < scenes.length; i++) {
            const systemVisual = `Anda pembuat prompt video sinematik bergaya islami. Buat prompt Text-to-Image dan Image-to-Video terpisah untuk adegan berikut: "${scenes[i]}". WAJIB gunakan style lock berikut di awal setiap prompt: ${STYLE_LOCK_ISLAMI}. Adegan harus merefleksikan kisah islami secara visual, suasana Timur Tengah, pencahayaan hangat, detail arsitektur masjid/kaligrafi jika sesuai. 

Output HARUS dengan format EXACT berikut (tanpa tambahan teks lain):

TEXT TO IMAGE:
[prompt text to image disini]

IMAGE TO VIDEO:
[prompt image to video disini]`;
            
            try {
                const visualPrompt = await callGroq(scenes[i], systemVisual);
                console.log(`Scene ${i+1} prompt:`, visualPrompt);
                
                // Bersihkan visual prompt dari instruksi
                let cleanVisual = visualPrompt
                    .replace(/Output.*?(?=TEXT)/gi, '')
                    .replace(/Anda pembuat.*?(?=TEXT)/gi, '')
                    .trim();
                
                // Parse prompt menjadi text-to-image dan image-to-video
                let textToImage = "";
                let imageToVideo = "";
                
                // Cari bagian TEXT TO IMAGE:
                const ttiMatch = cleanVisual.match(/TEXT TO IMAGE:?\s*([\s\S]*?)(?=IMAGE TO VIDEO:|$)/i);
                if (ttiMatch && ttiMatch[1]) {
                    textToImage = ttiMatch[1].trim();
                }
                
                // Cari bagian IMAGE TO VIDEO:
                const itvMatch = cleanVisual.match(/IMAGE TO VIDEO:?\s*([\s\S]*?)$/i);
                if (itvMatch && itvMatch[1]) {
                    imageToVideo = itvMatch[1].trim();
                }
                
                // Fallback jika parsing gagal
                if (!textToImage && !imageToVideo) {
                    textToImage = cleanVisual;
                    imageToVideo = "Prompt tidak terdeteksi dengan format yang benar";
                }
                
                sceneData.push({ 
                    textToImage: textToImage,
                    imageToVideo: imageToVideo,
                    originalText: scenes[i],
                    fullPrompt: cleanVisual
                });
                
                sceneHtml += `
                    <div class="scene-item islami-mode" data-scene="${i}">
                        <div class="scene-number">🕌 SCENE ${i+1} (${DURASI_PER_SCENE} detik)</div>
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
                        <div class="scene-number">🕌 SCENE ${i+1}</div>
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
        showNotif(`✅ ${jumlahScene} scene kisah islami siap!`);

    } catch (e) {
        updateStats('fail');
        errBox.innerHTML = `<div class="error-box">❌ Error: ${e.message}</div>`;
    } finally {
        load.style.display = 'none';
    }
}
