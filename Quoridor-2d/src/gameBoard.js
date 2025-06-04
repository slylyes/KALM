// Génération et gestion du plateau de jeu

import * as SquareModule from './square.js';
import * as WallModule from './wall.js';
import * as GameUtilModule from './gameUtil.js';
import * as Config from './config.js';

// Ajuste la taille du plateau en fonction de la fenêtre
export function adjustBoardSize() {
    if(window.innerWidth < window.innerHeight){
        document.querySelector('.global').style.width = 65+'vw';
        document.querySelector('.global').style.height = 65+'vw';
    } else {
        document.querySelector('.global').style.width = 65+'vh';
        document.querySelector('.global').style.height = 65+'vh';
    }
}

// Génère le plateau de jeu
export function generateBoard() {
    /*⬇ Génération des carrés ⬇*/
    for (let i = 0; i < 81; i++){
        SquareModule.createSquare(i+1);
    }

    /*⬇ Génération des murs verticaux ⬇*/
    for (let j = 1; j < 9; j++){
        WallModule.createWall(1,1.11+'%','vertical',j);
        for (let i = 1; i < 8; i++){
            WallModule.createWall(i+1,i*10*1.11+'%','vertical',j);
        }
    }

    /*⬇ Génération des murs horizontaux ⬇*/
    for (let j = 1; j < 9; j++){
        WallModule.createWall(1,1.11+'%','horizontal',j);
        for (let i = 1; i < 8; i++){
            WallModule.createWall(i+1,i*10*1.11+'%','horizontal',j);
        }
    }
}

// Initialise l'état du jeu
export function initializeGameState(showPossibleMoves) {
    const numOfPlayers = window.numOfPlayers;
    
    // Mettre les pions à leur place initiale
    document.getElementById('sq5').setAttribute('data-pawn', 'rouge');
    document.getElementById('sq77').setAttribute('data-pawn', 'bleu');
    document.getElementById('sq45').setAttribute('data-pawn', 'vert');
    document.getElementById('sq37').setAttribute('data-pawn', 'violet');

    // Masquer les pions inutiles selon le nombre de joueurs
    if (numOfPlayers == 1 || numOfPlayers == 2) {
        document.getElementById('sq45').removeAttribute('data-pawn');
        document.getElementById('sq37').removeAttribute('data-pawn');
    } else if (numOfPlayers == 3) {
        document.getElementById('sq37').removeAttribute('data-pawn');
    }

    // Afficher info sur le nombre de joueurs
    if (numOfPlayers == 1){
        document.querySelector('.info-wrapper>p>i').innerText = `${numOfPlayers} joueur`;
    } else {
        document.querySelector('.info-wrapper>p>i').innerText = `${numOfPlayers} joueurs`;
    }

    // Visibilité des murs selon le nombre de joueurs
    if(numOfPlayers == 1 || numOfPlayers == 2){
        document.querySelector('#walls3').style.visibility = 'hidden';
        document.querySelector('#walls4').style.visibility = 'hidden';
        document.querySelector('#sq45').style.visibility = 'visible'; // afficher la case verte vide
        document.querySelector('#sq37').style.visibility = 'visible'; // afficher la case violette vide
    } else if(numOfPlayers == 3){
        document.querySelector('#walls3').style.visibility = 'visible';
        document.querySelector('#walls4').style.visibility = 'hidden';
        document.querySelector('#sq45').style.visibility = 'visible';
        document.querySelector('#sq37').style.visibility = 'visible';
    } else if(numOfPlayers == 4){
        document.querySelector('#walls3').style.visibility = 'visible';
        document.querySelector('#walls4').style.visibility = 'visible';
        document.querySelector('#sq45').style.visibility = 'visible';
        document.querySelector('#sq37').style.visibility = 'visible';
    }

    // Créer les murs dans l'UI
    const initialWallCount = parseInt(localStorage.getItem('numberOfWalls')) || 10;
    for (let i = 0; i < initialWallCount; i++){
        WallModule.createWallList('walls1');
    }
    for (let i = 0; i < initialWallCount; i++){
        WallModule.createWallList('walls2');
    }
    for (let i = 0; i < initialWallCount; i++){
        WallModule.createWallList('walls3', true);
    }
    for (let i = 0; i < initialWallCount; i++){
        WallModule.createWallList('walls4', true);
    }

    // Ajouter les événements aux murs
    for(let vWl of document.querySelectorAll('.vertical-wall')){
        vWl.onclick = () => {
            WallModule.addVerticalWall(vWl);
            showPossibleMoves(window.tour);
        };
    }
    for(let hWl of document.querySelectorAll('.horizontal-wall')){
        hWl.onclick = () => {
            WallModule.addHorizontalWall(hWl);
            showPossibleMoves(window.tour);
        };
    }

    // Déterminer le premier joueur
    GameUtilModule.prizeDraw();
    showPossibleMoves(window.tour); // Affiche les cercles au début
    document.querySelector('.info-wrapper>p>b').innerText = `Au tour du pion ${window.tour} de jouer`;
}

export default {
    adjustBoardSize,
    generateBoard,
    initializeGameState
};
