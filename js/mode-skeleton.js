// Copy Video Prompt (untuk mode skeleton)
function copyVideoPrompt(index) {
    if (sceneData[index] && sceneData[index].videoPrompt) {
        copyToClipboard(sceneData[index].videoPrompt, `🎬 Scene ${index+1} Video Prompt copied!`);
    } else {
        showNotif("❌ Video prompt tidak ditemukan");
    }
}

// Show full video prompt dalam modal
function showFullVideoPrompt(index) {
    if (!sceneData[index] || !sceneData[index].videoPrompt) {
        showNotif("❌ Video prompt tidak ditemukan");
        return;
    }
    
    const content = sceneData[index].videoPrompt;
    const escapedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedForCopy = content.replace(/`/g, '\\`');
    
    const modal = document.createElement('div');
    modal.className = 'prompt-modal';
    modal.innerHTML = `
        <div class="prompt-modal-content">
            <button class="prompt-modal-close" onclick="this.closest('.prompt-modal').remove()">✕</button>
            <div class="prompt-modal-title">Scene ${index+1} - VIDEO PROMPT</div>
            <div class="prompt-modal-text">${escapedContent}</div>
            <div class="prompt-modal-actions">
                <button class="prompt-modal-btn copy" onclick="copyToClipboard(\`${escapedForCopy}\`, 'Video prompt copied!'); this.closest('.prompt-modal').remove()">📋 Copy</button>
                <button class="prompt-modal-btn close" onclick="this.closest('.prompt-modal').remove()">Tutup</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Update copyAllPrompts untuk menangani videoPrompt
function copyAllPrompts() {
    if (sceneData.length === 0) { 
        showNotif("❌ Belum ada prompt scene!"); 
        return; 
    }
    
    if (sceneData[0] && sceneData[0].videoPrompt) {
        let allVideoPrompts = "";
        sceneData.forEach((d, i) => {
            allVideoPrompts += `[SCENE ${i+1} - VIDEO PROMPT]\n${d.videoPrompt}\n\n`;
        });
        copyToClipboard(allVideoPrompts, "📋 Semua video prompt copied!");
        
        document.getElementById('promptsPreview').innerHTML = `
            <strong>Preview Video Prompts:</strong><br>${allVideoPrompts.substring(0,200)}...
        `;
    } else {
        let promptsText = sceneData.map(d => d.prompt || d.textToImage || d.videoPrompt).join('\n\n');
        copyToClipboard(promptsText, "📋 Semua prompt scene copied!");
        document.getElementById('promptsPreview').innerHTML = `<strong>Preview:</strong> ${promptsText.substring(0,200)}...`;
    }
    
    document.getElementById('promptsPreview').style.display = 'block';
}

// Ekspor fungsi ke global
window.copyVideoPrompt = copyVideoPrompt;
window.showFullVideoPrompt = showFullVideoPrompt;
