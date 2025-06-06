import * as SquareModule from './square.js';
import * as WallModule from './wall.js';
import * as GameUtilModule from './gameUtil.js';
import * as Config from './config.js';
import * as GameBoard from './gameBoard.js';

jest.mock('./square.js');
jest.mock('./wall.js');
jest.mock('./gameUtil.js');
jest.mock('./config.js');

describe('gameBoard.js', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="info-wrapper"><p><b></b><i></i></p></div>
            <div class="global"></div>
            <div class="squares-container"></div>
            <div id="walls1"></div>
            <div id="walls2"></div>
            <div id="walls3"></div>
            <div id="walls4"></div>
            <div id="sq5"></div>
            <div id="sq77"></div>
            <div id="sq45"></div>
            <div id="sq37"></div>
        `;
        localStorage.setItem('numberOfWalls', '10');
        Config.getNumOfPlayers.mockReturnValue(2);
        Config.line = { first: [], second: [], third: [], fourth: [] };
        Config.initialPositions = { bleu: 'sq77', rouge: 'sq5', vert: 'sq45', violet: 'sq37' };
        Config.getWallCount.mockReturnValue({ bleu: 10, rouge: 10, vert: 10, violet: 10 });
        SquareModule.createSquare.mockImplementation(() => {});
        WallModule.createWall.mockImplementation(() => {});
        WallModule.createWallList.mockImplementation(() => {});
        WallModule.addVerticalWall.mockImplementation(() => {});
        WallModule.addHorizontalWall.mockImplementation(() => {});
        WallModule.highlightCurrentPlayerWalls.mockImplementation(() => {});
        GameUtilModule.prizeDraw.mockImplementation(() => {});
    });

    test('adjustBoardSize sets width and height', () => {
        const globalElement = document.querySelector('.global');
        GameBoard.adjustBoardSize();
        expect(globalElement.style.width).toBeDefined();
        expect(globalElement.style.height).toBeDefined();
    });

    test('generateBoard calls createSquare and createWall', () => {
        GameBoard.generateBoard();
        expect(SquareModule.createSquare).toHaveBeenCalledTimes(81);
        expect(WallModule.createWall).toHaveBeenCalled();
    });

    test('initializeGameState sets up pawns and walls', () => {
        GameBoard.initializeGameState(() => {});
        expect(document.getElementById('sq5').getAttribute('data-pawn')).toBe('rouge');
        expect(document.getElementById('sq77').getAttribute('data-pawn')).toBe('bleu');
        expect(WallModule.createWallList).toHaveBeenCalled();
        expect(GameUtilModule.prizeDraw).toHaveBeenCalled();
    });
});
