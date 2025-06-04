// Logique de jeu principale

// Passe au joueur suivant
export function nextPlayer(numOfPlayers) {
    if(window.tour == 'bleu'){
        window.tour = 'rouge';
    } else if(window.tour == 'rouge'){
        if(numOfPlayers == 3 || numOfPlayers == 4){
            window.tour = 'vert';
        } else {
            window.tour = 'bleu';
        }
    } else if(window.tour == 'vert'){
        if(numOfPlayers == 4){
            window.tour = 'violet';
        } else {
            window.tour = 'bleu';
        }
    } else if(window.tour == 'violet'){
        window.tour = 'bleu';
    }
    
    return window.tour;
}

export default {
    nextPlayer
};
