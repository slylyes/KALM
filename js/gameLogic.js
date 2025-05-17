// Game logic controller for Quoridor

class GameLogic {
    constructor(scene, board, playerCount = 2, aiDifficulty = 'medium') {
        this.scene = scene;
        this.board = board;
        this.playerCount = playerCount;
        this.aiDifficulty = aiDifficulty;
        
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gameOver = false;
        this.winner = null;
        this.placementMode = 'move'; // Default to 'move' mode
        this.wallOrientation = 'horizontal'; // Default wall orientation
        
        // Initialize players
        this.initializePlayers();
        
        // Set up AI if needed
        this.setupAI();
    }
    
    initializePlayers() {
        const boardSize = this.board.boardSize;
        const midPoint = Math.floor(boardSize / 2);
        
        // Create players based on player count
        if (this.playerCount === 2) {
            // Player 1 (top)
            this.players.push(new Player(
                this.scene, 
                this.board, 
                0, 
                { x: midPoint, z: 0 },
                false
            ));
            
            // Player 2 (bottom) - AI or human
            this.players.push(new Player(
                this.scene, 
                this.board, 
                1, 
                { x: midPoint, z: boardSize - 1 },
                true // Usually the AI player
            ));
        } else if (this.playerCount === 4) {
            // Player 1 (top)
            this.players.push(new Player(
                this.scene, 
                this.board, 
                0, 
                { x: midPoint, z: 0 },
                false
            ));
            
            // Player 2 (bottom)
            this.players.push(new Player(
                this.scene, 
                this.board, 
                1, 
                { x: midPoint, z: boardSize - 1 },
                true // AI player
            ));
            
            // Player 3 (left)
            this.players.push(new Player(
                this.scene, 
                this.board, 
                2, 
                { x: 0, z: midPoint },
                true // AI player
            ));
            
            // Player 4 (right)
            this.players.push(new Player(
                this.scene, 
                this.board, 
                3, 
                { x: boardSize - 1, z: midPoint },
                true // AI player
            ));
        }
    }
    
    setupAI() {
        // Initialize AI controller
        this.ai = new AI(this, this.aiDifficulty);
    }
    
    // Get current player
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    
    // End the current player's turn and move to the next player
    nextTurn() {
        // Check if the current player has won
        if (this.getCurrentPlayer().hasReachedGoal()) {
            this.gameOver = true;
            this.winner = this.currentPlayerIndex;
            
            // Show winning message
            const winnerMessage = `Player ${this.currentPlayerIndex + 1} wins!`;
            if (typeof showGameMessage === 'function') {
                showGameMessage(winnerMessage);
            }
            
            return;
        }
        
        // Move to next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerCount;
        
        // Reset to movement mode for new player's turn
        this.placementMode = 'move';
        
        // Update UI with new current player
        document.querySelector('#current-player span').textContent = `Player ${this.currentPlayerIndex + 1}`;
        document.querySelector('#walls-left span').textContent = this.getCurrentPlayer().wallsLeft;
        
        // Update mode indicator in UI
        if (typeof updateModeIndicator === 'function') {
            updateModeIndicator('move');
        }
        
        // Update wall orientation controls visibility
        if (typeof updateWallOrientationControls === 'function') {
            updateWallOrientationControls(false);
        }
        
        // Update toggle button
        const toggleButton = document.getElementById('toggle-mode');
        if (toggleButton) {
            toggleButton.textContent = 'Switch to Wall Mode';
            toggleButton.className = 'mode-button move';
        }
        
        // Enable/disable mode toggle based on whether it's an AI turn
        if (typeof setModeToggleEnabled === 'function') {
            setModeToggleEnabled(!this.getCurrentPlayer().isAI);
        }
        
        // Highlight legal moves for new current player
        const legalMoves = this.getLegalMoves(this.getCurrentPlayer());
        this.board.highlightLegalMoves(this.getCurrentPlayer().boardPosition, legalMoves);
        
        // Announce next player's turn
        if (typeof showGameMessage === 'function') {
            showGameMessage(`Player ${this.currentPlayerIndex + 1}'s turn`);
        }
        
        // If next player is AI, make AI move
        if (this.getCurrentPlayer().isAI && !this.gameOver) {
            setTimeout(() => {
                this.makeAIMove();
            }, 1000); // Delay for better visual flow
        }
    }
    
    // Make AI move based on difficulty
    makeAIMove() {
        const aiMove = this.ai.determineMove(this.getCurrentPlayer());
        
        if (aiMove.type === 'move') {
            this.movePlayer(aiMove.position);
        } else if (aiMove.type === 'wall') {
            this.placeWall(aiMove.position.x, aiMove.position.z, aiMove.orientation);
        }
        
        // Move to next player
        this.nextTurn();
    }
    
    // Move a player to a new position
    movePlayer(newPosition) {
        const currentPlayer = this.getCurrentPlayer();
        currentPlayer.move(newPosition);
    }
    
    // Place a wall
    placeWall(x, z, orientation) {
        const currentPlayer = this.getCurrentPlayer();
        
        // Check if player has walls left
        if (currentPlayer.wallsLeft <= 0) {
            if (typeof showGameMessage === 'function') {
                showGameMessage("No walls left!", true);
            }
            return false;
        }
        
        // Try to place the wall
        if (this.board.placeWall(x, z, orientation, this.currentPlayerIndex)) {
            // Check if the wall blocks any player from reaching their goal
            for (let i = 0; i < this.players.length; i++) {
                if (!this.pathExistsToGoal(i)) {
                    // Rollback the wall placement
                    this.board.wallPositions[orientation === 'horizontal' ? 'horizontal' : 'vertical'].pop();
                    
                    if (typeof showGameMessage === 'function') {
                        showGameMessage("Wall blocks path to goal!", true);
                    }
                    
                    return false;
                }
            }
            
            // Reduce player's wall count
            currentPlayer.useWall();
            
            // Update UI
            document.querySelector('#walls-left span').textContent = currentPlayer.wallsLeft;
            
            return true;
        } else {
            if (typeof showGameMessage === 'function') {
                showGameMessage("Cannot place wall here!", true);
            }
        }
        
        return false;
    }
    
    // Get all legal moves for a player
    getLegalMoves(player) {
        const position = player.boardPosition;
        const boardSize = this.board.boardSize;
        const legalMoves = [];
        
        // Potential moves (up, right, down, left)
        const potentialMoves = [
            { x: position.x, z: position.z - 1 }, // Up
            { x: position.x + 1, z: position.z }, // Right
            { x: position.x, z: position.z + 1 }, // Down
            { x: position.x - 1, z: position.z }  // Left
        ];
        
        // Check each potential move
        for (const move of potentialMoves) {
            // Check if move is within board boundaries
            if (move.x >= 0 && move.x < boardSize && move.z >= 0 && move.z < boardSize) {
                // Check if there's a wall blocking the move
                if (!this.isWallBlocking(position, move)) {
                    // Check if there's another player in that position
                    const playerAtPosition = this.getPlayerAtPosition(move);
                    
                    if (!playerAtPosition) {
                        // Empty space, can move there
                        legalMoves.push(move);
                    } else {
                        // Another player is there, check if we can jump over
                        const jumpMove = this.getJumpMove(position, move);
                        if (jumpMove) {
                            legalMoves.push(jumpMove);
                        }
                    }
                }
            }
        }
        
        return legalMoves;
    }
    
    // Check if there's a wall blocking between two adjacent positions
    isWallBlocking(fromPos, toPos) {
        // Determine direction of movement
        const dx = toPos.x - fromPos.x;
        const dz = toPos.z - fromPos.z;
        
        // Check horizontal walls (blocking vertical movement)
        if (dz === -1) { // Moving up
            return this.board.wallPositions.horizontal.some(
                wall => wall.x === Math.min(fromPos.x, fromPos.x + 1) && wall.z === fromPos.z - 1
            );
        } else if (dz === 1) { // Moving down
            return this.board.wallPositions.horizontal.some(
                wall => wall.x === Math.min(fromPos.x, fromPos.x + 1) && wall.z === fromPos.z
            );
        }
        
        // Check vertical walls (blocking horizontal movement)
        if (dx === -1) { // Moving left
            return this.board.wallPositions.vertical.some(
                wall => wall.x === fromPos.x - 1 && wall.z === Math.min(fromPos.z, fromPos.z + 1)
            );
        } else if (dx === 1) { // Moving right
            return this.board.wallPositions.vertical.some(
                wall => wall.x === fromPos.x && wall.z === Math.min(fromPos.z, fromPos.z + 1)
            );
        }
        
        return false;
    }
    
    // Get the position after jumping over another player
    getJumpMove(fromPos, overPos) {
        // Calculate the position after the jump (in the same direction)
        const dx = overPos.x - fromPos.x;
        const dz = overPos.z - fromPos.z;
        
        const jumpPos = {
            x: overPos.x + dx,
            z: overPos.z + dz
        };
        
        const boardSize = this.board.boardSize;
        
        // Check if jump position is valid (within board and not blocked by wall)
        if (jumpPos.x >= 0 && jumpPos.x < boardSize && 
            jumpPos.z >= 0 && jumpPos.z < boardSize && 
            !this.isWallBlocking(overPos, jumpPos)) {
            
            // Check if there's another player at the jump position
            if (!this.getPlayerAtPosition(jumpPos)) {
                return jumpPos;
            } else {
                // There's another player at the jump position, check for diagonal jumps
                // (This is a special Quoridor rule for when players face each other)
                const diagonalJumps = [
                    { x: overPos.x + 1, z: overPos.z },
                    { x: overPos.x - 1, z: overPos.z },
                    { x: overPos.x, z: overPos.z + 1 },
                    { x: overPos.x, z: overPos.z - 1 }
                ].filter(pos => 
                    pos.x !== fromPos.x || pos.z !== fromPos.z
                );
                
                // Check each diagonal jump
                for (const diagJump of diagonalJumps) {
                    if (diagJump.x >= 0 && diagJump.x < boardSize && 
                        diagJump.z >= 0 && diagJump.z < boardSize && 
                        !this.isWallBlocking(overPos, diagJump) && 
                        !this.getPlayerAtPosition(diagJump)) {
                        return diagJump;
                    }
                }
            }
        }
        
        return null; // No valid jump move
    }
    
    // Get player at a specific board position
    getPlayerAtPosition(position) {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            if (player.boardPosition.x === position.x && 
                player.boardPosition.z === position.z) {
                return player;
            }
        }
        return null;
    }
    
    // Check if a path exists from a position to a goal
    pathExistsToGoal(playerIndex) {
        const player = this.players[playerIndex];
        const start = player.boardPosition;
        
        // Determine goal based on player index
        let isGoal;
        if (playerIndex === 0) {
            isGoal = pos => pos.z === this.board.boardSize - 1;
        } else if (playerIndex === 1) {
            isGoal = pos => pos.z === 0;
        } else if (playerIndex === 2) {
            isGoal = pos => pos.x === this.board.boardSize - 1;
        } else if (playerIndex === 3) {
            isGoal = pos => pos.x === 0;
        }
        
        // Breadth-first search to find path
        const queue = [start];
        const visited = new Set();
        visited.add(`${start.x},${start.z}`);
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Check if this is a goal position
            if (isGoal(current)) {
                return true;
            }
            
            // Get neighbors
            const neighbors = this.getLegalMovePositions(current);
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.z}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push(neighbor);
                }
            }
        }
        
        return false;
    }
    
    // Get legal move positions from a specific position (for pathfinding)
    getLegalMovePositions(position) {
        const boardSize = this.board.boardSize;
        const legalMoves = [];
        
        // Potential moves (up, right, down, left)
        const potentialMoves = [
            { x: position.x, z: position.z - 1 }, // Up
            { x: position.x + 1, z: position.z }, // Right
            { x: position.x, z: position.z + 1 }, // Down
            { x: position.x - 1, z: position.z }  // Left
        ];
        
        // Check each potential move
        for (const move of potentialMoves) {
            // Check if move is within board boundaries
            if (move.x >= 0 && move.x < boardSize && move.z >= 0 && move.z < boardSize) {
                // Check if there's a wall blocking the move
                if (!this.isWallBlocking(position, move)) {
                    legalMoves.push(move);
                }
            }
        }
        
        return legalMoves;
    }
    
    // Toggle between movement and wall placement modes
    togglePlacementMode() {
        this.placementMode = this.placementMode === 'move' ? 'wall' : 'move';
        
        // Clear any highlights or previews
        this.board.removeHighlights();
        this.board.removeWallPreviews();
        
        // Update UI based on new mode
        if (typeof showGameMessage === 'function') {
            const message = this.placementMode === 'move' 
                ? "Movement Mode: Click on a highlighted square to move" 
                : `Wall Placement Mode (${this.wallOrientation}): Click between squares to place walls`;
            showGameMessage(message);
        }
        
        // If in move mode, highlight legal moves
        if (this.placementMode === 'move') {
            const legalMoves = this.getLegalMoves(this.getCurrentPlayer());
            this.board.highlightLegalMoves(this.getCurrentPlayer().boardPosition, legalMoves);
        }
        
        // Update wall orientation controls visibility with a slight delay to ensure DOM updates
        setTimeout(() => {
            if (typeof updateWallOrientationControls === 'function') {
                updateWallOrientationControls(this.placementMode === 'wall');
                console.log("Wall placement mode:", this.placementMode === 'wall' ? "ENABLED" : "DISABLED");
                
                // Also update the orientation display
                if (this.placementMode === 'wall' && typeof updateWallOrientationDisplay === 'function') {
                    updateWallOrientationDisplay(this.wallOrientation);
                }
            }
        }, 50);
        
        return this.placementMode;
    }
    
    // Toggle wall orientation between horizontal and vertical
    toggleWallOrientation() {
        this.wallOrientation = this.wallOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        
        // Update UI
        if (typeof updateWallOrientationDisplay === 'function') {
            updateWallOrientationDisplay(this.wallOrientation);
        }
        
        // Show message
        if (typeof showGameMessage === 'function') {
            showGameMessage(`Wall orientation changed to ${this.wallOrientation}`);
        }
        
        return this.wallOrientation;
    }
    
    // Get current wall orientation
    getWallOrientation() {
        return this.wallOrientation;
    }
    
    // Get current placement mode
    getPlacementMode() {
        return this.placementMode;
    }
    
    // Clean up resources
    cleanup() {
        // Clean up players
        this.players.forEach(player => {
            player.cleanup();
        });
        
        // Reset players array
        this.players = [];
    }
}