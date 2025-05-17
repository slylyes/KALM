// AI controller for Quoridor

class AI {
    constructor(gameLogic, difficulty = 'medium') {
        this.gameLogic = gameLogic;
        this.difficulty = difficulty;
        
        // Set search depth based on difficulty
        this.searchDepth = this.getSearchDepth();
    }
    
    // Set search depth based on difficulty
    getSearchDepth() {
        switch(this.difficulty) {
            case 'easy': return 1;
            case 'medium': return 2;
            case 'hard': return 3;
            default: return 2;
        }
    }
    
    // Determine the best move for AI
    determineMove(player) {
        // At easy difficulty, sometimes make random moves
        if (this.difficulty === 'easy' && Math.random() < 0.3) {
            return this.makeRandomMove(player);
        }
        
        // Different strategies based on difficulty
        if (this.difficulty === 'easy') {
            return this.makeGreedyMove(player);
        } else {
            return this.makeMinimaxMove(player);
        }
    }
    
    // Make a completely random move
    makeRandomMove(player) {
        const legalMoves = this.gameLogic.getLegalMoves(player);
        
        // Decide randomly whether to move or place a wall
        const shouldPlaceWall = player.wallsLeft > 0 && Math.random() < 0.4;
        
        if (shouldPlaceWall) {
            // Try to place a random wall
            const boardSize = this.gameLogic.board.boardSize;
            
            // Try several random positions until a valid one is found
            for (let attempt = 0; attempt < 20; attempt++) {
                const x = Math.floor(Math.random() * (boardSize - 1));
                const z = Math.floor(Math.random() * (boardSize - 1));
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                
                // Check if wall placement is valid
                if (this.gameLogic.board.canPlaceWall(x, z, orientation)) {
                    return {
                        type: 'wall',
                        position: { x, z },
                        orientation
                    };
                }
            }
        }
        
        // Default to movement if no valid wall placement found
        if (legalMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * legalMoves.length);
            return {
                type: 'move',
                position: legalMoves[randomIndex]
            };
        }
        
        // Fallback (should never happen in a valid game state)
        return {
            type: 'move',
            position: player.boardPosition
        };
    }
    
    // Make a greedy move (simple heuristic)
    makeGreedyMove(player) {
        const legalMoves = this.gameLogic.getLegalMoves(player);
        let bestMove = null;
        let bestScore = -Infinity;
        
        // Evaluate each move
        for (const move of legalMoves) {
            const score = this.evaluatePosition(move, player);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        // Consider placing a wall
        if (player.wallsLeft > 0 && Math.random() < 0.5) {
            const wallMove = this.findGoodWallPlacement();
            if (wallMove) {
                return wallMove;
            }
        }
        
        // Return the best move
        return {
            type: 'move',
            position: bestMove || legalMoves[0]
        };
    }
    
    // Find a good wall placement (blocking opponent)
    findGoodWallPlacement() {
        const board = this.gameLogic.board;
        const boardSize = board.boardSize;
        const currentPlayerIndex = this.gameLogic.currentPlayerIndex;
        
        // Find opponent's index (in 2-player game)
        const opponentIndex = (currentPlayerIndex + 1) % this.gameLogic.playerCount;
        const opponent = this.gameLogic.players[opponentIndex];
        
        // Get legal moves for opponent
        const opponentMoves = this.gameLogic.getLegalMoves(opponent);
        
        // Find the move that gets opponent closest to goal
        let bestOpponentMove = null;
        let shortestDistance = Infinity;
        
        for (const move of opponentMoves) {
            let distance;
            
            // Calculate distance to goal based on player index
            if (opponentIndex === 0) {
                // Goal is bottom row
                distance = boardSize - 1 - move.z;
            } else if (opponentIndex === 1) {
                // Goal is top row
                distance = move.z;
            } else if (opponentIndex === 2) {
                // Goal is right column
                distance = boardSize - 1 - move.x;
            } else {
                // Goal is left column
                distance = move.x;
            }
            
            if (distance < shortestDistance) {
                shortestDistance = distance;
                bestOpponentMove = move;
            }
        }
        
        // If found a good move for opponent, try to block it
        if (bestOpponentMove) {
            const opponentPos = opponent.boardPosition;
            
            // Determine direction of movement
            const dx = bestOpponentMove.x - opponentPos.x;
            const dz = bestOpponentMove.z - opponentPos.z;
            
            // Try to place a wall to block this move
            if (dz === -1) { // Opponent moving up
                // Try horizontal wall above opponent
                const x = Math.min(opponentPos.x, opponentPos.x - 1 + 1);
                const z = opponentPos.z - 1;
                if (board.canPlaceWall(x, z, 'horizontal')) {
                    return {
                        type: 'wall',
                        position: { x, z },
                        orientation: 'horizontal'
                    };
                }
            } else if (dz === 1) { // Opponent moving down
                // Try horizontal wall below opponent
                const x = Math.min(opponentPos.x, opponentPos.x - 1 + 1);
                const z = opponentPos.z;
                if (board.canPlaceWall(x, z, 'horizontal')) {
                    return {
                        type: 'wall',
                        position: { x, z },
                        orientation: 'horizontal'
                    };
                }
            } else if (dx === -1) { // Opponent moving left
                // Try vertical wall to the left of opponent
                const x = opponentPos.x - 1;
                const z = Math.min(opponentPos.z, opponentPos.z - 1 + 1);
                if (board.canPlaceWall(x, z, 'vertical')) {
                    return {
                        type: 'wall',
                        position: { x, z },
                        orientation: 'vertical'
                    };
                }
            } else if (dx === 1) { // Opponent moving right
                // Try vertical wall to the right of opponent
                const x = opponentPos.x;
                const z = Math.min(opponentPos.z, opponentPos.z - 1 + 1);
                if (board.canPlaceWall(x, z, 'vertical')) {
                    return {
                        type: 'wall',
                        position: { x, z },
                        orientation: 'vertical'
                    };
                }
            }
        }
        
        return null; // No good wall placement found
    }
    
    // Make move using minimax algorithm (for medium/hard difficulty)
    makeMinimaxMove(player) {
        // Get current game state
        const gameState = {
            players: this.gameLogic.players.map(p => ({
                boardPosition: { ...p.boardPosition },
                wallsLeft: p.wallsLeft
            })),
            currentPlayerIndex: this.gameLogic.currentPlayerIndex,
            wallPositions: {
                horizontal: [...this.gameLogic.board.wallPositions.horizontal],
                vertical: [...this.gameLogic.board.wallPositions.vertical]
            }
        };
        
        // Call minimax to find best move
        const result = this.minimax(gameState, this.searchDepth, true, -Infinity, Infinity);
        
        return result.move;
    }
    
    // Minimax algorithm with alpha-beta pruning
    minimax(state, depth, maximizingPlayer, alpha, beta) {
        // Get current player in this state
        const currentPlayerIndex = state.currentPlayerIndex;
        const currentPlayer = state.players[currentPlayerIndex];
        
        // Check for terminal state or depth limit
        if (depth === 0 || this.isTerminalState(state)) {
            return {
                score: this.evaluateState(state, maximizingPlayer ? currentPlayerIndex : (currentPlayerIndex + 1) % this.gameLogic.playerCount),
                move: null
            };
        }
        
        // Get possible moves for current player
        const possibleMoves = this.getPossibleMoves(state);
        
        if (maximizingPlayer) {
            let maxScore = -Infinity;
            let bestMove = null;
            
            for (const move of possibleMoves) {
                // Apply move to get new state
                const newState = this.applyMove(state, move);
                
                // Recursive minimax call
                const result = this.minimax(newState, depth - 1, false, alpha, beta);
                
                // Update best score and move
                if (result.score > maxScore) {
                    maxScore = result.score;
                    bestMove = move;
                }
                
                // Alpha-beta pruning
                alpha = Math.max(alpha, maxScore);
                if (beta <= alpha) {
                    break;
                }
            }
            
            return { score: maxScore, move: bestMove };
        } else {
            let minScore = Infinity;
            let bestMove = null;
            
            for (const move of possibleMoves) {
                // Apply move to get new state
                const newState = this.applyMove(state, move);
                
                // Recursive minimax call
                const result = this.minimax(newState, depth - 1, true, alpha, beta);
                
                // Update best score and move
                if (result.score < minScore) {
                    minScore = result.score;
                    bestMove = move;
                }
                
                // Alpha-beta pruning
                beta = Math.min(beta, minScore);
                if (beta <= alpha) {
                    break;
                }
            }
            
            return { score: minScore, move: bestMove };
        }
    }
    
    // Get all possible moves for current player in a state
    getPossibleMoves(state) {
        const moves = [];
        const currentPlayerIndex = state.currentPlayerIndex;
        const currentPlayer = state.players[currentPlayerIndex];
        
        // Add movement options
        const legalMoves = this.getLegalMovesForState(state, currentPlayer);
        
        for (const move of legalMoves) {
            moves.push({
                type: 'move',
                position: move
            });
        }
        
        // Add wall placement options if player has walls left
        if (currentPlayer.wallsLeft > 0) {
            // For performance reasons, only consider a subset of wall placements
            const boardSize = this.gameLogic.board.boardSize;
            
            // Find opponent's position
            const opponentIndex = (currentPlayerIndex + 1) % this.gameLogic.playerCount;
            const opponent = state.players[opponentIndex];
            
            // Consider walls near opponent and current player (more likely to be strategic)
            const positions = [
                { x: opponent.boardPosition.x, z: opponent.boardPosition.z },
                { x: opponent.boardPosition.x + 1, z: opponent.boardPosition.z },
                { x: opponent.boardPosition.x - 1, z: opponent.boardPosition.z },
                { x: opponent.boardPosition.x, z: opponent.boardPosition.z + 1 },
                { x: opponent.boardPosition.x, z: opponent.boardPosition.z - 1 },
                { x: currentPlayer.boardPosition.x, z: currentPlayer.boardPosition.z },
                { x: currentPlayer.boardPosition.x + 1, z: currentPlayer.boardPosition.z },
                { x: currentPlayer.boardPosition.x - 1, z: currentPlayer.boardPosition.z },
                { x: currentPlayer.boardPosition.x, z: currentPlayer.boardPosition.z + 1 },
                { x: currentPlayer.boardPosition.x, z: currentPlayer.boardPosition.z - 1 }
            ];
            
            // Only consider unique valid positions
            const consideredPositions = new Set();
            
            for (const pos of positions) {
                if (pos.x >= 0 && pos.x < boardSize - 1 && pos.z >= 0 && pos.z < boardSize - 1) {
                    const key = `${pos.x},${pos.z}`;
                    if (!consideredPositions.has(key)) {
                        consideredPositions.add(key);
                        
                        // Check horizontal wall
                        if (this.canPlaceWallInState(state, pos.x, pos.z, 'horizontal')) {
                            moves.push({
                                type: 'wall',
                                position: { x: pos.x, z: pos.z },
                                orientation: 'horizontal'
                            });
                        }
                        
                        // Check vertical wall
                        if (this.canPlaceWallInState(state, pos.x, pos.z, 'vertical')) {
                            moves.push({
                                type: 'wall',
                                position: { x: pos.x, z: pos.z },
                                orientation: 'vertical'
                            });
                        }
                    }
                }
            }
        }
        
        return moves;
    }
    
    // Apply a move to a state and return new state
    applyMove(state, move) {
        // Create deep copy of state
        const newState = {
            players: state.players.map(p => ({
                boardPosition: { ...p.boardPosition },
                wallsLeft: p.wallsLeft
            })),
            currentPlayerIndex: state.currentPlayerIndex,
            wallPositions: {
                horizontal: [...state.wallPositions.horizontal],
                vertical: [...state.wallPositions.vertical]
            }
        };
        
        const currentPlayer = newState.players[newState.currentPlayerIndex];
        
        // Apply the move
        if (move.type === 'move') {
            currentPlayer.boardPosition = { ...move.position };
        } else if (move.type === 'wall') {
            // Add wall to positions
            if (move.orientation === 'horizontal') {
                newState.wallPositions.horizontal.push({ 
                    x: move.position.x, 
                    z: move.position.z 
                });
            } else {
                newState.wallPositions.vertical.push({ 
                    x: move.position.x, 
                    z: move.position.z 
                });
            }
            
            // Decrement player's wall count
            currentPlayer.wallsLeft--;
        }
        
        // Move to next player
        newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % this.gameLogic.playerCount;
        
        return newState;
    }
    
    // Check if a state is terminal (game over)
    isTerminalState(state) {
        // Check if any player has reached their goal
        for (let i = 0; i < state.players.length; i++) {
            if (this.hasReachedGoalInState(state, i)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Check if a player has reached their goal in a state
    hasReachedGoalInState(state, playerIndex) {
        const player = state.players[playerIndex];
        const boardSize = this.gameLogic.board.boardSize;
        
        // Check based on player index
        if (playerIndex === 0) {
            return player.boardPosition.z === boardSize - 1;
        } else if (playerIndex === 1) {
            return player.boardPosition.z === 0;
        } else if (playerIndex === 2) {
            return player.boardPosition.x === boardSize - 1;
        } else if (playerIndex === 3) {
            return player.boardPosition.x === 0;
        }
        
        return false;
    }
    
    // Evaluate a state for minimax (higher is better for maximizing player)
    evaluateState(state, playerIndex) {
        const player = state.players[playerIndex];
        const boardSize = this.gameLogic.board.boardSize;
        
        // If player reached goal, very high score
        if (this.hasReachedGoalInState(state, playerIndex)) {
            return 1000;
        }
        
        // If opponent reached goal, very low score
        const opponentIndex = (playerIndex + 1) % this.gameLogic.playerCount;
        if (this.hasReachedGoalInState(state, opponentIndex)) {
            return -1000;
        }
        
        // Calculate distance to goal
        let distanceToGoal;
        if (playerIndex === 0) {
            distanceToGoal = boardSize - 1 - player.boardPosition.z;
        } else if (playerIndex === 1) {
            distanceToGoal = player.boardPosition.z;
        } else if (playerIndex === 2) {
            distanceToGoal = boardSize - 1 - player.boardPosition.x;
        } else {
            distanceToGoal = player.boardPosition.x;
        }
        
        // Calculate opponent's distance to goal
        const opponent = state.players[opponentIndex];
        let opponentDistanceToGoal;
        if (opponentIndex === 0) {
            opponentDistanceToGoal = boardSize - 1 - opponent.boardPosition.z;
        } else if (opponentIndex === 1) {
            opponentDistanceToGoal = opponent.boardPosition.z;
        } else if (opponentIndex === 2) {
            opponentDistanceToGoal = boardSize - 1 - opponent.boardPosition.x;
        } else {
            opponentDistanceToGoal = opponent.boardPosition.x;
        }
        
        // Heuristic: prefer shorter distance to goal for player and longer for opponent
        return (opponentDistanceToGoal * 10) - (distanceToGoal * 10) + (player.wallsLeft * 5);
    }
    
    // Evaluate position for simple moves
    evaluatePosition(position, player) {
        const boardSize = this.gameLogic.board.boardSize;
        
        // Calculate distance to goal
        let distanceToGoal;
        if (player.playerIndex === 0) {
            distanceToGoal = boardSize - 1 - position.z;
        } else if (player.playerIndex === 1) {
            distanceToGoal = position.z;
        } else if (player.playerIndex === 2) {
            distanceToGoal = boardSize - 1 - position.x;
        } else {
            distanceToGoal = position.x;
        }
        
        // Return negative distance (higher score = better move)
        return -distanceToGoal;
    }
    
    // Check if a wall can be placed in a given state
    canPlaceWallInState(state, x, z, orientation) {
        // Check if the wall is within the board boundaries
        const boardSize = this.gameLogic.board.boardSize;
        
        if (orientation === 'horizontal') {
            if (x < 0 || x >= boardSize - 1 || z < 0 || z >= boardSize) {
                return false;
            }
            
            // Check if there's already a horizontal wall here
            if (state.wallPositions.horizontal.some(wall => wall.x === x && wall.z === z)) {
                return false;
            }
            
            // Check for intersecting walls
            if (state.wallPositions.vertical.some(wall => 
                (wall.x === x || wall.x === x + 1) && wall.z === z - 1)) {
                return false;
            }
        } else {
            if (x < 0 || x >= boardSize || z < 0 || z >= boardSize - 1) {
                return false;
            }
            
            // Check if there's already a vertical wall here
            if (state.wallPositions.vertical.some(wall => wall.x === x && wall.z === z)) {
                return false;
            }
            
            // Check for intersecting walls
            if (state.wallPositions.horizontal.some(wall => 
                (wall.z === z || wall.z === z + 1) && wall.x === x - 1)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Get legal moves for a player in a given state
    getLegalMovesForState(state, player) {
        const position = player.boardPosition;
        const boardSize = this.gameLogic.board.boardSize;
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
                // For simplicity, just check wall placement but not jumping
                legalMoves.push(move);
            }
        }
        
        return legalMoves;
    }
}