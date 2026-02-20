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
        
        document.getElementById('loadText').innerText = `💀 Menulis script 45-60 detik dengan ${jumlahSceneManual} scene...`;
        
        // Load ide yang sudah pernah digenerate
        loadGeneratedSkeletonIdeas();
        
        // Buat daftar tema yang sudah pernah digunakan sebagai konteks
        const usedThemesContext = generatedSkeletonIdeas.length > 0 
            ? `Tema yang sudah pernah digunakan: ${generatedSkeletonIdeas.join(', ')}. JANGAN gunakan tema-tema ini, cari tema yang BENAR-BENAR BARU.`
            : `Belum ada tema yang digunakan, bebas memilih tema apapun yang fresh.`;
        
        // AI mencari tema sendiri
        const systemCariTema = `Anda adalah kreator konten horror psikologis dengan gaya "manusia tengkorak".

Tugas: Cari SATU tema yang BELUM PERNAH digunakan sebelumnya.

${usedThemesContext}

Tema harus tentang aktivitas manusia sehari-hari yang jika dilakukan BERLEBIHAN akan membuat tubuh dan pikiran perlahan hancur.

Contoh tema (jangan gunakan ini):
- main game sampai mata buta
- scroll tiktok sampai otak tumpah
- begadang sampai halusinasi
- kerja lembur sampai jantung kolaps

Cari tema yang fresh, unik, dan belum pernah ada. Pikirkan aktivitas modern atau tradisional yang bisa dieksploitasi secara horror.

Output HANYA tema dalam SATU KALIMAT (tanpa penjelasan lain):`;
        
        // Minta AI mencari tema
        const temaResponse = await callGroq("Cari tema fresh untuk skeleton...", systemCariTema);
        
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
        saveGeneratedSkeletonIdeas();
        
        // Batasi array agar tidak terlalu besar
        if (generatedSkeletonIdeas.length > 100) {
            generatedSkeletonIdeas = generatedSkeletonIdeas.slice(-50);
            saveGeneratedSkeletonIdeas();
        }
        
        document.getElementById('loadText').innerText = `💀 Menulis script untuk: ${randomTheme.substring(0, 50)}...`;
        
        // SYSTEM PROMPT UNTUK SCRIPT 45-60 DETIK - DENGAN JUMLAH SCENE
        const systemNarasi = `Anda adalah penulis script video horror psikologis 45-60 detik.

Tema: ${randomTheme}
JUMLAH SCENE: ${jumlahSceneManual} scene

BUAT SCRIPT DENGAN FORMAT WAJIB:

STEP 1 — Hook Brutal (Scene 1)
Mulai dengan pertanyaan langsung yang terasa pribadi dan sedikit mengancam.
Gunakan kata "kamu".
Buat penonton merasa ini bisa terjadi sekarang.
Contoh pola:
"Berapa lama kamu bisa ___ sebelum tubuhmu menyerah?"

STEP 2 — Eskalasi Cepat (Scene 2 sampai Scene ${jumlahSceneManual-2})
Gunakan checkpoint waktu singkat dan jelas:
Jam ke-__
Jam ke-__
Hari ke-__
Hari ke-__
Setiap bagian harus lebih parah dari sebelumnya. Tidak boleh datar.
Sesuaikan jumlah checkpoint dengan jumlah scene yang tersedia (${jumlahSceneManual-3} scene untuk eskalasi).

STEP 3 — Di Setiap Checkpoint WAJIB Ada:
- Sensasi fisik yang bisa dirasakan (mata berat, kepala panas, tangan lambat, napas sesak)
- Perubahan mental yang terasa aneh (lupa barusan apa, sulit fokus, emosi tipis, pikiran kacau)
- Perbandingan sederhana yang relatable (seperti mabuk, seperti baterai 1%, seperti mesin overheat, seperti layar berkedip)
- Satu momen "oh tidak..." (kamu sadar kamu blank, kamu tidak ingat bagaimana sampai di sana, kamu lupa apa yang baru dilakukan)

STEP 4 — Tambahkan "Loss of Control Moment" (Scene ${jumlahSceneManual-1})
Sebelum akhir, harus ada momen di mana:
- Kamu tidak sepenuhnya sadar
- Atau tubuh bergerak tanpa kontrol
- Atau dunia terasa hilang sepersekian detik
- Atau kamu seperti melihat dirimu dari luar tubuh
Buat ini terasa tiba-tiba dan mengagetkan.

STEP 5 — Ending Final & Visual (Scene ${jumlahSceneManual})
Akhiri dengan kegagalan total.
Tidak perlu penjelasan. Hanya kejadian.
Contoh pola:
Lututmu lemas.
Dunia gelap.
Tubuhmu jatuh.
Sunyi.
Berhenti.

STYLE LOCK (WAJIB):
- Bahasa sangat sederhana (kata sehari-hari)
- Tidak boleh istilah medis (jangan: dehidrasi, kelelahan kronis, dll)
- Tidak boleh menjelaskan proses di dalam tubuh
- Tidak boleh terdengar seperti guru atau dokumenter
- Harus terdengar tenang tapi menyeramkan (seperti bisikan)
- Semua harus bisa divisualisasikan dalam video
- Setiap scene cukup 2-3 kalimat pendek

Output hanya script. Tanpa komentar. Tanpa penjelasan. Tanpa kata "Scene 1:", "Scene 2:" dll. Langsung tulis isi scriptnya saja.`;
        
        const userPrompt = `Buat script 45-60 detik dengan tema: ${randomTheme}. Ikuti semua langkah dengan ketat. Total ${jumlahSceneManual} scene.`;
        
        const rawScript = await callGroq(userPrompt, systemNarasi);
        
        // Bersihkan script dari kemungkinan komentar
        let cleanScript = rawScript
            .replace(/```/g, '')
            .replace(/^\s*\/\/.*$/gm, '')
            .replace(/^\s*#.*$/gm, '')
            .replace(/^Scene \d+:\s*/gim, '') // Hapus "Scene 1:" jika ada
            .replace(/^Step \d+:\s*/gim, '') // Hapus "Step 1:" jika ada
            .trim();
        
        // Gunakan script sebagai naskah utama
        currentNaskah = cleanScript;
        
        // Buat judul dari tema
        currentJudul = randomTheme.charAt(0).toUpperCase() + randomTheme.slice(1);
        if (!currentJudul.endsWith('?') && !currentJudul.endsWith('!') && !currentJudul.endsWith('.')) {
            currentJudul = currentJudul + '?';
        }
        
        document.getElementById('judulText').innerText = currentJudul;
        document.getElementById('naskahUtama').innerText = currentNaskah;
        
        if (elevenEnabled) {
            document.getElementById('loadText').innerText = "🔊 Generate voice dengan efek horror...";
            
            // Untuk skeleton, gunakan style lebih tenang tapi menyeramkan
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
        
        document.getElementById('loadText').innerText = `✂️ Membagi script menjadi ${jumlahSceneManual} scene...`;
        
        // Bagi script menjadi scene berdasarkan baris atau kalimat
        const lines = currentNaskah.split('\n').filter(line => line.trim().length > 0);
        
        // Jika baris kurang dari jumlah scene, bagi berdasarkan kalimat
        let scenes = [];
        if (lines.length >= jumlahSceneManual) {
            // Ambil sesuai jumlah scene
            for (let i = 0; i < jumlahSceneManual; i++) {
                scenes.push(lines[i]);
            }
        } else {
            // Bagi berdasarkan kalimat
            const sentences = currentNaskah.match(/[^.!?]+[.!?]+/g) || [currentNaskah];
            for (let i = 0; i < jumlahSceneManual; i++) {
                if (i < sentences.length) {
                    scenes.push(sentences[i].trim());
                } else {
                    scenes.push('...');
                }
            }
        }
        
        const totalDurasi = jumlahSceneManual * 8; // 8 detik per scene
        const minutes = Math.floor(totalDurasi / 60);
        const seconds = totalDurasi % 60;
        document.getElementById('sceneInfo').innerHTML = `💀 ${jumlahSceneManual} Scene × 8 detik = ${totalDurasi} detik | Script horror psikologis (Tema: ${randomTheme.substring(0, 40)}...)`;
        
        document.getElementById('loadText').innerText = "🎨 Generate prompt visual untuk setiap scene...";
        
        let sceneHtml = '';
        
        for(let i = 0; i < scenes.length; i++) {
            const sceneText = scenes[i];
            
            // Prompt visual untuk setiap scene dengan style horror
            const systemVisual = `Anda adalah ahli pembuat prompt video sinematik horror psikologis.

ADEGAN: "${sceneText}"

WAJIB gunakan style lock ini di AWAL prompt:
${STYLE_LOCK_SKELETON}

BUAT PROMPT VIDEO dengan detail berikut:
- Visualisasikan suasana horror psikologis yang mencekam
- Pencahayaan remang-remang, bayangan panjang, kontras tinggi
- Sudut kamera yang tidak stabil, sedikit goyang (handheld style)
- Ekspresi ketakutan, kebingungan, kehilangan kontrol
- Warna dominan gelap, abu-abu, biru dingin, kadang merah samar
- Efek distorsi halus pada tepi frame (seperti sinyal terganggu)
- Gerakan lambat di momen-momen tertentu
- Latar belakang yang terasa kosong dan asing

Output SATU PARAGRAF PROMPT VIDEO LENGKAP (60-100 kata):`;
            
            try {
                const visualPrompt = await callGroq(sceneText, systemVisual);
                
                // Bersihkan prompt
                let cleanPrompt = visualPrompt
                    .replace(/Output.*?(?=Ultra)/gi, '')
                    .replace(/Anda pembuat.*?(?=Ultra)/gi, '')
                    .replace(/^"|"$/g, '')
                    .trim();
                
                sceneData.push({ 
                    videoPrompt: cleanPrompt,
                    originalText: sceneText,
                    fullPrompt: cleanPrompt
                });
                
                sceneHtml += `
                    <div class="scene-item skeleton-mode" data-scene="${i}">
                        <div class="scene-number">💀 SCENE ${i+1} (8 detik)</div>
                        <div class="scene-original"><small>📝 ${sceneText.substring(0, 100)}${sceneText.length > 100 ? '...' : ''}</small></div>
                        
                        <div class="prompt-section">
                            <div class="prompt-label">🎬 VIDEO PROMPT</div>
                            <div class="prompt-content" id="prompt-${i}">${cleanPrompt.substring(0, 120)}${cleanPrompt.length > 120 ? '...' : ''}</div>
                            <div class="scene-actions">
                                <button onclick="copyVideoPrompt(${i})" class="copy-full" style="background: #a855f7; color: white;">📋 Copy</button>
                                <button onclick="showFullVideoPrompt(${i})" class="view-full">👁️ Lihat</button>
                            </div>
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
        showNotif(`✅ Script horror ${jumlahSceneManual} scene siap! (Durasi: ${minutes} menit ${seconds} detik)`);

    } catch (e) {
        updateStats('fail');
        errBox.innerHTML = `<div class="error-box">❌ Error: ${e.message}</div>`;
    } finally {
        load.style.display = 'none';
    }
}
