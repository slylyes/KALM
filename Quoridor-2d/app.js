// Point d'entrée principal du jeu

// Import des modules
import * as SquareModule from './src/square.js';
import * as WallModule from './src/wall.js';
import * as GameUtilModule from './src/gameUtil.js';
import * as AIModule from './src/ai.js';
import * as Config from './src/config.js';
import * as PlayerMovement from './src/playerMovement.js';
import * as GameBoard from './src/gameBoard.js';
import * as UIElements from './src/uiElements.js';
import * as GameLogic from './src/gameLogic.js';

// Fusionner tous les modules en un seul objet global pour faciliter l'accès
const QuoridorGame = {
    ...SquareModule,
    ...WallModule,
    ...GameUtilModule,
    ...AIModule
};

// Variables globales partagées entre les modules
window.numOfPlayers = Config.getNumOfPlayers();
window.tour = 'bleu';
window.line = Config.line;
window.previousSquare = {...Config.initialPositions};
window.wallCount = Config.getWallCount();

// Rendre les fonctions et variables du jeu disponibles globalement
Object.assign(window, {
    ...QuoridorGame,
    canJumpOver: PlayerMovement.canJumpOver
});

// Code d'initialisation du jeu - enveloppé dans une fonction auto-exécutée
(function initializeGame() {
    // Quand le DOM est chargé
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Quoridor Game initialized');
        
        // Initialiser le localStorage
        Config.initLocalStorage();

        // Ajuster la taille du plateau en fonction de la fenêtre
        GameBoard.adjustBoardSize();
        window.addEventListener('resize', GameBoard.adjustBoardSize);
        
        // Générer le plateau de jeu
        GameBoard.generateBoard();
        
        // Initialiser le jeu
        GameBoard.initializeGameState(PlayerMovement.showPossibleMoves);
        
        // Configurer les événements des cases
        PlayerMovement.setupSquareClickEvents(
            SquareModule.movePawn, 
            GameUtilModule.checkIfWon, 
            nextPlayer
        );
        
        // Initialiser l'IA si on est en mode 1 joueur
        AIModule.initializeAI();
    });
})();

// Fonction pour passer au joueur suivant
function nextPlayer() {
    GameLogic.nextPlayer(window.numOfPlayers);
    UIElements.updateTurnDisplay(window.tour);
    PlayerMovement.showPossibleMoves(window.tour, window.previousSquare);
}

// Function to show the game rules modal
function showGameRules() {
    const modal = document.getElementById('rules-modal');
    modal.style.display = 'flex';
    document.getElementById('rules-close').onclick = () => modal.style.display = 'none';
    document.getElementById('rules-ok').onclick = () => modal.style.display = 'none';
    window.onkeydown = (e) => { if (e.key === "Escape") modal.style.display = 'none'; };
}

// Expose the function globally
window.showGameRules = showGameRules;

// Exposer les fonctions essentielles globalement
window.showPossibleMoves = function(color) {
    PlayerMovement.showPossibleMoves(color, window.previousSquare);
};
window.clearMoveDots = PlayerMovement.clearMoveDots;
window.nextPlayer = nextPlayer;
window.showCannotMoveOnPawnMsg = UIElements.showCannotMoveOnPawnMsg;
window.switchNumOfPlayers = GameUtilModule.switchNumOfPlayers;

// Exporter tous les modules pour une utilisation dans d'autres fichiers
export { SquareModule, WallModule, GameUtilModule, AIModule, QuoridorGame };
