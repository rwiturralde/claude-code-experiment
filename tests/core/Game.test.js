/**
 * Unit tests for Game class background color feature
 */

import { Game } from '../../src/js/core/Game.js';
import { GAME_CONFIG } from '../../src/js/config/gameConfig.js';

describe('Game', () => {
    let mockCanvas;

    beforeEach(() => {
        // Set up a mock canvas in the DOM
        mockCanvas = document.createElement('canvas');
        mockCanvas.id = 'gameCanvas';
        mockCanvas.width = 800;
        mockCanvas.height = 600;
        document.body.appendChild(mockCanvas);

        // Mock requestAnimationFrame to prevent game loop from running
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    });

    afterEach(() => {
        if (mockCanvas && mockCanvas.parentNode) {
            mockCanvas.parentNode.removeChild(mockCanvas);
        }
        jest.restoreAllMocks();
    });

    describe('Background Color', () => {
        test('should use default background color when no options provided', () => {
            const game = new Game('gameCanvas');
            expect(game.backgroundColor).toBe(GAME_CONFIG.GRAPHICS.BACKGROUND_COLOR);
        });

        test('should use default background color when empty options provided', () => {
            const game = new Game('gameCanvas', {});
            expect(game.backgroundColor).toBe(GAME_CONFIG.GRAPHICS.BACKGROUND_COLOR);
        });

        test('should use custom background color when provided in options', () => {
            const game = new Game('gameCanvas', { backgroundColor: '#ff0000' });
            expect(game.backgroundColor).toBe('#ff0000');
        });

        test('should use custom background color for rendering', () => {
            const game = new Game('gameCanvas', { backgroundColor: '#003366' });
            const ctx = game.ctx;

            // Trigger a render
            game._render();

            // The fillStyle should have been set to the custom color
            expect(ctx.fillStyle).toBe('#003366');
        });

        test('should use default background color for rendering when none specified', () => {
            const game = new Game('gameCanvas');

            game._render();

            // Canvas normalizes shorthand colors (e.g. #000 -> #000000)
            expect(game.backgroundColor).toBe(GAME_CONFIG.GRAPHICS.BACKGROUND_COLOR);
        });
    });
});
