// ========== FUNGSI UTAMA ==========
let GROQ_KEY = "";
let ELEVEN_KEY = "";
let currentMode = "fakta";
let deviceId = "";
let accessKeys = [];
let counts = { total: 0, gen: 0, succ: 0, fail: 0 };
let elevenEnabled = true; // Default ON

// Variabel global untuk data konten
let sceneData = [];
let currentNaskah = "";
let currentJudul = "";

const VOICE_IDS = {
    rachel: "EXAVITQu4vr4xnSDxMaL", // Perempuan
    adam: "pNInz6obpgDQGcFmaJgB",    // Adam - Cowok
};

const DURASI_PER_SCENE = 10;

// ==================== INITIALIZATION ====================
async function initApp() {
    console.log("initApp called");
    generateDeviceId();
    loadAccessKeys();
    checkAccess();
    
    const g = localStorage.getItem('groq_key');
    if(g) { 
        GROQ_KEY = g; 
        document.getElementById('groqKey').value = g; 
    }
    
    const e = localStorage.getItem('eleven_key');
    if(e) { 
        ELEVEN_KEY = e; 
        document.getElementById('elevenKey').value = e; 
    }
    
    // Load toggle preference
    loadTogglePreference();
    
    await checkAllStatus();
    
    const savedCounts = localStorage.getItem('counts');
    if(savedCounts) { 
        counts = JSON.parse(savedCounts); 
        updateStatsDisplay(); 
    }
}

// ==================== TOGGLE ELEVEN ====================
function toggleEleven() {
    const toggle = document.getElementById('elevenToggle');
    const statusSpan = document.getElementById('elevenToggleStatus');
    const infoSpan = document.getElementById('elevenToggleInfo');
    const audioBox = document.getElementById('audioBox');
    
    elevenEnabled = toggle.checked;
    
    if (elevenEnabled) {
        statusSpan.innerText = 'ON';
        statusSpan.classList.remove('off');
        infoSpan.innerHTML = '<span>🎙️ Voice akan digenerate</span>';
        if (audioBox) {
            audioBox.classList.remove('disabled');
        }
        showNotif("🔊 Voice generation: ON");
    } else {
        statusSpan.innerText = 'OFF';
        statusSpan.classList.add('off');
        infoSpan.innerHTML = '<span>⏸️ Voice tidak digenerate (hemat kuota)</span>';
        if (audioBox) {
            audioBox.classList.add('disabled');
        }
        showNotif("🔇 Voice generation: OFF");
    }
    
    localStorage.setItem('eleven_enabled', elevenEnabled);
    checkElevenStatus();
}

function loadTogglePreference() {
    const saved = localStorage.getItem('eleven_enabled');
    if (saved !== null) {
        elevenEnabled = saved === 'true';
        const toggle = document.getElementById('elevenToggle');
        if (toggle) {
            toggle.checked = elevenEnabled;
            toggleEleven();
        }
    }
}

// ==================== DEVICE ID ====================
function generateDeviceId() {
    let storedDeviceId = localStorage.getItem('device_id');
    if (storedDeviceId) { 
        deviceId = storedDeviceId; 
    } else {
        const raw = `${navigator.userAgent}-${screen.width}x${screen.height}-${Date.now()}`;
        let hash = 0;
        for (let i = 0; i < raw.length; i++) { 
            hash = ((hash << 5) - hash) + raw.charCodeAt(i); 
            hash |= 0; 
        }
        deviceId = Math.abs(hash).toString(16).substring(0,8).toUpperCase() + '-' + 
                   Math.random().toString(36).substring(2,6).toUpperCase();
        localStorage.setItem('device_id', deviceId);
    }
    document.getElementById('deviceId').innerText = deviceId;
    document.getElementById('deviceInfo').style.display = 'flex';
    return deviceId;
}

// ==================== ACCESS KEY ====================
function loadAccessKeys() {
    const saved = localStorage.getItem('access_keys');
    accessKeys = saved ? JSON.parse(saved) : [];
}

function checkDeviceAccess() {
    const deviceId = generateDeviceId();
    const registeredDevices = JSON.parse(localStorage.getItem('registered_devices') || '{}');
    if (registeredDevices[deviceId]) {
        const keyData = registeredDevices[deviceId];
        const savedKeys = JSON.parse(localStorage.getItem('access_keys') || '[]');
        if (savedKeys.find(k => k.key === keyData.key && k.status === 'success')) {
            closeAccessModal();
            return true;
        } else {
            delete registeredDevices[deviceId];
            localStorage.setItem('registered_devices', JSON.stringify(registeredDevices));
        }
    }
    return false;
}

function showErrorModal(msg) {
    document.getElementById('errorText').innerText = msg;
    document.getElementById('errorMessage').style.display = 'block';
    setTimeout(() => document.getElementById('errorMessage').style.display = 'none', 4000);
}

function validateAccessKey() {
    const inputKey = document.getElementById('accessKeyInput').value.trim();
    if (!inputKey) return showErrorModal("Key tidak boleh kosong!");
    loadAccessKeys();
    const keyIndex = accessKeys.findIndex(k => k.key === inputKey);
    if (keyIndex === -1) return showErrorModal("Key Expired!");
    const keyData = accessKeys[keyIndex];
    if (keyData.status === 'success') return showErrorModal("Key already used!");
    if (keyData.status === 'ready') {
        const currentDeviceId = deviceId;
        accessKeys[keyIndex].status = 'success';
        accessKeys[keyIndex].deviceId = currentDeviceId;
        accessKeys[keyIndex].usedAt = new Date().toISOString();
        localStorage.setItem('access_keys', JSON.stringify(accessKeys));
        const registeredDevices = JSON.parse(localStorage.getItem('registered_devices') || '{}');
        registeredDevices[currentDeviceId] = { 
            key: inputKey, 
            registeredAt: new Date().toISOString() 
        };
        localStorage.setItem('registered_devices', JSON.stringify(registeredDevices));
        showNotif("✅ Access granted!");
        closeAccessModal();
        checkAllStatus();
    }
}

function checkAccess() {
    if (checkDeviceAccess()) { 
        closeAccessModal(); 
        return; 
    }
    document.getElementById('accessKeyModal').style.display = 'flex';
    document.getElementById('mainContainer').style.display = 'none';
}

function closeAccessModal() {
    document.getElementById('accessKeyModal').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
}

// ==================== API STATUS ====================
async function checkGroqStatus() {
    if (!GROQ_KEY) { 
        updateStatus('groq','red','STATUS: OFF'); 
        return false; 
    }
    try {
        const res = await fetch("https://api.groq.com/openai/v1/models", 
            { headers: { "Authorization": `Bearer ${GROQ_KEY}` } });
        if (res.ok) { 
            updateStatus('groq','green','STATUS: READY'); 
            return true; 
        } else { 
            updateStatus('groq','red','STATUS: ERROR'); 
            return false; 
        }
    } catch { 
        updateStatus('groq','red','STATUS: ERROR'); 
        return false; 
    }
}

async function checkElevenStatus() {
    if (!ELEVEN_KEY) { 
        updateStatus('eleven','red','STATUS: OFF'); 
        return false; 
    }
    
    if (!elevenEnabled) {
        updateStatus('eleven','yellow','STATUS: DISABLED');
        return true;
    }
    
    try {
        const res = await fetch("https://api.elevenlabs.io/v1/voices", 
            { headers: { "xi-api-key": ELEVEN_KEY } });
        if (res.ok) { 
            updateStatus('eleven','green','STATUS: READY'); 
            return true; 
        } else { 
            updateStatus('eleven','red','STATUS: ERROR'); 
            return false; 
        }
    } catch { 
        updateStatus('eleven','red','STATUS: ERROR'); 
        return false; 
    }
}

async function checkAllStatus() {
    const g = await checkGroqStatus();
    const e = await checkElevenStatus();
    document.getElementById('genBtn').disabled = !(g && e);
}

function updateStatus(id, color, text) { 
    document.getElementById(`${id}Dot`).className = `status-dot dot-${color}`; 
    document.getElementById(`${id}Status`).innerText = text; 
}

// ==================== API KEY SAVE ====================
function saveGroq() { 
    const val = document.getElementById('groqKey').value.trim(); 
    if(val) { 
        GROQ_KEY = val; 
        localStorage.setItem('groq_key', val); 
        checkGroqStatus().then(checkAllStatus); 
        showNotif("GROQ saved!"); 
    } 
}

function saveEleven() { 
    const val = document.getElementById('elevenKey').value.trim(); 
    if(val) { 
        ELEVEN_KEY = val; 
        localStorage.setItem('eleven_key', val); 
        checkElevenStatus().then(checkAllStatus); 
        showNotif("Eleven saved!"); 
    } 
}

// ==================== STATISTICS ====================
function updateStats(key) { 
    counts[key]++; 
    localStorage.setItem('counts', JSON.stringify(counts)); 
    updateStatsDisplay(); 
}

function updateStatsDisplay() {
    document.getElementById('stat-total').innerText = counts.total; 
    document.getElementById('stat-gen').innerText = counts.gen;
    document.getElementById('stat-succ').innerText = counts.succ; 
    document.getElementById('stat-fail').innerText = counts.fail;
}

// ==================== GROQ CALL ====================
async function callGroq(prompt, system) {
    if(!GROQ_KEY) throw new Error("GROQ Key belum disimpan");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST", 
        headers: { 
            "Authorization": `Bearer ${GROQ_KEY}`, 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
            model: "llama-3.3-70b-versatile", 
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt }
            ], 
            temperature: 0.7, 
            max_tokens: 2500 
        })
    });
    if(!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return (await res.json()).choices[0].message.content;
}

// ==================== AUDIO GENERATION ====================
async function generateAudio(text, useMaleVoice = false) {
    if (!elevenEnabled) {
        const audioBox = document.getElementById('audioBox');
        audioBox.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 12px;">
                <span style="font-size: 24px; margin-right: 10px;">🔇</span>
                <span style="font-weight: 600; color: #6b7280;">Voice generation dimatikan</span>
                <div style="font-size: 11px; margin-top: 8px; color: #9ca3af;">
                    Aktifkan toggle di atas untuk generate voice
                </div>
            </div>
        `;
        audioBox.style.display = 'block';
        return;
    }
    
    if (!ELEVEN_KEY) throw new Error("ElevenLabs key tidak ada");
    
    const voiceId = useMaleVoice ? VOICE_IDS.adam : VOICE_IDS.rachel;
    const voiceName = useMaleVoice ? "ADAM (Male)" : "RACHEL (Female)";
    
    const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/```/g, '')
        .replace(/[#_*]/g, '')
        .trim()
        .substring(0, 2500);
    
    try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method:"POST", 
            headers: { 
                "xi-api-key": ELEVEN_KEY, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                text: cleanText, 
                model_id: "eleven_multilingual_v2", 
                voice_settings: { 
                    stability: 0.75, 
                    similarity_boost: 0.75, 
                    style: 0.0, 
                    speed: 1.0,
                    use_speaker_boost: true
                }
            })
        });
        
        if (res.status === 401) throw new Error("ElevenLabs Key invalid");
        if (res.status === 402) throw new Error("Kredit tidak cukup");
        if (!res.ok) throw new Error(`Eleven error ${res.status}`);
        
        const blob = await res.blob();
        if (blob.size < 100) throw new Error("Audio terlalu kecil");
        
        const url = URL.createObjectURL(blob);
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) {
            audioPlayer.src = url;
        } else {
            const audioBox = document.getElementById('audioBox');
            audioBox.innerHTML = `
                <div style="font-size: 11px; font-weight: 800; margin-bottom: 8px; color: #6b7280;">🔊 ${voiceName}:</div>
                <div class="audio-player"><audio id="audioPlayer" controls src="${url}"></audio></div>
            `;
        }
        document.getElementById('audioBox').style.display = 'block';
        
    } catch (error) {
        console.error("Audio generation error:", error);
        throw error;
    }
}

// ==================== COPY FUNCTIONS ====================
function showNotif(msg) { 
    let n = document.getElementById('notif'); 
    n.innerText = msg; 
    n.style.display = 'block'; 
    setTimeout(() => n.style.display = 'none', 2000); 
}

function copyToClipboard(text, msg) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showNotif(msg));
    } else {
        let ta = document.getElementById('hiddenCopyArea'); 
        ta.value = text; 
        ta.select(); 
        document.execCommand('copy'); 
        showNotif(msg);
    }
}

function copyJudul() { copyToClipboard(currentJudul, "Judul copied!"); }
function copyNaskah() { copyToClipboard(currentNaskah, "Naskah copied!"); }

function copyPrompt(index) { 
    if(sceneData[index]) copyToClipboard(sceneData[index].prompt, `Scene ${index+1} prompt copied!`); 
}

function copyNarasi(index) { 
    if(sceneData[index]) copyToClipboard(sceneData[index].originalText, `Scene ${index+1} narasi copied!`); 
}

// Copy Text-to-Image prompt
function copyTextToImage(index) {
    if (sceneData[index] && sceneData[index].textToImage) {
        copyToClipboard(sceneData[index].textToImage, `🎨 Scene ${index+1} Text-to-Image copied!`);
    } else {
        showNotif("❌ Text-to-Image prompt tidak ditemukan");
    }
}

// Copy Image-to-Video prompt
function copyImageToVideo(index) {
    if (sceneData[index] && sceneData[index].imageToVideo) {
        copyToClipboard(sceneData[index].imageToVideo, `🎬 Scene ${index+1} Image-to-Video copied!`);
    } else {
        showNotif("❌ Image-to-Video prompt tidak ditemukan");
    }
}

// Copy full prompt
function copyFullPrompt(index) {
    if (sceneData[index] && sceneData[index].fullPrompt) {
        copyToClipboard(sceneData[index].fullPrompt, `📋 Scene ${index+1} full prompt copied!`);
    } else if (sceneData[index] && sceneData[index].textToImage && sceneData[index].imageToVideo) {
        const full = `TEXT TO IMAGE:\n${sceneData[index].textToImage}\n\nIMAGE TO VIDEO:\n${sceneData[index].imageToVideo}`;
        copyToClipboard(full, `📋 Scene ${index+1} full prompt copied!`);
    } else {
        showNotif("❌ Full prompt tidak ditemukan");
    }
}

// Show full prompt dalam modal
function showFullPrompt(index, type) {
    let content = "";
    let title = "";
    
    if (type === 'tti' && sceneData[index] && sceneData[index].textToImage) {
        content = sceneData[index].textToImage;
        title = `Scene ${index+1} - TEXT TO IMAGE`;
    } else if (type === 'itv' && sceneData[index] && sceneData[index].imageToVideo) {
        content = sceneData[index].imageToVideo;
        title = `Scene ${index+1} - IMAGE TO VIDEO`;
    } else {
        showNotif("❌ Prompt tidak ditemukan");
        return;
    }
    
    const escapedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedForCopy = content.replace(/`/g, '\\`');
    
    const modal = document.createElement('div');
    modal.className = 'prompt-modal';
    modal.innerHTML = `
        <div class="prompt-modal-content">
            <button class="prompt-modal-close" onclick="this.closest('.prompt-modal').remove()">✕</button>
            <div class="prompt-modal-title">${title}</div>
            <div class="prompt-modal-text">${escapedContent}</div>
            <div class="prompt-modal-actions">
                <button class="prompt-modal-btn copy" onclick="copyToClipboard(\`${escapedForCopy}\`, 'Prompt copied!'); this.closest('.prompt-modal').remove()">📋 Copy</button>
                <button class="prompt-modal-btn close" onclick="this.closest('.prompt-modal').remove()">Tutup</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// COPY ALL TTI (tanpa label scene)
function copyAllTTI() {
    if (sceneData.length === 0) { 
        showNotif("❌ Belum ada data!"); 
        return; 
    }
    
    let allTTI = "";
    sceneData.forEach((d, i) => {
        if (d.textToImage && d.textToImage !== "Tidak tersedia untuk mode fakta" && d.textToImage !== "Prompt tidak tersedia") {
            allTTI += d.textToImage + "\n\n";
        }
    });
    
    if (allTTI) {
        copyToClipboard(allTTI, "📋 Semua TTI prompt copied!");
        document.getElementById('promptsPreview').innerHTML = `<strong>Preview TTI:</strong><br>${allTTI.substring(0,200)}...`;
        document.getElementById('promptsPreview').style.display = 'block';
    } else {
        showNotif("❌ Tidak ada TTI prompt");
    }
}

// COPY ALL ITV (tanpa label scene)
function copyAllITV() {
    if (sceneData.length === 0) { 
        showNotif("❌ Belum ada data!"); 
        return; 
    }
    
    let allITV = "";
    sceneData.forEach((d, i) => {
        if (d.imageToVideo && d.imageToVideo !== "Tidak tersedia untuk mode fakta" && d.imageToVideo !== "Prompt tidak tersedia") {
            allITV += d.imageToVideo + "\n\n";
        }
    });
    
    if (allITV) {
        copyToClipboard(allITV, "📋 Semua ITV prompt copied!");
        document.getElementById('promptsPreview').innerHTML = `<strong>Preview ITV:</strong><br>${allITV.substring(0,200)}...`;
        document.getElementById('promptsPreview').style.display = 'block';
    } else {
        showNotif("❌ Tidak ada ITV prompt");
    }
}

// Copy all prompts (gabungan)
function copyAllPrompts() {
    if (sceneData.length === 0) { 
        showNotif("❌ Belum ada prompt scene!"); 
        return; 
    }
    
    if (sceneData[0] && sceneData[0].textToImage && sceneData[0].textToImage !== sceneData[0].prompt) {
        let allTTI = "";
        let allITV = "";
        
        sceneData.forEach((d, i) => {
            if (d.textToImage && d.textToImage !== "Tidak tersedia untuk mode fakta" && d.textToImage !== "Prompt tidak tersedia") {
                allTTI += d.textToImage + "\n\n";
            }
            if (d.imageToVideo && d.imageToVideo !== "Tidak tersedia untuk mode fakta" && d.imageToVideo !== "Prompt tidak tersedia") {
                allITV += d.imageToVideo + "\n\n";
            }
        });
        
        const fullText = `=== ALL TEXT TO IMAGE PROMPTS ===\n\n${allTTI}\n=== ALL IMAGE TO VIDEO PROMPTS ===\n\n${allITV}`;
        copyToClipboard(fullText, "📋 Semua prompt (TTI & ITV) copied!");
        
        document.getElementById('promptsPreview').innerHTML = `
            <strong>Preview TTI:</strong><br>${allTTI.substring(0,150)}...<br><br>
            <strong>Preview ITV:</strong><br>${allITV.substring(0,150)}...
        `;
    } else {
        let promptsText = sceneData.map(d => d.prompt || d.textToImage).join('\n\n');
        copyToClipboard(promptsText, "📋 Semua prompt scene copied!");
        document.getElementById('promptsPreview').innerHTML = `<strong>Preview:</strong> ${promptsText.substring(0,200)}...`;
    }
    
    document.getElementById('promptsPreview').style.display = 'block';
}

// Copy all data
function copyAll() {
    const jumlahScene = sceneData.length;
    const totalDurasi = jumlahScene * DURASI_PER_SCENE;
    
    let full = `JUDUL: ${currentJudul}\n\n`;
    full += `NASKAH:\n${currentNaskah}\n\n`;
    full += `========================================\n`;
    full += `INFORMASI VIDEO:\n`;
    full += `========================================\n`;
    full += `Jumlah Scene: ${jumlahScene}\n`;
    full += `Durasi per Scene: ${DURASI_PER_SCENE} detik\n`;
    full += `Total Durasi: ${totalDurasi} detik (${Math.floor(totalDurasi/60)} menit ${totalDurasi%60} detik)\n\n`;
    full += `========================================\n`;
    full += `PROMPT PER SCENE:\n`;
    full += `========================================\n\n`;
    
    sceneData.forEach((d, i) => {
        full += `[SCENE ${i+1} - ${DURASI_PER_SCENE} detik]\n`;
        full += `NARASI: ${d.originalText}\n`;
        if (d.textToImage) full += `TEXT TO IMAGE: ${d.textToImage}\n`;
        if (d.imageToVideo) full += `IMAGE TO VIDEO: ${d.imageToVideo}\n`;
        full += `${'-'.repeat(40)}\n\n`;
    });
    
    copyToClipboard(full, "Semua data copied!");
}

// ==================== MODE SWITCHING ====================
function switchMode(mode) {
    currentMode = mode;
    
    const linkElement = document.getElementById('mode-css');
    if (linkElement) {
        let cssFile = 'css/style-fakta.css';
        if (mode === 'skeleton') cssFile = 'css/style-skeleton.css';
        if (mode === 'islami') cssFile = 'css/style-islami.css';
        linkElement.href = cssFile;
    }
    
    document.getElementById('modeFaktaBtn').classList.remove('active');
    document.getElementById('modeSkeletonBtn').classList.remove('active');
    document.getElementById('modeIslamiBtn').classList.remove('active');
    
    // Sembunyikan tombol TTI/ITV dulu
    document.getElementById('copyAllTTIBtn').style.display = 'none';
    document.getElementById('copyAllITVBtn').style.display = 'none';
    
    if (mode === "fakta") {
        document.getElementById('modeFaktaBtn').classList.add('active');
        document.getElementById('modeIndicator').innerHTML = '🌍 Mode: Fakta Unik Random';
        document.getElementById('genBtn').innerHTML = '🌍 GENERATE FAKTA UNIK';
        document.getElementById('genBtn').style.background = 'linear-gradient(135deg, #22c55e, #10b981)';
        // Tampilkan tombol TTI/ITV untuk fakta mode
        document.getElementById('copyAllTTIBtn').style.display = 'block';
        document.getElementById('copyAllITVBtn').style.display = 'block';
    } else if (mode === "skeleton") {
        document.getElementById('modeSkeletonBtn').classList.add('active');
        document.getElementById('modeIndicator').innerHTML = '💀 Mode: Manusia Tengkorak';
        document.getElementById('genBtn').innerHTML = '💀 GENERATE SKELETON MODE';
        document.getElementById('genBtn').style.background = 'linear-gradient(135deg, #a855f7, #d946ef)';
        document.getElementById('copyAllTTIBtn').style.display = 'block';
        document.getElementById('copyAllITVBtn').style.display = 'block';
    } else if (mode === "islami") {
        document.getElementById('modeIslamiBtn').classList.add('active');
        document.getElementById('modeIndicator').innerHTML = '🕌 Mode: Kisah Islami';
        document.getElementById('genBtn').innerHTML = '🕌 GENERATE KISAH ISLAMI';
        document.getElementById('genBtn').style.background = 'linear-gradient(135deg, #059669, #10b981)';
        document.getElementById('copyAllTTIBtn').style.display = 'block';
        document.getElementById('copyAllITVBtn').style.display = 'block';
    }
    
    document.getElementById('outputArea').style.display = 'none';
    sceneData = [];
}

// ==================== GENERATE CONTENT ====================
async function generateContent() {
    if (currentMode === "fakta") {
        if (typeof generateFaktaUnik === 'function') {
            await generateFaktaUnik();
        } else {
            alert("Fungsi generateFaktaUnik tidak ditemukan!");
        }
    } else if (currentMode === "skeleton") {
        if (typeof generateSkeleton === 'function') {
            await generateSkeleton();
        } else {
            alert("Fungsi generateSkeleton tidak ditemukan!");
        }
    } else if (currentMode === "islami") {
        if (typeof generateIslami === 'function') {
            await generateIslami();
        } else {
            alert("Fungsi generateIslami tidak ditemukan!");
        }
    }
}

// ==================== RESET DATA ====================
function resetData() {
    localStorage.removeItem('access_keys');
    localStorage.removeItem('registered_devices');
    localStorage.removeItem('device_id');
    localStorage.removeItem('counts');
    alert("Data direset. Refresh.");
    location.reload();
}

// Ekspor fungsi ke global
window.saveGroq = saveGroq;
window.saveEleven = saveEleven;
window.validateAccessKey = validateAccessKey;
window.resetData = resetData;
window.switchMode = switchMode;
window.generateContent = generateContent;
window.copyJudul = copyJudul;
window.copyNaskah = copyNaskah;
window.copyPrompt = copyPrompt;
window.copyNarasi = copyNarasi;
window.copyAll = copyAll;
window.copyAllPrompts = copyAllPrompts;
window.toggleEleven = toggleEleven;
window.copyTextToImage = copyTextToImage;
window.copyImageToVideo = copyImageToVideo;
window.copyFullPrompt = copyFullPrompt;
window.showFullPrompt = showFullPrompt;
window.copyAllTTI = copyAllTTI;
window.copyAllITV = copyAllITV;
