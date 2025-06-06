import * as WallModule from './wall.js';
import * as GameUtilModule from './gameUtil.js';

jest.mock('./gameUtil.js');

describe('wall.js', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="squares-container"></div>
            <div id="walls1"></div>
            <div id="walls2"></div>
            <div id="walls3"></div>
            <div id="walls4"></div>
            <div id="sq1"></div>
            <div id="sq2"></div>
        `;
        window.wallCount = { bleu: 10, rouge: 10, vert: 10, violet: 10 };
        window.tour = 'bleu';
        window.numOfPlayers = 2;
        window.line = { first: [], second: [], third: [], fourth: [] };
        GameUtilModule.getNb.mockImplementation((prefix, id) => parseInt(id.replace(prefix, '')));
        GameUtilModule.nextPlayer.mockImplementation(() => {});
        GameUtilModule.showBlockingWallMessage.mockImplementation(() => {});
    });

    test('createWall creates a vertical wall', () => {
        WallModule.createWall(1, '10%', 'vertical', 3);
        const wall = document.querySelector('.vertical-wall');
        expect(wall).not.toBeNull();
        expect(wall.classList.contains('vertical-wall')).toBe(true);
    });

    test('createWallList creates a wall in the correct container', () => {
        WallModule.createWallList('walls1', false);
        expect(document.querySelector('#walls1').children.length).toBeGreaterThan(0);
    });

    test('removeWallFromWallList removes a wall', () => {
        const container = document.getElementById('walls1');
        const wall = document.createElement('div');
        container.appendChild(wall);
        WallModule.removeWallFromWallList('rouge');
        expect(window.wallCount.rouge).toBe(9);
    });

    test('verticalWall adds classes and disables onclick', () => {
        const vWl = document.createElement('div');
        vWl.id = 'wl1';
        document.body.appendChild(vWl);
        document.getElementById('sq1').classList = { add: jest.fn() };
        document.getElementById('sq2').classList = { add: jest.fn() };
        const result = WallModule.verticalWall(vWl, 1, 2, 'bleu');
        expect(vWl.classList.contains('stay-visible')).toBe(true);
        expect(result).toBe(true);
    });

    test('highlightCurrentPlayerWalls highlights correct wall list', () => {
        const container = document.getElementById('walls2');
        container.classList.add('walls-container');
        WallModule.highlightCurrentPlayerWalls('bleu');
        expect(container.classList.contains('active-walls')).toBe(true);
    });
});
