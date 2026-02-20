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
 * ================= MAIN GENERATOR =====================
 ********************************************************/

async function generatedSkeletonIdeas(theme, jumlahSceneManual) {
  try {
    showLoading(true);

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

    renderResult({
      title,
      script: scriptClean,
      scenes,
      visualPrompts,
      duration: totalDurasi
    });

    showLoading(false);

  } catch (error) {
    console.error(error);
    showError(error.message);
    showLoading(false);
  }
}

/********************************************************
 * ================= RENDERING ==========================
 ********************************************************/

function renderResult(data) {
  document.getElementById("titleOutput").innerHTML =
    escapeHTML(data.title);

  document.getElementById("scriptOutput").innerHTML =
    escapeHTML(data.script);

  const visualContainer =
    document.getElementById("visualOutput");

  visualContainer.innerHTML = "";

  data.visualPrompts.forEach((prompt, index) => {
    const div = document.createElement("div");
    div.className = "scene-block";
    div.innerHTML = `
      <h3>Scene ${index + 1}</h3>
      <p>${escapeHTML(prompt)}</p>
    `;
    visualContainer.appendChild(div);
  });

  document.getElementById("durationOutput").innerHTML =
    `Estimasi Durasi: ${data.duration} detik`;
}

/********************************************************
 * ================= MOCK AI CALL =======================
 ********************************************************/

async function generateScriptFromAI(theme) {
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
 * ================= UI HELPERS =========================
 ********************************************************/

function showLoading(state) {
  const loader = document.getElementById("loading");
  loader.style.display = state ? "block" : "none";
}

function showError(message) {
  alert(message);
}
