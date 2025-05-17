// Main entry point for Quoridor game

let scene, camera, renderer, controls;
let board, gameLogic;
let raycaster, mouse;
let canvasContainer;

// Initialize the 3D environment and game
function init() {
    // Get the container
    canvasContainer = document.getElementById('canvas-container');
    
    if (!canvasContainer) {
        console.error("Cannot find canvas container!");
        return;
    }
    
    console.log("Initializing Three.js scene...");
    
    // Create a scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2c3e50);

    // Make sure we get accurate container dimensions
    const containerWidth = canvasContainer.clientWidth || window.innerWidth;
    const containerHeight = canvasContainer.clientHeight || (window.innerHeight - 75);
    
    console.log("Container dimensions:", containerWidth, "x", containerHeight);

    // Set up camera with fixed aspect ratio
    camera = new THREE.PerspectiveCamera(
        60, 
        containerWidth / containerHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);

    // Set up renderer using container dimensions
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.shadowMap.enabled = true;
    
    // Clear any existing renderers
    while (canvasContainer.firstChild) {
        canvasContainer.removeChild(canvasContainer.firstChild);
    }
    
    canvasContainer.appendChild(renderer.domElement);
    
    console.log("Renderer created with size:", containerWidth, "x", containerHeight);

    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2.1; // Prevent camera going below board
    console.log("Controls initialized");

    // Set up lights
    setupLights();
    
    // Initialize raycaster for interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Create the game board
    board = new Board(scene);
    board.create();
    console.log("Game board created");
    
    // Initialize game logic
    initializeGame();
    
    // Set up event listeners
    setupEventListeners();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start rendering
    animate();
    console.log("Animation loop started");
}

// Set up lighting
function setupLights() {
    // Add main directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    
    scene.add(directionalLight);
    
    // Add ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    // Add a hemisphere light for better color blending
    const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 0.3);
    scene.add(hemisphereLight);
}

// Initialize the game
function initializeGame() {
    // Get player count and AI difficulty settings
    const playerCount = parseInt(document.getElementById('player-count').value) || 2;
    const aiDifficulty = document.getElementById('ai-difficulty').value || 'medium';
    
    // Initialize game logic
    gameLogic = new GameLogic(scene, board, playerCount, aiDifficulty);
    
    // Update UI
    document.querySelector('#current-player span').textContent = 'Player 1';
    document.querySelector('#walls-left span').textContent = '10';
    
    // Set initial mode to move and update toggle button
    gameLogic.placementMode = 'move';
    gameLogic.wallOrientation = 'horizontal';
    
    // Make sure the wall orientation controls exist in the DOM
    ensureWallControls();
    
    const toggleModeBtn = document.getElementById('toggle-mode');
    if (toggleModeBtn) {
        toggleModeBtn.textContent = 'Switch to Wall Mode';
        toggleModeBtn.className = 'mode-button move';
    }
    
    // Explicitly hide wall orientation controls initially
    if (typeof updateWallOrientationControls === 'function') {
        updateWallOrientationControls(false);
    }
    
    // Highlight legal moves for the first player
    const legalMoves = gameLogic.getLegalMoves(gameLogic.getCurrentPlayer());
    board.highlightLegalMoves(gameLogic.getCurrentPlayer().boardPosition, legalMoves);
}

// Ensure wall orientation controls exist
function ensureWallControls() {
    let controlsElement = document.getElementById('wall-orientation-controls');
    
    if (!controlsElement) {
        console.log("Creating wall controls dynamically as they were not found");
        
        controlsElement = document.createElement('div');
        controlsElement.id = 'wall-orientation-controls';
        controlsElement.innerHTML = `
            <h3>Wall Orientation</h3>
            <div class="wall-btn-container">
                <div id="horizontal-wall" class="wall-orientation-btn active" title="Horizontal Wall">
                    <div class="icon"></div>
                </div>
                <div id="vertical-wall" class="wall-orientation-btn" title="Vertical Wall">
                    <div class="icon"></div>
                </div>
            </div>
        `;
        
        document.getElementById('canvas-container').appendChild(controlsElement);
        
        // Add event listeners to the new buttons
        document.getElementById('horizontal-wall').addEventListener('click', () => {
            console.log("Dynamically created horizontal wall button clicked");
            if (gameLogic && gameLogic.getPlacementMode() === 'wall') {
                if (gameLogic.getWallOrientation() !== 'horizontal') {
                    gameLogic.toggleWallOrientation();
                }
            }
        });
        
        document.getElementById('vertical-wall').addEventListener('click', () => {
            console.log("Dynamically created vertical wall button clicked");
            if (gameLogic && gameLogic.getPlacementMode() === 'wall') {
                if (gameLogic.getWallOrientation() !== 'vertical') {
                    gameLogic.toggleWallOrientation();
                }
            }
        });
    }
}

// Set up event listeners for user interaction
function setupEventListeners() {
    // Mouse move for highlighting
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    
    // Mouse click for selection
    renderer.domElement.addEventListener('click', onMouseClick, false);
    
    // Force a re-render on focus
    window.addEventListener('focus', () => {
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    });
    
    // New game button
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            console.log("Starting new game");
            // Clean up existing game
            if (gameLogic) {
                gameLogic.cleanup();
            }
            
            // Reset the board
            if (board) {
                board.reset();
            }
            
            // Start a new game
            initializeGame();
        });
    } else {
        console.error("Start game button not found!");
    }

    // Help button
    document.getElementById('help-button').addEventListener('click', () => {
        document.getElementById('help-modal').style.display = 'flex';
    });
    
    // Close help modal
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('help-modal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('help-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Add toggle button event listener
    const toggleModeBtn = document.getElementById('toggle-mode');
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener('click', () => {
            if (gameLogic && !gameLogic.gameOver && !gameLogic.getCurrentPlayer().isAI) {
                const newMode = gameLogic.togglePlacementMode();
                
                // Update button text
                toggleModeBtn.textContent = newMode === 'move' 
                    ? 'Switch to Wall Mode' 
                    : 'Switch to Move Mode';
                    
                // Update button color
                toggleModeBtn.className = newMode === 'move' 
                    ? 'mode-button move' 
                    : 'mode-button wall';
                
                // Make sure wall orientation controls are properly displayed
                if (newMode === 'wall') {
                    // Force update the wall orientation controls
                    updateWallOrientationControls(true);
                    updateWallOrientationDisplay(gameLogic.getWallOrientation());
                    console.log("Wall mode activated, controls should be visible");
                } else {
                    updateWallOrientationControls(false);
                }
            }
        });
    }
    
    // Add wall orientation toggle buttons with improved event handling
    const horizontalWallBtn = document.getElementById('horizontal-wall');
    if (horizontalWallBtn) {
        horizontalWallBtn.addEventListener('click', () => {
            console.log("Horizontal wall button clicked");
            if (gameLogic && gameLogic.getPlacementMode() === 'wall') {
                if (gameLogic.getWallOrientation() !== 'horizontal') {
                    gameLogic.toggleWallOrientation();
                }
            }
        });
    } else {
        console.error("Horizontal wall button not found");
    }
    
    const verticalWallBtn = document.getElementById('vertical-wall');
    if (verticalWallBtn) {
        verticalWallBtn.addEventListener('click', () => {
            console.log("Vertical wall button clicked");
            if (gameLogic && gameLogic.getPlacementMode() === 'wall') {
                if (gameLogic.getWallOrientation() !== 'vertical') {
                    gameLogic.toggleWallOrientation();
                }
            }
        });
    } else {
        console.error("Vertical wall button not found");
    }
    
    // Add a forced initial resize
    setTimeout(() => {
        onWindowResize();
    }, 100);
}

// Handle mouse movement for highlighting
function onMouseMove(event) {
    // Fix mouse coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections with the board (include nested children)
    const intersects = raycaster.intersectObjects(board.boardGroup.children, true);
    
    // Reset cursor to default
    renderer.domElement.style.cursor = 'default';
    
    // Skip if game is over or it's AI's turn
    if (gameLogic.gameOver || gameLogic.getCurrentPlayer().isAI) {
        return;
    }
    
    // Handle hover effects based on placement mode
    if (intersects.length > 0) {
        const intersect = intersects[0];
        
        // Convert squareHitArea to parent square for proper handling
        const userData = intersect.object.userData.type === 'squareHitArea' 
            ? intersect.object.parent.userData 
            : intersect.object.userData;
            
        if (gameLogic.getPlacementMode() === 'move') {
            // Movement mode - highlight squares
            if (userData && (userData.type === 'square' || userData.type === 'squareHitArea')) {
                // Use the boardX and boardZ values
                const x = userData.boardX;
                const z = userData.boardZ;
                
                // Check if this is a legal move
                const isLegalMove = gameLogic.getLegalMoves(gameLogic.getCurrentPlayer()).some(
                    move => move.x === x && move.z === z
                );
                
                // Change cursor to pointer if it's a legal move
                if (isLegalMove) {
                    renderer.domElement.style.cursor = 'pointer';
                }
            }
        } else {
            // Wall placement mode - show wall previews
            if (userData && 
                (userData.type === 'wallGuide' || 
                userData.type === 'wallPreview')) {
                // Only show preview if orientation matches selected orientation
                const orientation = userData.orientation;
                const selectedOrientation = gameLogic.getWallOrientation();
                
                if (orientation === selectedOrientation) {
                    // Show wall preview
                    const x = userData.boardX;
                    const z = userData.boardZ;
                    
                    // Only show preview if player has walls left
                    if (gameLogic.getCurrentPlayer().wallsLeft > 0) {
                        board.showWallPreview(x, z, orientation);
                        renderer.domElement.style.cursor = 'pointer';
                    }
                }
            } else {
                // Remove wall preview when not hovering over a guide
                board.removeWallPreviews();
            }
        }
    } else {
        // Not hovering over any interactive elements
        if (gameLogic.getPlacementMode() === 'wall') {
            board.removeWallPreviews();
        }
    }
}

// Handle mouse clicks for selection
function onMouseClick(event) {
    // Skip if game is over or it's AI's turn
    if (!gameLogic || gameLogic.gameOver || gameLogic.getCurrentPlayer().isAI) {
        return;
    }
    
    // Fix mouse coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Debug click position
    console.log("Mouse click at:", mouse.x, mouse.y);
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections (include all nested children)
    const intersects = raycaster.intersectObjects(board.boardGroup.children, true);
    
    console.log("Intersections found:", intersects.length);
    
    if (intersects.length > 0) {
        const intersect = intersects[0];
        
        // Convert squareHitArea to parent square for proper handling
        const userData = intersect.object.userData.type === 'squareHitArea' 
            ? intersect.object.parent.userData 
            : intersect.object.userData;
        
        // Handle click based on placement mode
        if (gameLogic.getPlacementMode() === 'move') {
            // Movement mode - handle square clicks
            if (userData && (userData.type === 'square' || userData.type === 'squareHitArea')) {
                console.log("Clicked on square:", userData.boardX, userData.boardZ);
                
                // Check if this is a legal move
                const x = userData.boardX;
                const z = userData.boardZ;
                const position = { x, z };
                
                const isLegalMove = gameLogic.getLegalMoves(gameLogic.getCurrentPlayer()).some(
                    move => move.x === x && move.z === z
                );
                
                if (isLegalMove) {
                    // Move the player
                    gameLogic.movePlayer(position);
                    
                    // Move to next player's turn
                    gameLogic.nextTurn();
                }
            }
        } else {
            // Wall placement mode - handle wall placements
            if (userData && 
                (userData.type === 'wallGuide' || 
                userData.type === 'wallPreview')) {
                // Only place if orientation matches selected orientation
                if (userData.orientation === gameLogic.getWallOrientation()) {
                    console.log("Clicked on wall guide:", userData);
                    
                    // Place a wall
                    const x = userData.boardX;
                    const z = userData.boardZ;
                    const orientation = userData.orientation;
                    
                    // Try to place the wall
                    if (gameLogic.placeWall(x, z, orientation)) {
                        // Wall successfully placed, move to next player's turn
                        gameLogic.nextTurn();
                    }
                }
            }
        }
    }
}

// Handle window resizing with improved reliability
function onWindowResize() {
    if (!camera || !renderer || !canvasContainer) return;
    
    // Get accurate container dimensions
    const containerWidth = canvasContainer.clientWidth || window.innerWidth;
    const containerHeight = canvasContainer.clientHeight || (window.innerHeight - 75);
    
    console.log("Resizing to:", containerWidth, "x", containerHeight);
    
    // Update camera
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(containerWidth, containerHeight);
    
    // Force a re-render
    if (scene) renderer.render(scene, camera);
}

// Animation loop with improved debugging
function animate() {
    requestAnimationFrame(animate);
    
    if (controls) controls.update();
    
    // Animate any objects with custom animations
    if (board && board.boardGroup) {
        board.boardGroup.children.forEach(child => {
            if (child.userData && child.userData.animate && typeof child.userData.animate === 'function') {
                child.userData.animate.call(child);
            }
        });
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing game...");
    init();
});

// Log any errors
window.addEventListener('error', function(event) {
    console.error("Error:", event.message, "at", event.filename, ":", event.lineno);
});