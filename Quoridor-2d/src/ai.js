// Import des fonctions nécessaires depuis les autres modules
import { returnCurrentSquare } from './square.js';
import { getWallsAbove } from './wall.js';
import { getNb, randomInt } from './gameUtil.js';

// Module d'intelligence artificielle pour le mode 1 joueur

// Initialisation de l'IA si le mode 1 joueur est activé
export function initializeAI() {
    // Utiliser la variable numOfPlayers globale
    if(typeof window.numOfPlayers === 'undefined') {
        console.warn('numOfPlayers is not defined, using default value of 2');
    }
    
    if((typeof window.numOfPlayers !== 'undefined' ? window.numOfPlayers : 2) == 1) {
        console.log('Initializing AI for 1 player mode');
        
        let doNotGo = {
            left: false,
            right: false,
            top: false,
            bottom: false
        }
    
        // Réinitialiser les directions bloquées périodiquement
        setInterval(() => {
            doNotGo = {
                left: false,
                right: false,
                top: false,
                bottom: false
            }
        }, 7000);
    
        // Logique de l'IA pour jouer automatiquement
        setInterval(() => {
            if(window.tour == 'rouge') {
                let currentSquare = returnCurrentSquare('rouge');
                let ennemySquare = returnCurrentSquare('bleu');
                let ennemyId = ennemySquare.id;
    
                let wallsAbove = getWallsAbove(ennemyId);
    
                console.log(wallsAbove);
    
                let nextSquare = {
                    top: document.querySelector(`#sq${Number(getNb('sq',currentSquare.id)-9)}`),
                    bottom: document.querySelector(`#sq${Number(getNb('sq',currentSquare.id)+9)}`),
                    left: document.querySelector(`#sq${Number(getNb('sq',currentSquare.id)-1)}`),
                    right: document.querySelector(`#sq${Number(getNb('sq',currentSquare.id)+1)}`)
                }
    
                let forwardOrWall = randomInt(0,1);
    
                if(forwardOrWall == 0) {
                    if(!currentSquare.classList.contains('wall-bottom') && !doNotGo.bottom) {
                        window.click(nextSquare.bottom);
                    } else {
                        if(!currentSquare.classList.contains('wall-right') && !doNotGo.right) {
                            window.click(nextSquare.right);
                            doNotGo.bottom = true;
                        } else {
                            if(!nextSquare.left.classList.contains('wall-right') && !doNotGo.left) {
                                window.click(nextSquare.left);
                                doNotGo.right = true;
                            } else if(!nextSquare.top.classList.contains('wall-bottom') && !doNotGo.top) {
                                window.click(nextSquare.top);
                                doNotGo.left = true;
                            }
                        }
                    }
                } else if(forwardOrWall == 1) {
                    let whichWall = randomInt(0, wallsAbove.length);
                    let middleWall = 2;
    
                    let wallTable = [whichWall, middleWall];
    
                    window.click(wallsAbove[wallTable[randomInt(0,1)]]);
                }
            }
        }, 1000);
    }
}

// Autres fonctions d'IA potentielles
export function getBestMove(color) {
    // Implémentation future d'un algorithme plus avancé
    return null;
}
