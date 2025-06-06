import { getNb, nextPlayer, showBlockingWallMessage } from './gameUtil.js';

export function createWall(idCount, topLeft, side, rowColumn) {
    let wall = document.createElement('div');
    if(side == 'vertical'){
        wall.classList.add('vertical-wall');
        wall.classList.add(`column-${rowColumn}`);
        wall.style.top = topLeft;
    } else if (side == 'horizontal'){
        wall.classList.add('horizontal-wall');
        wall.classList.add(`row-${rowColumn}`);
        wall.style.left = topLeft;
    }
    wall.id = 'wl'+idCount;
    document.querySelector(".squares-container").appendChild(wall);
}

export function createWallList(targetId, horizon) {
    let wall = document.createElement('div');
    horizon ? wall.classList.add('walls-list-horizon') : wall.classList.add('walls-list-item');
    
    // Add color class based on the wall list container
    let color = '';
    if (targetId === 'walls1') {
        color = 'rouge';
        wall.classList.add('wall-rouge');
    } else if (targetId === 'walls2') {
        color = 'bleu';
        wall.classList.add('wall-bleu');
    } else if (targetId === 'walls3') {
        color = 'vert';
        wall.classList.add('wall-vert');
    } else if (targetId === 'walls4') {
        color = 'violet';
        wall.classList.add('wall-violet');
    }
    
    document.querySelector(`#${targetId}`).appendChild(wall);
}

export function removeWallFromWallList(color){
    let wallsId;
    
    if(color == 'rouge'){
        wallsId = '#walls1';
    } else if(color == 'bleu'){
        wallsId = '#walls2';
    } else if(color == 'vert'){
        wallsId = '#walls3';
    } else if(color == 'violet'){
        wallsId = '#walls4';
    } else {
        console.log('You enterouge the wrong color. You enterouge : '+color);
    }

    wallCount[color]--;
    document.querySelector(wallsId).removeChild(document.querySelector(wallsId).lastChild);
}

export function addVerticalWall(vWl){
    let wall_id = getNb("wl", vWl.id);
    let wall_column = getNb("column-", vWl.classList[1]);

    let first_square = wall_column+Number(9*(wall_id-1));
    let second_square = first_square+Number(9);

    /*⬇ On empêche de placer un mur chavauchant un mur existant par le haut ou par le bas ⬇*/
    if((document.querySelector(`#wl${wall_id-1}.vertical-wall.column-${wall_column}`) == null // Pour le mur n°1 de la colonne
    || !document.querySelector(`#wl${wall_id-1}.vertical-wall.column-${wall_column}`).classList.contains('stay-visible'))
    && (document.querySelector(`#wl${wall_id+1}.vertical-wall.column-${wall_column}`) == null // Pour le dernier mur de la colonne
    || !document.querySelector(`#wl${wall_id+1}.vertical-wall.column-${wall_column}`).classList.contains('stay-visible'))){

        /*⬇ On empêche le croisement de murs verticaux et horieontaux ⬇*/            
        if(!document.querySelector(`#wl${wall_column}.horizontal-wall.row-${wall_id}`).classList.contains('stay-visible')){
            
            // Simuler le placement du mur pour voir s'il bloque un joueur
            if(!canPlaceVerticalWall(first_square, second_square)) {
                showBlockingWallMessage();
                return;
            }

            if(tour == 'bleu' && wallCount.bleu > 0){
                verticalWall(vWl, first_square, second_square, 'bleu');
                removeWallFromWallList('bleu');
                nextPlayer();
            } else if(tour == 'rouge' && wallCount.rouge > 0){
                verticalWall(vWl, first_square, second_square, 'rouge');
                removeWallFromWallList('rouge');
                nextPlayer();
            } else if(tour == 'vert' && wallCount.vert > 0){
                verticalWall(vWl, first_square, second_square, 'vert');
                removeWallFromWallList('vert');
                nextPlayer();
            } else if(tour == 'violet' && wallCount.violet > 0){
                verticalWall(vWl, first_square, second_square, 'violet');
                removeWallFromWallList('violet');
                nextPlayer();
            }
        }
    }
}

export function addHorizontalWall(hWl){
    let wall_id = getNb("wl", hWl.id);
    let wall_row = getNb("row-", hWl.classList[1]);

    let first_square = wall_id+Number(9*(wall_row-1));
    let second_square = first_square+Number(1);

    /*⬇ On empêche de placer un mur chavauchant un mur existant par la droite ou par la gauche ⬇*/
    if((document.querySelector(`#wl${wall_id-1}.horizontal-wall.row-${wall_row}`) == null // Pour le mur n°1 de la ligne
    || !document.querySelector(`#wl${wall_id-1}.horizontal-wall.row-${wall_row}`).classList.contains('stay-visible'))
    && (document.querySelector(`#wl${wall_id+1}.horizontal-wall.row-${wall_row}`) == null // Pour le dernier mur de la ligne
    || !document.querySelector(`#wl${wall_id+1}.horizontal-wall.row-${wall_row}`).classList.contains('stay-visible'))){

        /*⬇ On empêche le croisement de murs verticaux et horizontaux ⬇*/
        if(!document.querySelector(`#wl${wall_row}.vertical-wall.column-${wall_id}`).classList.contains('stay-visible')){
            
            // Simuler le placement du mur pour voir s'il bloque un joueur
            if(!canPlaceHorizontalWall(first_square, second_square)) {
                showBlockingWallMessage();
                return;
            }

            if(tour == 'bleu' && wallCount.bleu > 0){
                horizontalWall(hWl, first_square, second_square, 'bleu');
                removeWallFromWallList('bleu');
                nextPlayer();
            } else if(tour == 'rouge' && wallCount.rouge > 0){
                horizontalWall(hWl, first_square, second_square, 'rouge');
                removeWallFromWallList('rouge');
                nextPlayer();
            } else if(tour == 'vert' && wallCount.vert > 0){
                horizontalWall(hWl, first_square, second_square, 'vert');
                removeWallFromWallList('vert');
                nextPlayer();
            } else if(tour == 'violet' && wallCount.violet > 0){
                horizontalWall(hWl, first_square, second_square, 'violet');
                removeWallFromWallList('violet');
                nextPlayer();
            }
        }
    }
}

export function verticalWall(vWl, first_square, second_square, color) {
    document.querySelector(`#sq${first_square}`).classList.add('wall-right');
    document.querySelector(`#sq${second_square}`).classList.add('wall-right');
    vWl.classList.add('stay-visible');
    vWl.classList.add(`wall-${color}`); // Add color class to the wall
    vWl.onclick = null;
    return true;
}

export function horizontalWall(hWl, first_square, second_square, color) {
    document.querySelector(`#sq${first_square}`).classList.add('wall-bottom');
    document.querySelector(`#sq${second_square}`).classList.add('wall-bottom');
    hWl.classList.add('stay-visible');
    hWl.classList.add(`wall-${color}`); // Add color class to the wall
    hWl.onclick = null;
    return true;
}

// Highlight the current player's walls
export function highlightCurrentPlayerWalls(color) {
    // Remove highlight from all wall lists
    document.querySelectorAll('.walls-container, .walls-horizon-container').forEach(container => {
        container.classList.remove('active-walls');
    });
    
    // Add highlight to the current player's wall list
    let wallsId = '';
    if (color === 'rouge') wallsId = '#walls1';
    else if (color === 'bleu') wallsId = '#walls2';
    else if (color === 'vert') wallsId = '#walls3';
    else if (color === 'violet') wallsId = '#walls4';
    
    if (wallsId) {
        document.querySelector(wallsId).classList.add('active-walls');
    }
}

export function canPlaceVerticalWall(first_square, second_square) {
    // Récupérer l'état actuel des cases
    let firstSq = document.querySelector(`#sq${first_square}`);
    let secondSq = document.querySelector(`#sq${second_square}`);
    
    // Vérifier si le mur est déjà là (au cas où)
    if (firstSq.classList.contains('wall-right') || secondSq.classList.contains('wall-right')) {
        return false;
    }
    
    // Ajouter temporairement le mur
    firstSq.classList.add('temp-wall-right');
    secondSq.classList.add('temp-wall-right');
    
    // Vérifier si les joueurs peuvent toujours atteindre leur but
    let canPlace = checkAllPlayersHavePathWithTempWalls();
    
    // Retirer le mur temporaire
    firstSq.classList.remove('temp-wall-right');
    secondSq.classList.remove('temp-wall-right');
    
    return canPlace;
}

export function canPlaceHorizontalWall(first_square, second_square) {
    // Récupérer l'état actuel des cases
    let firstSq = document.querySelector(`#sq${first_square}`);
    let secondSq = document.querySelector(`#sq${second_square}`);
    
    // Vérifier si le mur est déjà là (au cas où)
    if (firstSq.classList.contains('wall-bottom') || secondSq.classList.contains('wall-bottom')) {
        return false;
    }
    
    // Ajouter temporairement le mur
    firstSq.classList.add('temp-wall-bottom');
    secondSq.classList.add('temp-wall-bottom');
    
    // Vérifier si les joueurs peuvent toujours atteindre leur but
    let canPlace = checkAllPlayersHavePathWithTempWalls();
    
    // Retirer le mur temporaire
    firstSq.classList.remove('temp-wall-bottom');
    secondSq.classList.remove('temp-wall-bottom');
    
    return canPlace;
}

export function checkAllPlayersHavePathWithTempWalls() {
    // Vérifier que chaque joueur actif a un chemin vers sa ligne d'arrivée
    if (!checkPathExistsWithTempWalls('bleu')) return false;
    if (!checkPathExistsWithTempWalls('rouge')) return false;
    
    // Vérifier les joueurs 3 et 4 uniquement s'ils sont en jeu
    if (numOfPlayers >= 3 && !checkPathExistsWithTempWalls('vert')) return false;
    if (numOfPlayers == 4 && !checkPathExistsWithTempWalls('violet')) return false;
    
    return true;
}

export function checkPathExistsWithTempWalls(color) {
    let start = returnCurrentSquare(color);
    if (!start) return true; // Si le pion n'est pas sur le plateau, pas besoin de vérifier
    
    let startId = getNb('sq', start.id);
    let targetLine;
    
    // Déterminer la ligne d'arrivée selon la couleur
    if (color === 'bleu') targetLine = line.first;
    else if (color === 'rouge') targetLine = line.second;
    else if (color === 'vert') targetLine = line.third;
    else if (color === 'violet') targetLine = line.fourth;
    
    // Utiliser un algorithme BFS pour trouver un chemin
    let queue = [startId];
    let visited = new Set([startId]);
    
    while (queue.length > 0) {
        let currentId = queue.shift();
        
        // Si on atteint une case de la ligne d'arrivée, un chemin existe
        if (targetLine.includes(currentId)) return true;
        
        // Vérifier les cases adjacentes
        let currentSquare = document.getElementById(`sq${currentId}`);
        let moves = getPossibleMovesWithTempWalls(currentId, currentSquare);
        
        for (let nextId of moves) {
            if (!visited.has(nextId)) {
                visited.add(nextId);
                queue.push(nextId);
            }
        }
    }
    
    // Si on arrive ici, aucun chemin n'a été trouvé
    return false;
}

export function getPossibleMovesWithTempWalls(squareId, squareElement) {
    let moves = [];
    let row = Math.ceil(squareId / 9);
    let col = ((squareId - 1) % 9) + 1;
    
    // Vérifier la case à gauche
    if (col > 1) {
        if (!squareElement.classList.contains('wall-left') && 
            !squareElement.classList.contains('temp-wall-left')) {
            // Cas normal - pas de mur à gauche
            let leftId = squareId - 1;
            let leftSquare = document.getElementById(`sq${leftId}`);
            if (!leftSquare.classList.contains('wall-right') && 
                !leftSquare.classList.contains('temp-wall-right')) {
                moves.push(leftId);
            }
        }
    }
    
    // Vérifier la case à droite
    if (col < 9) {
        if (!squareElement.classList.contains('wall-right') && 
            !squareElement.classList.contains('temp-wall-right')) {
            // Cas normal - pas de mur à droite
            let rightId = squareId + 1;
            let rightSquare = document.getElementById(`sq${rightId}`);
            if (!rightSquare.classList.contains('wall-left') && 
                !rightSquare.classList.contains('temp-wall-left')) {
                moves.push(rightId);
            }
        }
    }
    
    // Vérifier la case en haut
    if (row > 1) {
        if (!squareElement.classList.contains('wall-top') && 
            !squareElement.classList.contains('temp-wall-top')) {
            // Cas normal - pas de mur en haut
            let topId = squareId - 9;
            let topSquare = document.getElementById(`sq${topId}`);
            if (!topSquare.classList.contains('wall-bottom') && 
                !topSquare.classList.contains('temp-wall-bottom')) {
                moves.push(topId);
            }
        }
    }
    
    // Vérifier la case en bas
    if (row < 9) {
        if (!squareElement.classList.contains('wall-bottom') && 
            !squareElement.classList.contains('temp-wall-bottom')) {
            // Cas normal - pas de mur en bas
            let bottomId = squareId + 9;
            let bottomSquare = document.getElementById(`sq${bottomId}`);
            if (!bottomSquare.classList.contains('wall-top') && 
                !bottomSquare.classList.contains('temp-wall-top')) {
                moves.push(bottomId);
            }
        }
    }
    
    return moves;
}

export function getWallsAbove(id){
    let number = getNb('sq',id);
    let firstDigit = Number(number.toString().charAt(0));
    let rowIndex = Number(firstDigit+1);

    let theWallsAbove = [document.querySelector(`div#wl3.horizontal-wall.row-${rowIndex}`),document.querySelector(`div#wl5.horizontal-wall.row-${rowIndex}`),document.querySelector(`div#wl7.horizontal-wall.row-${rowIndex}`)];

    return theWallsAbove;
}