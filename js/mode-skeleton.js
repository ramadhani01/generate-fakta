/********************************************************
 * CONFIG
 ********************************************************/

const STYLE_LOCK_SKELETON = `
Ultra-realistic cinematic 3D render of a humanoid skeleton
with transparent crystal-like body layer covering anatomical bones,
detailed skull with visible teeth,
dramatic volumetric lighting,
dark moody background,
hyper realistic, ultra detailed, 8k render.
`;

const MAX_SCENE = 8;
const DEFAULT_SECONDS_PER_SCENE = 6;

/********************************************************
 * MEMORY STORAGE
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
 * UTILITIES
 ********************************************************/

function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/gi, '').trim();
}

function isDuplicateTheme(newTheme) {
  const normalizedNew = normalizeText(newTheme);
  return generatedSkeletonIdeas.some(theme =>
    normalizeText(theme) === normalizedNew
  );
}

function cleanAIOutput(text) {
  return text
    .replace(/```/g, '')
    .replace(/^Output:\s*/i, '')
    .trim();
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function calculateDuration(sceneCount, secondsPerScene = DEFAULT_SECONDS_PER_SCENE) {
  return sceneCount * secondsPerScene;
}

/********************************************************
 * CINEMATIC STRUCTURE ENGINE
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
    if (index === 0) {
      return `HOOK MOMENT: ${scene}`;
    } else if (index === scenes.length - 1) {
      return `CLIMAX / FINAL IMPACT: ${scene}`;
    } else if (index > scenes.length / 2) {
      return `CHAOS PHASE: ${scene}`;
    } else {
      return `BUILD UP: ${scene}`;
    }
  });
}

/********************************************************
 * VISUAL PROMPT BUILDER
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
 * MAIN GENERATOR FLOW
 ********************************************************/

async function generateFullContent(theme, jumlahSceneManual) {
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
 * RENDERING
 ********************************************************/

function renderResult(data) {
  const scriptContainer = document.getElementById("scriptOutput");
  const visualContainer = document.getElementById("visualOutput");
  const durationContainer = document.getElementById("durationOutput");

  scriptContainer.innerHTML = escapeHTML(data.script);

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

  durationContainer.innerHTML =
    `Estimasi Durasi: ${data.duration} detik`;
}

/********************************************************
 * MOCK AI CALL (GANTI DENGAN API ASLI)
 ********************************************************/

async function generateScriptFromAI(theme) {
  return `
Berapa lama kamu bisa ${theme}? 
Awalnya tubuhmu masih kuat dan stabil. 
Namun perlahan tulang belakang mulai terasa tegang. 
Otot-otot kehilangan keseimbangan. 
Sampai akhirnya tubuhmu mencapai batas maksimalnya.
`;
}

/********************************************************
 * UI HELPERS
 ********************************************************/

function showLoading(state) {
  const loader = document.getElementById("loading");
  loader.style.display = state ? "block" : "none";
}

function showError(message) {
  alert(message);
}
