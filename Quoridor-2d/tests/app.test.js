import * as SquareModule from './src/square.js';
import * as WallModule from './src/wall.js';
import * as GameUtilModule from './src/gameUtil.js';
import * as AIModule from './src/ai.js';
import * as Config from './src/config.js';
import * as PlayerMovement from './src/playerMovement.js';
import * as GameBoard from './src/gameBoard.js';
import * as UIElements from './src/uiElements.js';
import * as GameLogic from './src/gameLogic.js';

jest.mock('./src/square.js');
jest.mock('./src/wall.js');
jest.mock('./src/gameUtil.js');
jest.mock('./src/ai.js');
jest.mock('./src/config.js');
jest.mock('./src/playerMovement.js');
jest.mock('./src/gameBoard.js');
jest.mock('./src/uiElements.js');
jest.mock('./src/gameLogic.js');

describe('App Entry Point', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="info-wrapper"><p><b></b><i></i></p></div>
            <div class="global"></div>
            <div class="squares-container"></div>
            <div id="walls1"></div>
            <div id="walls2"></div>
            <div id="walls3"></div>
            <div id="walls4"></div>
            <div id="rules-modal" style="display:none;"></div>
            <button id="rules-close"></button>
            <button id="rules-ok"></button>
        `;
        Config.getNumOfPlayers.mockReturnValue(2);
        Config.line = { first: [], second: [], third: [], fourth: [] };
        Config.initialPositions = { bleu: 'sq77', rouge: 'sq5', vert: 'sq45', violet: 'sq37' };
        Config.getWallCount.mockReturnValue({ bleu: 10, rouge: 10, vert: 10, violet: 10 });
        Config.initLocalStorage.mockImplementation(() => {});
        GameBoard.adjustBoardSize.mockImplementation(() => {});
        GameBoard.generateBoard.mockImplementation(() => {});
        GameBoard.initializeGameState.mockImplementation(() => {});
        PlayerMovement.setupSquareClickEvents.mockImplementation(() => {});
        AIModule.initializeAI.mockImplementation(() => {});
        WallModule.highlightCurrentPlayerWalls.mockImplementation(() => {});
        UIElements.updateTurnDisplay.mockImplementation(() => {});
        GameLogic.nextPlayer.mockImplementation(() => {});
    });

    test('should expose global functions and variables', () => {
        require('./app.js');
        expect(window.numOfPlayers).toBe(2);
        expect(window.tour).toBe('bleu');
        expect(window.previousSquare.bleu).toBe('sq77');
        expect(window.wallCount.bleu).toBe(10);
        expect(typeof window.showGameRules).toBe('function');
        expect(typeof window.nextPlayer).toBe('function');
        expect(typeof window.showPossibleMoves).toBe('function');
        expect(typeof window.clearMoveDots).toBe('function');
        expect(typeof window.showCannotMoveOnPawnMsg).toBe('function');
        expect(typeof window.switchNumOfPlayers).toBe('function');
    });

    test('should show and hide rules modal', () => {
        require('./app.js');
        const modal = document.getElementById('rules-modal');
        window.showGameRules();
        expect(modal.style.display).toBe('flex');
        document.getElementById('rules-close').onclick();
        expect(modal.style.display).toBe('none');
        document.getElementById('rules-ok').onclick();
        expect(modal.style.display).toBe('none');
    });
});
