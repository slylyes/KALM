// Handles creation and management of the 3D game board

class Board {
    constructor(scene) {
        this.scene = scene;
        this.boardSize = 9; // Standard Quoridor board is 9x9
        this.squareSize = 1;
        this.boardGroup = new THREE.Group(); // Group to hold all board elements
        
        // Grid to track board state
        this.grid = [];
        
        // Reference to wall placements
        this.wallPositions = {
            horizontal: [],
            vertical: []
        };
        
        // Materials
        this.materials = {
            board: new THREE.MeshPhongMaterial({ 
                color: 0x8B4513,
                specular: 0x554433,
                shininess: 15
            }),
            squareLight: new THREE.MeshPhongMaterial({ 
                color: 0xD2B48C,
                specular: 0xAA9977,
                shininess: 10
            }),
            squareDark: new THREE.MeshPhongMaterial({ 
                color: 0x8B5A2B,
                specular: 0x554433,
                shininess: 10
            }),
            highlight: new THREE.MeshBasicMaterial({ 
                color: 0x3498db,
                transparent: true,
                opacity: 0.5
            }),
            wallPreview: new THREE.MeshBasicMaterial({ 
                color: 0xe74c3c,
                transparent: true,
                opacity: 0.6
            }),
            wall: new THREE.MeshPhongMaterial({ 
                color: 0x34495e,
                specular: 0x95a5a6,
                shininess: 30
            })
        };
        
        // Initialize grid
        this.initializeGrid();
    }
    
    initializeGrid() {
        // Create a 2D array to represent the board state
        this.grid = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
    }
    
    create() {
        // Add a base for the board
        const baseGeometry = new THREE.BoxGeometry(
            this.boardSize * this.squareSize + 2, 
            0.5, 
            this.boardSize * this.squareSize + 2
        );
        const baseMesh = new THREE.Mesh(baseGeometry, this.materials.board);
        baseMesh.position.y = -0.25;
        baseMesh.receiveShadow = true;
        this.boardGroup.add(baseMesh);
        
        // Create the checkered board squares with gaps between them
        for (let x = 0; x < this.boardSize; x++) {
            for (let z = 0; z < this.boardSize; z++) {
                // Use a smaller size for tiles to create visible gaps
                const squareGeometry = new THREE.BoxGeometry(
                    this.squareSize * 0.88, // Reduced size to create gaps
                    0.1,
                    this.squareSize * 0.88
                );
                
                // Alternate materials for checkered pattern
                const isEven = (x + z) % 2 === 0;
                const material = isEven ? this.materials.squareLight : this.materials.squareDark;
                
                const square = new THREE.Mesh(squareGeometry, material);
                
                // Position the square
                const posX = (x - Math.floor(this.boardSize / 2)) * this.squareSize;
                const posZ = (z - Math.floor(this.boardSize / 2)) * this.squareSize;
                square.position.set(posX, 0, posZ);
                
                square.receiveShadow = true;
                
                // Add metadata for raycasting
                square.userData = {
                    type: 'square',
                    boardX: x,
                    boardZ: z
                };
                
                // Create a larger invisible hit area for better clicking
                const hitAreaGeometry = new THREE.BoxGeometry(
                    this.squareSize * 0.9,
                    0.2, // Taller for easier intersection
                    this.squareSize * 0.9
                );
                const hitAreaMaterial = new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0,
                    depthWrite: false // Don't write to depth buffer
                });
                const hitArea = new THREE.Mesh(hitAreaGeometry, hitAreaMaterial);
                hitArea.position.y = 0.1; // Position slightly above the square
                hitArea.userData = {
                    type: 'squareHitArea',
                    boardX: x,
                    boardZ: z
                };
                
                square.add(hitArea); // Add as child of square
                this.boardGroup.add(square);
            }
        }
        
        // Create more prominent wall placement guides
        this.createWallGuides();
        
        // Add the board group to the scene
        this.scene.add(this.boardGroup);
    }
    
    createWallGuides() {
        // Create guides for horizontal wall placements (between rows)
        for (let x = 0; x < this.boardSize - 1; x++) {
            for (let z = 0; z < this.boardSize; z++) {
                const guideGeometry = new THREE.BoxGeometry(
                    this.squareSize * 0.3, // Wider for better visibility
                    0.08, // Taller for better visibility
                    this.squareSize * 0.95
                );
                
                const guide = new THREE.Mesh(
                    guideGeometry, 
                    new THREE.MeshBasicMaterial({ 
                        color: 0x7fc8f8, // Brighter color
                        transparent: true,
                        opacity: 0.4 // More opaque
                    })
                );
                
                const posX = (x - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize / 2;
                const posZ = (z - Math.floor(this.boardSize / 2)) * this.squareSize;
                guide.position.set(posX, 0.01, posZ);
                
                guide.userData = {
                    type: 'wallGuide',
                    orientation: 'horizontal',
                    boardX: x,
                    boardZ: z
                };
                
                this.boardGroup.add(guide);
            }
        }
        
        // Create guides for vertical wall placements (between columns)
        for (let x = 0; x < this.boardSize; x++) {
            for (let z = 0; z < this.boardSize - 1; z++) {
                const guideGeometry = new THREE.BoxGeometry(
                    this.squareSize * 0.95,
                    0.08, // Taller for better visibility
                    this.squareSize * 0.3 // Wider for better visibility
                );
                
                const guide = new THREE.Mesh(
                    guideGeometry, 
                    new THREE.MeshBasicMaterial({ 
                        color: 0x7fc8f8, // Brighter color
                        transparent: true,
                        opacity: 0.4 // More opaque
                    })
                );
                
                const posX = (x - Math.floor(this.boardSize / 2)) * this.squareSize;
                const posZ = (z - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize / 2;
                guide.position.set(posX, 0.01, posZ);
                
                guide.userData = {
                    type: 'wallGuide',
                    orientation: 'vertical',
                    boardX: x,
                    boardZ: z
                };
                
                this.boardGroup.add(guide);
            }
        }
        
        // Create intersection points (where walls cross)
        for (let x = 0; x < this.boardSize - 1; x++) {
            for (let z = 0; z < this.boardSize - 1; z++) {
                const intersectionGeometry = new THREE.BoxGeometry(
                    this.squareSize * 0.3,
                    0.06,
                    this.squareSize * 0.3
                );
                
                const intersection = new THREE.Mesh(
                    intersectionGeometry, 
                    new THREE.MeshBasicMaterial({ 
                        color: 0xaaaaaa,
                        transparent: true,
                        opacity: 0.3
                    })
                );
                
                const posX = (x - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize / 2;
                const posZ = (z - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize / 2;
                intersection.position.set(posX, 0.005, posZ);
                
                this.boardGroup.add(intersection);
            }
        }
    }
    
    // Highlight legal moves for the current player
    highlightLegalMoves(playerPosition, legalMoves) {
        // Remove any existing highlights
        this.removeHighlights();
        
        // Create new highlights
        legalMoves.forEach(move => {
            const highlightGeometry = new THREE.BoxGeometry(
                this.squareSize * 0.88, // Match the new tile size
                0.1,
                this.squareSize * 0.88
            );
            
            // Use a brighter, more visible highlight
            const highlightMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x4cc9f0,
                transparent: true,
                opacity: 0.6
            });
            
            const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
            
            const posX = (move.x - Math.floor(this.boardSize / 2)) * this.squareSize;
            const posZ = (move.z - Math.floor(this.boardSize / 2)) * this.squareSize;
            highlight.position.set(posX, 0.06, posZ);
            
            highlight.userData = {
                type: 'highlight',
                boardX: move.x,
                boardZ: move.z
            };
            
            // Add pulsing animation to highlight
            const startTime = Date.now();
            highlight.userData.animate = function() {
                const elapsed = Date.now() - startTime;
                const pulseFactor = 0.1 * Math.sin(elapsed * 0.005) + 0.9;
                this.scale.set(pulseFactor, 1, pulseFactor);
            };
            
            this.boardGroup.add(highlight);
        });
    }
    
    // Remove highlight indicators
    removeHighlights() {
        this.boardGroup.children.forEach(child => {
            if (child.userData && child.userData.type === 'highlight') {
                this.boardGroup.remove(child);
            }
        });
    }
    
    // Show a wall preview at the specified location
    showWallPreview(x, z, orientation) {
        // Remove any existing previews
        this.removeWallPreviews();
        
        // Check if the wall would be a legal placement
        if (!this.canPlaceWall(x, z, orientation)) {
            return false;
        }
        
        let wallGeometry;
        let posX, posZ;
        
        if (orientation === 'horizontal') {
            wallGeometry = new THREE.BoxGeometry(
                this.squareSize * 2.1,
                0.5, // Taller for better visibility
                this.squareSize * 0.3 // Wider for better visibility
            );
            
            posX = (x - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize * 0.5;
            posZ = (z - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize * 0.5;
        } else {
            wallGeometry = new THREE.BoxGeometry(
                this.squareSize * 0.3, // Wider for better visibility
                0.5, // Taller for better visibility
                this.squareSize * 2.1
            );
            
            posX = (x - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize * 0.5;
            posZ = (z - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize * 0.5;
        }
        
        // Use a more visible material for preview
        const previewMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff3333, // Brighter red
            transparent: true,
            opacity: 0.9, // More opaque for visibility
            side: THREE.DoubleSide
        });
        
        const preview = new THREE.Mesh(wallGeometry, previewMaterial);
        preview.position.set(posX, 0.3, posZ); // Slightly higher position for better visibility
        
        preview.userData = {
            type: 'wallPreview',
            orientation: orientation,
            boardX: x,
            boardZ: z
        };
        
        this.boardGroup.add(preview);
        
        // Add an outline to make it more visible
        const edges = new THREE.EdgesGeometry(wallGeometry);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 }) // Thicker line
        );
        line.position.copy(preview.position);
        line.userData = { type: 'wallPreviewOutline' };
        this.boardGroup.add(line);
        
        // Add a pulsing animation to make it more noticeable
        const startTime = Date.now();
        preview.userData.animate = function() {
            const elapsed = Date.now() - startTime;
            const scaleFactor = 1.0 + 0.05 * Math.sin(elapsed * 0.005);
            this.scale.set(1, scaleFactor, 1);
        };
        
        return true;
    }
    
    // Remove wall preview
    removeWallPreviews() {
        const toRemove = [];
        this.boardGroup.children.forEach(child => {
            if (child.userData && 
                (child.userData.type === 'wallPreview' || 
                 child.userData.type === 'wallPreviewOutline')) {
                toRemove.push(child);
            }
        });
        
        // Remove all identified objects
        toRemove.forEach(obj => {
            this.boardGroup.remove(obj);
        });
    }
    
    // Place a wall at the specified location
    placeWall(x, z, orientation, playerIndex) {
        // Check if the wall can be placed
        if (!this.canPlaceWall(x, z, orientation)) {
            return false;
        }
        
        let wallGeometry;
        let posX, posZ;
        
        // Create different geometry based on wall orientation
        if (orientation === 'horizontal') {
            wallGeometry = new THREE.BoxGeometry(
                this.squareSize * 2.1,
                0.4,
                this.squareSize * 0.2
            );
            
            posX = (x - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize * 0.5;
            posZ = (z - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize * 0.5;
            
            // Update wall positions record
            this.wallPositions.horizontal.push({ x, z });
        } else {
            wallGeometry = new THREE.BoxGeometry(
                this.squareSize * 0.2,
                0.4,
                this.squareSize * 2.1
            );
            
            posX = (x - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize * 0.5;
            posZ = (z - Math.floor(this.boardSize / 2)) * this.squareSize + this.squareSize * 0.5;
            
            // Update wall positions record
            this.wallPositions.vertical.push({ x, z });
        }
        
        // Create player-specific wall material (customize colors for different players)
        const playerColors = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: playerColors[playerIndex],
            specular: 0x95a5a6,
            shininess: 30
        });
        
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(posX, 0.2, posZ);
        wall.castShadow = true;
        
        wall.userData = {
            type: 'wall',
            orientation: orientation,
            boardX: x,
            boardZ: z,
            playerIndex: playerIndex
        };
        
        this.boardGroup.add(wall);
        return true;
    }
    
    // Check if a wall can be placed at the specified location
    canPlaceWall(x, z, orientation) {
        // Check if the wall is within the board boundaries
        if (orientation === 'horizontal') {
            if (x < 0 || x >= this.boardSize - 2 || z < 0 || z >= this.boardSize) {
                return false;
            }
            
            // Check if there's already a horizontal wall here
            if (this.wallPositions.horizontal.some(wall => wall.x === x && wall.z === z)) {
                return false;
            }
            
            // Check for intersecting walls
            if (this.wallPositions.vertical.some(wall => 
                (wall.x === x || wall.x === x + 1) && wall.z === z - 1)) {
                return false;
            }
        } else {
            if (x < 0 || x >= this.boardSize || z < 0 || z >= this.boardSize - 2) {
                return false;
            }
            
            // Check if there's already a vertical wall here
            if (this.wallPositions.vertical.some(wall => wall.x === x && wall.z === z)) {
                return false;
            }
            
            // Check for intersecting walls
            if (this.wallPositions.horizontal.some(wall => 
                (wall.z === z || wall.z === z + 1) && wall.x === x - 1)) {
                return false;
            }
        }
        
        // Check if this wall would completely block a player's path to goal
        // This is handled in the GameLogic class

        return true;
    }
    
    // Convert board coordinates to 3D position
    boardToPosition(x, z) {
        return {
            x: (x - Math.floor(this.boardSize / 2)) * this.squareSize,
            z: (z - Math.floor(this.boardSize / 2)) * this.squareSize
        };
    }
    
    // Reset the board to initial state
    reset() {
        // Remove all walls and highlights
        this.boardGroup.children.forEach(child => {
            if (child.userData && 
                (child.userData.type === 'wall' || 
                 child.userData.type === 'highlight' || 
                 child.userData.type === 'wallPreview')) {
                this.boardGroup.remove(child);
            }
        });
        
        // Reset wall positions
        this.wallPositions = {
            horizontal: [],
            vertical: []
        };
        
        // Reset grid
        this.initializeGrid();
    }
}