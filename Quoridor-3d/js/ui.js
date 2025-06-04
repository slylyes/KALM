// UI logic for Quoridor

function updateCurrentPlayer(player) {
    document.getElementById('current-player').querySelector('span').textContent = player;
}

function updateWallsLeft(count) {
    document.getElementById('walls-left').querySelector('span').textContent = count;
}

// Show game message in the UI
function showGameMessage(message, isError = false) {
    const messageElement = document.getElementById('game-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = isError ? 'error' : 'info';
        messageElement.style.display = 'block';
        
        // Hide message after a few seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
}

// Toggle help modal visibility
function toggleHelpModal(show = true) {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
    }
}

// Update the mode indicator in the UI
function updateModeIndicator(mode) {
    const modeIndicator = document.getElementById('mode-indicator');
    if (modeIndicator) {
        const modeText = mode === 'move' ? 'Movement Mode' : 'Wall Placement Mode';
        modeIndicator.textContent = modeText;
        modeIndicator.className = mode === 'move' ? 'mode-move' : 'mode-wall';
    }
}

// Disable/enable the mode toggle button (for AI turns)
function setModeToggleEnabled(enabled) {
    const toggleButton = document.getElementById('toggle-mode');
    if (toggleButton) {
        toggleButton.disabled = !enabled;
        toggleButton.style.opacity = enabled ? '1' : '0.5';
    }
}

// Show or hide wall orientation controls
function updateWallOrientationControls(visible) {
    const wallOrientationControls = document.getElementById('wall-orientation-controls');
    if (wallOrientationControls) {
        // Make sure to set display to 'flex' explicitly, not just toggle visibility
        wallOrientationControls.style.display = visible ? 'flex' : 'none';
        console.log("Wall orientation controls visibility set to:", visible ? "visible" : "hidden");
    } else {
        console.error("Wall orientation controls element not found!");
    }
}

// Update the wall orientation display
function updateWallOrientationDisplay(orientation) {
    const horizontalBtn = document.getElementById('horizontal-wall');
    const verticalBtn = document.getElementById('vertical-wall');
    
    if (horizontalBtn && verticalBtn) {
        if (orientation === 'horizontal') {
            horizontalBtn.classList.add('active');
            verticalBtn.classList.remove('active');
        } else {
            horizontalBtn.classList.remove('active');
            verticalBtn.classList.add('active');
        }
        console.log("Wall orientation updated to:", orientation);
    } else {
        console.error("Wall orientation buttons not found!");
    }
}

// Add more UI update functions as needed