/**
 * Troubleshooting utility for Quoridor 3D
 * This script adds diagnostic tools to help identify and fix rendering and interaction issues
 */

(function() {
    // Add troubleshoot button to help menu
    function addTroubleshootingOption() {
        const helpModal = document.querySelector('.modal-content');
        if (!helpModal) return;
        
        const troubleshootSection = document.createElement('div');
        troubleshootSection.className = 'instruction-section';
        troubleshootSection.innerHTML = `
            <h3>Troubleshooting</h3>
            <p>If you're experiencing display issues:</p>
            <ul>
                <li><button id="fix-zoom-button" style="background-color:#e74c3c;">Fix Display Issues</button> - Click this if the board appears too small or the UI is not visible</li>
                <li><button id="reset-camera-button">Reset Camera</button> - Reset the camera to the default position</li>
                <li><button id="toggle-debug-button">Toggle Debug Info</button> - Show technical information (press 'D' key to toggle)</li>
            </ul>
        `;
        
        helpModal.appendChild(troubleshootSection);
        
        // Add event listeners for the buttons
        document.getElementById('fix-zoom-button').addEventListener('click', fixZoomIssues);
        document.getElementById('reset-camera-button').addEventListener('click', resetCamera);
        document.getElementById('toggle-debug-button').addEventListener('click', toggleDebugInfo);
    }
    
    // Reset the camera to default position
    function resetCamera() {
        if (window.camera) {
            window.camera.position.set(0, 15, 15);
            window.camera.lookAt(0, 0, 0);
            if (window.controls) {
                window.controls.target.set(0, 0, 0);
                window.controls.update();
            }
        }
    }
    
    // Fix zoom issues by resetting the renderer and container
    function fixZoomIssues() {
        // Get container
        const container = document.getElementById('canvas-container');
        const uiContainer = document.getElementById('ui-container');
        
        if (!container || !window.renderer) {
            alert("Can't access canvas container or renderer");
            return;
        }
        
        // Make UI visible
        if (uiContainer) {
            uiContainer.style.display = 'flex';
        }
        
        // Force container to full size
        container.style.width = '100%';
        container.style.height = 'calc(100vh - 75px)';
        
        // Resize renderer
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        if (window.renderer) {
            window.renderer.setSize(width, height);
        }
        
        if (window.camera) {
            window.camera.aspect = width / height;
            window.camera.updateProjectionMatrix();
            
            // Reset camera position
            resetCamera();
        }
        
        // Force a re-render
        if (window.renderer && window.scene && window.camera) {
            window.renderer.render(window.scene, window.camera);
        }
        
        // Add message
        if (typeof showGameMessage === 'function') {
            showGameMessage("Display reset complete");
        }
        
        // Close modal
        document.getElementById('help-modal').style.display = 'none';
    }
    
    // Toggle debug info
    function toggleDebugInfo() {
        const debugDiv = document.querySelector('[data-debug="true"]');
        if (debugDiv) {
            debugDiv.style.display = debugDiv.style.display === 'none' ? 'block' : 'none';
        } else if (window.debug) {
            const fakeEvent = { key: 'D' };
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'D' }));
        }
    }
    
    // Create a more detailed debug panel
    function createDetailedDebugPanel() {
        const panel = document.createElement('div');
        panel.setAttribute('data-debug', 'true');
        panel.style.position = 'absolute';
        panel.style.top = '5px';
        panel.style.right = '5px';
        panel.style.backgroundColor = 'rgba(0,0,0,0.8)';
        panel.style.color = 'white';
        panel.style.padding = '10px';
        panel.style.fontSize = '12px';
        panel.style.zIndex = '1000';
        panel.style.maxWidth = '300px';
        panel.style.maxHeight = '400px';
        panel.style.overflow = 'auto';
        panel.style.display = 'none';
        panel.style.borderRadius = '4px';
        
        document.body.appendChild(panel);
        
        // Update info periodically
        setInterval(() => {
            if (panel.style.display === 'block') {
                updateDebugInfo(panel);
            }
        }, 1000);
        
        return panel;
    }
    
    // Update debug info
    function updateDebugInfo(panel) {
        if (!panel) return;
        
        const container = document.getElementById('canvas-container');
        const renderer = window.renderer;
        const camera = window.camera;
        const scene = window.scene;
        
        let html = '<h3>Debug Information</h3>';
        
        html += '<h4>Browser:</h4>';
        html += `<p>Window: ${window.innerWidth}x${window.innerHeight}<br>`;
        html += `Zoom: ${Math.round(window.devicePixelRatio * 100)}%<br>`;
        html += `User Agent: ${navigator.userAgent.substring(0, 50)}...</p>`;
        
        html += '<h4>Container:</h4>';
        if (container) {
            html += `<p>Size: ${container.clientWidth}x${container.clientHeight}<br>`;
            html += `Style: ${container.style.width} x ${container.style.height}</p>`;
        } else {
            html += '<p>Not found!</p>';
        }
        
        html += '<h4>Renderer:</h4>';
        if (renderer) {
            html += `<p>Size: ${renderer.domElement.width}x${renderer.domElement.height}<br>`;
            html += `DOM Size: ${renderer.domElement.clientWidth}x${renderer.domElement.clientHeight}</p>`;
        } else {
            html += '<p>Not initialized!</p>';
        }
        
        html += '<h4>Camera:</h4>';
        if (camera) {
            html += `<p>Position: x:${camera.position.x.toFixed(1)} y:${camera.position.y.toFixed(1)} z:${camera.position.z.toFixed(1)}<br>`;
            html += `Aspect: ${camera.aspect.toFixed(2)}<br>`;
            html += `FOV: ${camera.fov}°</p>`;
        } else {
            html += '<p>Not initialized!</p>';
        }
        
        html += '<h4>Game:</h4>';
        const gameLogic = window.gameLogic;
        if (gameLogic) {
            html += `<p>Current Player: ${gameLogic.currentPlayerIndex + 1}<br>`;
            html += `Players: ${gameLogic.playerCount}<br>`;
            html += `Game Over: ${gameLogic.gameOver}</p>`;
        } else {
            html += '<p>Not initialized!</p>';
        }
        
        panel.innerHTML = html;
    }
    
    // Initialize when document is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for the help modal to be ready
        setTimeout(() => {
            addTroubleshootingOption();
            createDetailedDebugPanel();
        }, 1000);
    });
})();
