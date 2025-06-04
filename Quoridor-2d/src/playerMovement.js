// Gestion des mouvements des joueurs

import * as GameUtilModule from './gameUtil.js';

// Affiche les mouvements possibles pour un joueur
export function showPossibleMoves(color) {
    clearMoveDots();
    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('legal-move')); // Clear previous highlights

    // Ne colorie pas pour l'IA (mode 1 joueur)
    if (window.numOfPlayers == 1 && color == 'rouge') return;

    let prevSq = window.previousSquare[color];
    let prev = document.getElementById(prevSq);
    let prevNum = GameUtilModule.getNb('sq', prevSq);

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
            if (target.classList.contains(wallPrev) || jumpTarget.classList.contains(wallTarget)) continue;
            if (jumpTarget.getAttribute('data-pawn')) continue;

            // Highlight the jump target
            jumpTarget.classList.add('legal-move');
        } else {
            // Highlight the normal move target
            target.classList.add('legal-move');
        }
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
            
            // Vérifier si le mouvement est valide pour le joueur actuel
            if (isValidMove(window.tour, sqNum)) {
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
            }
        };
    }
}

// Vérifie si un mouvement est valide
export function isValidMove(color, targetSquareId) {
    const currentSqId = window.previousSquare[color];
    const currentSq = document.getElementById(currentSqId);
    const currentId = GameUtilModule.getNb('sq', currentSqId);
    const targetSq = document.getElementById(`sq${targetSquareId}`);
    
    // Vérifier les mouvements de base (adjacents)
    const isAdjacent = (
        // Gauche
        (targetSquareId === currentId - 1 && 
         !currentSq.classList.contains('wall-left') && 
         !targetSq.classList.contains('wall-right') && 
         currentId % 9 !== 1) ||
        // Droite
        (targetSquareId === currentId + 1 && 
         !currentSq.classList.contains('wall-right') && 
         !targetSq.classList.contains('wall-left') && 
         currentId % 9 !== 0) ||
        // Haut
        (targetSquareId === currentId - 9 && 
         !currentSq.classList.contains('wall-top') && 
         !targetSq.classList.contains('wall-bottom')) ||
        // Bas
        (targetSquareId === currentId + 9 && 
         !currentSq.classList.contains('wall-bottom') && 
         !targetSq.classList.contains('wall-top'))
    );
    
    // Vérifier si c'est un saut par-dessus un pion
    const isJump = canJumpOver(color, targetSquareId);
    
    return isAdjacent || isJump;
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
