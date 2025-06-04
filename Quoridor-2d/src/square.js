export function createSquare(idCount){
    let square = document.createElement('div');
    square.classList.add('square');
    square.id = 'sq'+idCount;
    idCount++;
    document.querySelector(".squares-container").appendChild(square);
}

export function returnCurrentSquare(color){
    let element;
    for(let sq of document.querySelectorAll('.square')){
        if(sq.getAttribute('data-pawn') == color){
            element = sq;
            break;
        }
    }
    return element;
}

export function movePawn(color, target) {
    let element = document.querySelector(target);

    // Retire le pion de la case précédente
    if (color == 'rouge') {
        document.getElementById(previousSquare.rouge).removeAttribute('data-pawn');
        previousSquare.rouge = element.id;
    } else if (color == 'bleu') {
        document.getElementById(previousSquare.bleu).removeAttribute('data-pawn');
        previousSquare.bleu = element.id;
    } else if (color == 'vert') {
        document.getElementById(previousSquare.vert).removeAttribute('data-pawn');
        previousSquare.vert = element.id;
    } else if (color == 'violet') {
        document.getElementById(previousSquare.violet).removeAttribute('data-pawn');
        previousSquare.violet = element.id;
    }

    // Place le pion sur la nouvelle case
    element.setAttribute('data-pawn', color);

    // Clear legal move highlights
    document.querySelectorAll('.square').forEach(sq => sq.classList.remove('legal-move'));
}

