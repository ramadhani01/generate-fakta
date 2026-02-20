/********************************************************
 * ================== CONFIG ============================
 ********************************************************/

const STYLE_LOCK_SKELETON = `
Ultra-realistic cinematic 3D render of a humanoid skeleton
with transparent crystal-like crystal body layer covering bones,
highly detailed skull with visible teeth,
dramatic volumetric lighting,
dark moody background,
hyper realistic, ultra detailed, 8k render.
`;

const TITLE_PREFIX = "Berapa Lama Kamu";
const MAX_THEME_LENGTH = 55;
const MAX_SCENE = 8;
const DEFAULT_SECONDS_PER_SCENE = 6;

/********************************************************
 * ================= MEMORY STORAGE =====================
 ********************************************************/

let generatedSkeletonIdeas =
  JSON.parse(localStorage.getItem("skeletonIdeas")) || [];

function saveGeneratedSkeletonIdeas() {
  localStorage.setItem(
    "skeletonIdeas",
    JSON.stringify(generatedSkeletonIdeas)
  );
}

/********************************************************
 * ================= UTILITIES ==========================
 ********************************************************/

function normalizeSpaces(text) {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/gi, '').trim();
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanAIOutput(text) {
  return text
    .replace(/```/g, '')
    .replace(/^Output:\s*/i, '')
    .trim();
}

function calculateDuration(sceneCount) {
  return sceneCount * DEFAULT_SECONDS_PER_SCENE;
}

/********************************************************
 * ================= TITLE SYSTEM =======================
 ********************************************************/

function cleanThemeInput(theme) {
  if (!theme || typeof theme !== "string") return "";

  let t = theme.toLowerCase().trim();

  // Hapus bagian setelah "sampai"
  if (t.includes(" sampai ")) {
    t = t.split(" sampai ")[0];
  }

  // Bersihkan awalan naratif
  t = t
    .replace(/^mengumpulkan dan mengoleksi\s+/i, "mengoleksi ")
    .replace(/^mengumpulkan\s+/i, "mengumpulkan ")
    .replace(/^melakukan\s+/i, "")
    .replace(/^sedang\s+/i, "")
    .replace(/^kegiatan\s+/i, "")
    .replace(/^terus\s+/i, "")
    .replace(/^yang\s+/i, "")
    .replace(/^untuk\s+/i, "");

  t = t.replace(/[^\w\s-]/g, "");
  t = normalizeSpaces(t);

  if (t.length > MAX_THEME_LENGTH) {
    t = t.substring(0, MAX_THEME_LENGTH).trim();
  }

  return t;
}

function capitalizeFirst(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatJudul(theme) {
  const cleaned = cleanThemeInput(theme);

  if (!cleaned) {
    return `${TITLE_PREFIX} Bertahan?`;
  }

  return `${TITLE_PREFIX} ${capitalizeFirst(cleaned)}?`;
}

/********************************************************
 * ================= DUPLICATE CHECK ====================
 ********************************************************/

function isDuplicateTheme(newTheme) {
  const normalizedNew = normalizeText(newTheme);
  return generatedSkeletonIdeas.some(theme =>
    normalizeText(theme) === normalizedNew
  );
}

/********************************************************
 * ================= SCENE ENGINE =======================
 ********************************************************/

function splitIntoScenes(text, jumlahScene) {
  const cleanText = text.replace(/\n/g, ' ').trim();
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

  const scenes = [];
  const chunkSize = Math.ceil(sentences.length / jumlahScene);

  for (let i = 0; i < jumlahScene; i++) {
    const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
    if (chunk.length) {
      scenes.push(chunk.join(' ').trim());
    }
  }

  return applyCinematicFlow(scenes);
}

function applyCinematicFlow(scenes) {
  if (scenes.length < 4) return scenes;

  return scenes.map((scene, index) => {
    if (index === 0) return `HOOK MOMENT: ${scene}`;
    if (index === scenes.length - 1)
      return `CLIMAX IMPACT: ${scene}`;
    if (index > scenes.length / 2)
      return `CHAOS PHASE: ${scene}`;
    return `BUILD UP: ${scene}`;
  });
}

/********************************************************
 * ================= VISUAL PROMPT ======================
 ********************************************************/

function buildVisualPrompt(sceneText) {
  return `${STYLE_LOCK_SKELETON}

SCENE DESCRIPTION:
${sceneText}

Cinematic composition,
dramatic depth of field,
high contrast lighting,
ultra detailed anatomical realism.
`;
}

/********************************************************
 * ================= AI CALL ============================
 ********************************************************/

async function generateScriptFromAI(theme) {
  // Ini harus diganti dengan callGroq yang sebenarnya
  // Untuk sementara pakai mock
  
  return `
Berapa lama kamu bisa ${theme}? 
Awalnya tubuhmu terasa normal. 
Perlahan tulang belakang mulai menegang. 
Sendi-sendi kehilangan stabilitas. 
Tekanan meningkat di setiap gerakan. 
Tubuhmu mulai kehilangan kendali. 
Dan akhirnya kamu mencapai batas maksimalnya.
`;
}

/********************************************************
 * ================= MAIN GENERATOR =====================
 ********************************************************/

async function generateSkeletonWithParams(theme, jumlahSceneManual) {
  try {
    // Panggil loading dari fungsi utama
    if (typeof updateStats === 'function') updateStats('total');
    
    const load = document.getElementById('loading');
    const output = document.getElementById('outputArea');
    const errBox = document.getElementById('errorBox');
    
    if (load) load.style.display = 'block';
    if (output) output.style.display = 'none';
    if (errBox) errBox.innerHTML = '';
    
    if (!theme || theme.trim() === "") {
      throw new Error("Tema kosong.");
    }

    if (isDuplicateTheme(theme)) {
      throw new Error("Tema sudah pernah digunakan.");
    }

    if (jumlahSceneManual > MAX_SCENE) {
      jumlahSceneManual = MAX_SCENE;
    }

    const title = formatJudul(theme);

    const scriptRaw = await generateScriptFromAI(theme);
    const scriptClean = cleanAIOutput(scriptRaw);

    const scenes = splitIntoScenes(scriptClean, jumlahSceneManual);
    const visualPrompts = scenes.map(scene =>
      buildVisualPrompt(scene)
    );

    const totalDurasi = calculateDuration(scenes.length);

    generatedSkeletonIdeas.push(theme);
    saveGeneratedSkeletonIdeas();

    // Simpan ke variabel global
    if (typeof currentJudul !== 'undefined') currentJudul = title;
    if (typeof currentNaskah !== 'undefined') currentNaskah = scriptClean;
    
    // Tampilkan di UI
    const judulText = document.getElementById('judulText');
    const naskahUtama = document.getElementById('naskahUtama');
    const sceneInfo = document.getElementById('sceneInfo');
    const sceneGrid = document.getElementById('sceneGrid');
    
    if (judulText) judulText.innerText = title;
    if (naskahUtama) naskahUtama.innerText = scriptClean;
    if (sceneInfo) sceneInfo.innerHTML = `💀 ${scenes.length} Scene × ${DEFAULT_SECONDS_PER_SCENE} detik = ${totalDurasi} detik`;
    
    // Generate scene HTML
    let sceneHtml = '';
    for (let i = 0; i < scenes.length; i++) {
      sceneHtml += `
        <div class="scene-item">
          <div class="scene-number">💀 SCENE ${i+1}</div>
          <div class="scene-original"><small>📝 ${scenes[i].substring(0, 100)}...</small></div>
          <div class="prompt-section">
            <div class="prompt-label">🎬 VIDEO PROMPT</div>
            <div class="prompt-content">${visualPrompts[i].substring(0, 150)}...</div>
          </div>
        </div>
      `;
    }
    if (sceneGrid) sceneGrid.innerHTML = sceneHtml;
    
    // Tampilkan output
    if (output) output.style.display = 'block';
    
    // Update stats
    if (typeof updateStats === 'function') {
      updateStats('gen');
      updateStats('succ');
    }
    
    if (typeof showNotif === 'function') {
      showNotif(`✅ Script siap! Durasi: ${totalDurasi} detik`);
    }

  } catch (error) {
    console.error(error);
    if (typeof showNotif === 'function') {
      showNotif("Error: " + error.message, "error");
    }
    if (typeof updateStats === 'function') updateStats('fail');
  } finally {
    const load = document.getElementById('loading');
    if (load) load.style.display = 'none';
  }
}

/********************************************************
 * ================= EXPORT FUNCTION ====================
 ********************************************************/

// Fungsi utama yang dipanggil dari index.html (TANPA PARAMETER)
async function generateSkeleton() {
    try {
        // Ambil nilai dari slider
        const sceneSlider = document.getElementById('sceneSlider');
        const jumlahSceneManual = parseInt(sceneSlider?.value || 5);
        
        // Panggil updateStats jika ada
        if (typeof updateStats === 'function') updateStats('total');
        
        document.getElementById('loadText').innerText = "💀 AI mencari tema fresh...";
        
        // Coba generate tema dari AI
        let theme = "";
        
        try {
            // Load ide yang sudah pernah digenerate
            const usedThemes = generatedSkeletonIdeas.length > 0 
                ? `Tema yang sudah pernah digunakan: ${generatedSkeletonIdeas.join(', ')}. JANGAN gunakan tema-tema ini.`
                : `Belum ada tema yang digunakan.`;
            
            const systemCariTema = `Anda adalah kreator konten horror psikologis.
Tugas: Cari SATU tema yang BELUM PERNAH digunakan sebelumnya.

${usedThemes}

Tema harus tentang aktivitas manusia sehari-hari yang jika dilakukan BERLEBIHAN akan membuat tubuh dan pikiran perlahan hancur.

Contoh tema (jangan gunakan ini):
- main game sampai mata buta
- scroll tiktok sampai otak tumpah
- begadang sampai halusinasi

Cari tema yang fresh, unik, dan belum pernah ada.

Output HANYA tema dalam SATU KALIMAT (tanpa penjelasan lain):`;
            
            const temaResponse = await callGroq("Cari tema fresh untuk skeleton...", systemCariTema);
            theme = cleanThemeInput(temaResponse);
            
            if (!theme || theme.length < 3) {
                throw new Error("Tema tidak valid");
            }
            
        } catch (e) {
            console.error("Error getting theme:", e);
            // Fallback theme jika AI gagal
            const fallbackThemes = [
                "menatap layar tanpa henti",
                "duduk diam berjam-jam",
                "menahan kencing terlalu lama",
                "tidur dengan posisi salah",
                "mengedipkan mata terlalu jarang",
                "menahan napas terlalu lama",
                "membungkuk terlalu sering",
                "mengepalkan tangan terus menerus"
            ];
            theme = fallbackThemes[Math.floor(Math.random() * fallbackThemes.length)];
        }
        
        document.getElementById('loadText').innerText = `💀 Menulis script untuk: ${theme.substring(0, 50)}...`;
        
        // Panggil fungsi utama dengan parameter
        await generateSkeletonWithParams(theme, jumlahSceneManual);

    } catch (e) {
        console.error("Generate error:", e);
        if (typeof showNotif === 'function') {
            showNotif("Error: " + e.message, "error");
        }
        if (typeof updateStats === 'function') updateStats('fail');
        const load = document.getElementById('loading');
        if (load) load.style.display = 'none';
    }
}

// Ekspor ke global
window.generateSkeleton = generateSkeleton;
