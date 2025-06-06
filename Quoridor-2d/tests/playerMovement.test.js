import * as GameUtilModule from './gameUtil.js';
import * as WallModule from './wall.js';
import * as PlayerMovement from './playerMovement.js';

jest.mock('./gameUtil.js');
jest.mock('./wall.js');

describe('playerMovement.js', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="sq5" class="square"></div>
            <div id="sq6" class="square"></div>
            <div id="sq14" class="square"></div>
            <div id="sq4" class="square"></div>
        `;
        window.previousSquare = { rouge: 'sq5', bleu: 'sq77' };
        window.numOfPlayers = 2;
        window.tour = 'rouge';
        WallModule.highlightCurrentPlayerWalls.mockImplementation(() => {});
        GameUtilModule.getNb.mockImplementation((prefix, id) => parseInt(id.replace(prefix, '')));
    });

    test('clearMoveDots removes .move-dot elements', () => {
        const dot = document.createElement('div');
        dot.className = 'move-dot';
        document.body.appendChild(dot);
        PlayerMovement.clearMoveDots();
        expect(document.querySelector('.move-dot')).toBeNull();
    });

    test('isValidMove returns true for legal-move', () => {
        const sq = document.getElementById('sq6');
        sq.classList.add('legal-move');
        expect(PlayerMovement.isValidMove('rouge', 6)).toBe(true);
    });

    test('isValidMove returns false for non-legal-move', () => {
        expect(PlayerMovement.isValidMove('rouge', 6)).toBe(false);
    });

    test('canJumpOver returns false for invalid jump', () => {
        expect(PlayerMovement.canJumpOver('rouge', 7)).toBe(false);
    });

    test('setupSquareClickEvents sets onclick', () => {
        const movePawn = jest.fn();
        const checkIfWon = jest.fn();
        const nextPlayer = jest.fn();
        PlayerMovement.setupSquareClickEvents(movePawn, checkIfWon, nextPlayer);
        const sq = document.getElementById('sq6');
        sq.classList.add('legal-move');
        sq.onclick();
        expect(movePawn).toHaveBeenCalled();
        expect(checkIfWon).toHaveBeenCalled();
        expect(nextPlayer).toHaveBeenCalled();
    });
});
