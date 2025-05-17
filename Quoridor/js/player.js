// Class for player representation and movement

class Player {
    constructor(scene, board, playerIndex, boardPosition, isAI = false) {
        this.scene = scene;
        this.board = board;
        this.playerIndex = playerIndex;
        this.boardPosition = boardPosition;
        this.isAI = isAI;
        this.wallsLeft = 10; // Standard number of walls per player
        
        // Colors for different players
        this.playerColors = [
            0x3498db, // Blue - Player 1
            0xe74c3c, // Red - Player 2
            0x2ecc71, // Green - Player 3
            0xf39c12  // Orange - Player 4
        ];
        
        // Create the player mesh
        this.createPlayerMesh();
        
        // Set goal position (opposite side for each player)
        this.setGoalPosition();
    }
    
    createPlayerMesh() {
        // Create a pawn-like shape for the player
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 16);
        const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 16);
        const topGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        
        // Materials
        const material = new THREE.MeshPhongMaterial({
            color: this.playerColors[this.playerIndex],
            specular: 0xffffff,
            shininess: 50
        });
        
        // Create meshes
        const baseMesh = new THREE.Mesh(baseGeometry, material);
        const bodyMesh = new THREE.Mesh(bodyGeometry, material);
        const topMesh = new THREE.Mesh(topGeometry, material);
        
        // Position parts
        baseMesh.position.y = 0.05;
        bodyMesh.position.y = 0.3;
        topMesh.position.y = 0.5;
        
        // Group all parts
        this.mesh = new THREE.Group();
        this.mesh.add(baseMesh);
        this.mesh.add(bodyMesh);
        this.mesh.add(topMesh);
        
        // Set up shadows
        this.mesh.castShadow = true;
        this.mesh.children.forEach(child => {
            child.castShadow = true;
        });
        
        // Set initial position
        this.updatePosition();
        
        // Add metadata
        this.mesh.userData = {
            type: 'player',
            playerIndex: this.playerIndex
        };
        
        // Add to scene
        this.scene.add(this.mesh);
    }
    
    updatePosition() {
        // Convert board coordinates to 3D position
        const position = this.board.boardToPosition(
            this.boardPosition.x, 
            this.boardPosition.z
        );
        
        // Update mesh position
        this.mesh.position.x = position.x;
        this.mesh.position.z = position.z;
    }
    
    setGoalPosition() {
        const boardSize = this.board.boardSize;
        
        // Set goal row/column based on player index
        switch(this.playerIndex) {
            case 0: // Player 1 starts at top, goal at bottom
                this.goalRow = boardSize - 1;
                break;
            case 1: // Player 2 starts at bottom, goal at top
                this.goalRow = 0;
                break;
            case 2: // Player 3 starts at left, goal at right (4-player mode)
                this.goalColumn = boardSize - 1;
                break;
            case 3: // Player 4 starts at right, goal at left (4-player mode)
                this.goalColumn = 0;
                break;
        }
    }
    
    // Move player to a new position
    move(newPosition) {
        this.boardPosition = newPosition;
        
        // Animate the movement
        this.animateMovement();
    }
    
    // Animate player movement to new position
    animateMovement() {
        const position = this.board.boardToPosition(
            this.boardPosition.x, 
            this.boardPosition.z
        );
        
        // Store initial position
        const startX = this.mesh.position.x;
        const startZ = this.mesh.position.z;
        
        // Calculate distance for jump effect
        const distance = Math.sqrt(
            Math.pow(position.x - startX, 2) + 
            Math.pow(position.z - startZ, 2)
        );
        
        // Animate over time
        const duration = 500; // ms
        const startTime = Date.now();
        
        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease in-out function
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // Update x and z positions
            this.mesh.position.x = startX + (position.x - startX) * easeProgress;
            this.mesh.position.z = startZ + (position.z - startZ) * easeProgress;
            
            // Add a jump effect
            const jumpHeight = distance * 0.2; // Height proportional to distance
            this.mesh.position.y = 0.05 + jumpHeight * Math.sin(progress * Math.PI);
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        // Start animation
        animate();
    }
    
    // Use a wall
    useWall() {
        if (this.wallsLeft > 0) {
            this.wallsLeft--;
            return true;
        }
        return false;
    }
    
    // Check if player has reached their goal
    hasReachedGoal() {
        if (this.goalRow !== undefined) {
            return this.boardPosition.z === this.goalRow;
        } else if (this.goalColumn !== undefined) {
            return this.boardPosition.x === this.goalColumn;
        }
        return false;
    }
    
    // Clean up resources
    cleanup() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
    }
}