// Configuration et variables globales du jeu

// Initialiser localStorage avec des valeurs par défaut
export function initLocalStorage() {
    if(localStorage.getItem('numberOfPlayers') === null) {
        localStorage.setItem('numberOfPlayers', '2');
    }
    if(localStorage.getItem('numberOfWalls') === null) {
        localStorage.setItem('numberOfWalls', '10');
    }
}

// Nombre de joueurs par défaut
export const getNumOfPlayers = () => parseInt(localStorage.getItem('numberOfPlayers')) || 2;

// Lignes et colonnes pour les conditions de victoire
export const line = {
    first: [1,2,3,4,5,6,7,8,9],
    second: [73,74,75,76,77,78,79,80,81],
    third: [1,10,19,28,37,46,55,64,73],
    fourth: [9,18,27,36,45,54,63,72,81]
};

// Positions initiales des pions
export const initialPositions = {
    rouge: 'sq5',
    bleu: 'sq77',
    vert: 'sq45',
    violet: 'sq37'
};

// Nombre de murs par joueur
export function getWallCount() {
    const initialCount = parseInt(localStorage.getItem('numberOfWalls')) || 10;
    return {
        rouge: initialCount,
        bleu: initialCount,
        vert: initialCount,
        violet: initialCount
    };
}

// Exporter des valeurs par défaut pour faciliter l'initialisation
export default {
    initLocalStorage,
    getNumOfPlayers,
    line,
    initialPositions,
    getWallCount
};
