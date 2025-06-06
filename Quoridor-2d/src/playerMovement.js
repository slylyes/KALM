// Gestion des mouvements des joueurs

import * as GameUtilModule from './gameUtil.js';
import * as WallModule from './wall.js';

// Affiche les mouvements possibles pour un joueur
export function showPossibleMoves(color) {
    clearMoveDots();
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('legal-move');
        sq.classList.remove('current-player-square');
    });

    // Ne colorie pas pour l'IA (mode 1 joueur)
    if (window.numOfPlayers == 1 && color == 'rouge') return;

    let prevSq = window.previousSquare[color];
    let prev = document.getElementById(prevSq);
    
    // Highlight the current player's square
    if (prev) {
        prev.classList.add('current-player-square');
    }
    
    let prevNum = GameUtilModule.getNb('sq', prevSq);

    // Highlight the current player's walls
    WallModule.highlightCurrentPlayerWalls(color);

    // Directions: [delta, wall on prev, wall on target]
    const directions = [
        [-1, 'wall-left', 'wall-right'],
        [1, 'wall-right', 'wall-left'],
        [-9, 'wall-top', 'wall-bottom'],
        [9, 'wall-bottom', 'wall-top']
    ];

    // Marquer les mouvements de base possibles
    for (let [delta, wallPrev, wallTarget] of directions) {
        let targetNum = prevNum + delta;
        if (targetNum < 1 || targetNum > 81) continue;
        if ((delta === -1 && (prevNum-1)%9 === 0) || (delta === 1 && prevNum%9 === 0)) continue;
        let target = document.getElementById('sq'+targetNum);
        if (!target) continue;
        if (prev.classList.contains(wallPrev) || target.classList.contains(wallTarget)) continue;
        
        // Vérifier si la case cible contient un pion
        if (target.getAttribute('data-pawn')) {
            // Si un pion est présent, vérifier si on peut sauter par-dessus
            let jumpTargetNum = targetNum + delta;
            if (jumpTargetNum < 1 || jumpTargetNum > 81) continue;
            if ((delta === -1 && (targetNum-1)%9 === 0) || (delta === 1 && targetNum%9 === 0)) continue;
            
            let jumpTarget = document.getElementById('sq'+jumpTargetNum);
            if (!jumpTarget) continue;
            
            // Vérifier si l'adversaire est bloqué
            let isBlocked = false;
            
            // Bloqué par un mur
            if (target.classList.contains(wallPrev) || jumpTarget.classList.contains(wallTarget)) {
                isBlocked = true;
            }
            // Bloqué par le bord du plateau
            else if (jumpTargetNum < 1 || jumpTargetNum > 81 || 
                     ((delta === -1 && (targetNum-1)%9 === 0) || (delta === 1 && targetNum%9 === 0))) {
                isBlocked = true;
            }
            // Bloqué par un autre pion
            else if (jumpTarget.getAttribute('data-pawn')) {
                isBlocked = true;
            }
            
            // Si la case après l'adversaire est libre, on peut sauter par-dessus
            if (!isBlocked) {
                jumpTarget.classList.add('legal-move');
            } else {
                // L'adversaire est bloqué, vérifier les mouvements diagonaux
                checkForDiagonalMoves(targetNum, delta);
                console.log(`Checking diagonal moves from opponent at sq${targetNum}, blocked in direction ${delta}`);
            }
        } else {
            // Highlight the normal move target
            target.classList.add('legal-move');
        }
    }
}

// Vérifie et ajoute les mouvements diagonaux possibles quand un adversaire est bloqué
function checkForDiagonalMoves(opponentPos, delta) {
    const opponentSquare = document.getElementById('sq' + opponentPos);
    
    // Déterminer les cases diagonales possibles selon la direction
    let diagonalMoves = [];
    
    if (delta === -1 || delta === 1) { // Mouvement horizontal (gauche/droite)
        // Vérifier les diagonales haut/bas
        diagonalMoves.push({ pos: opponentPos - 9, wall: 'wall-top' }); // haut
        diagonalMoves.push({ pos: opponentPos + 9, wall: 'wall-bottom' }); // bas
    } else { // Mouvement vertical (haut/bas)
        // Vérifier les diagonales gauche/droite
        if (opponentPos % 9 !== 1) { // Pas sur le bord gauche
            diagonalMoves.push({ pos: opponentPos - 1, wall: 'wall-left' }); // gauche
        }
        if (opponentPos % 9 !== 0) { // Pas sur le bord droit
            diagonalMoves.push({ pos: opponentPos + 1, wall: 'wall-right' }); // droite
        }
    }
    
    // Vérifier et ajouter chaque mouvement diagonal
    for (const move of diagonalMoves) {
        if (move.pos < 1 || move.pos > 81) continue;
        
        const diagSquare = document.getElementById('sq' + move.pos);
        if (!diagSquare) continue;
        
        // Vérifier qu'il n'y a pas de mur entre l'adversaire et la diagonale
        if (opponentSquare.classList.contains(move.wall)) continue;
        
        // Vérifier que la case diagonale n'est pas occupée
        if (diagSquare.getAttribute('data-pawn')) continue;
        
        // Ajouter comme mouvement légal
        diagSquare.classList.add('legal-move');
        console.log(`Added diagonal move to square sq${move.pos}`);
    }
}

// Supprime les indicateurs de mouvement
export function clearMoveDots() {
    document.querySelectorAll('.move-dot').forEach(dot => dot.remove());
}

// Configure les événements de clic sur les cases
export function setupSquareClickEvents(movePawn, checkIfWon, nextPlayer) {
    for(let sq of document.querySelectorAll('.square')){
        sq.onclick = () => {
            // Déplacer le pion si le clic est valide
            const sqId = sq.id;
            const sqNum = GameUtilModule.getNb('sq', sqId);
            
            console.log(`Clicked on ${sqId}, has legal-move: ${sq.classList.contains('legal-move')}`);
            
            // Vérifier si la case est marquée comme légale
            if (sq.classList.contains('legal-move')) {
                // Si la case contient déjà un pion, on ne peut pas s'y déplacer
                if (sq.getAttribute('data-pawn')) {
                    window.showCannotMoveOnPawnMsg();
                    return;
                }
                
                // Effectuer le déplacement
                movePawn(window.tour, `#${sqId}`);
                
                // Vérifier si le joueur a gagné
                checkIfWon(window.tour);
                
                // Passer au joueur suivant
                nextPlayer();
            } else {
                console.log(`Move to ${sqId} not allowed - not a legal move`);
            }
        };
    }
}

// Vérifie si un mouvement est valide
export function isValidMove(color, targetSquareId) {
    // We're using the legal-move class to determine valid moves
    const targetSq = document.getElementById(`sq${targetSquareId}`);
    return targetSq && targetSq.classList.contains('legal-move');
}

// Vérifie si on peut sauter par-dessus un pion
export function canJumpOver(color, targetSquareId) {
    // Implémentation de la fonction pour vérifier si on peut sauter par-dessus un pion
    const currentSquareId = parseInt(window.previousSquare[color].replace('sq', ''));
    const diff = targetSquareId - currentSquareId;
    
    // Vérifier si c'est un saut valide (distance de 2 dans une direction)
    if (![2, -2, 18, -18].includes(diff)) return false;
    
    // Calculer l'ID de la case intermédiaire (où se trouve le pion à sauter)
    const intermediateId = currentSquareId + diff/2;
    const intermediateSquare = document.getElementById(`sq${intermediateId}`);
    
    // Vérifier si la case intermédiaire existe et contient un pion
    if (!intermediateSquare || !intermediateSquare.getAttribute('data-pawn')) return false;
    
    // Vérifier s'il n'y a pas de mur entre les cases
    if (diff === 2) { // Saut vers la droite
        if (document.querySelector(`#sq${currentSquareId}`).classList.contains('wall-right') || 
            intermediateSquare.classList.contains('wall-right')) {
            return false;
        }
    } else if (diff === -2) { // Saut vers la gauche
        if (document.querySelector(`#sq${currentSquareId}`).classList.contains('wall-left') || 
            intermediateSquare.classList.contains('wall-left')) {
            return false;
        }
    } else if (diff === 18) { // Saut vers le bas
        if (document.querySelector(`#sq${currentSquareId}`).classList.contains('wall-bottom') || 
            intermediateSquare.classList.contains('wall-bottom')) {
            return false;
        }
    } else if (diff === -18) { // Saut vers le haut
        if (document.querySelector(`#sq${currentSquareId}`).classList.contains('wall-top') || 
            intermediateSquare.classList.contains('wall-top')) {
            return false;
        }
    }
    
    return true;
}

export default {
    showPossibleMoves,
    clearMoveDots,
    setupSquareClickEvents,
    isValidMove,
    canJumpOver
};