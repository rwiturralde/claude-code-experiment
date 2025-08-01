/**
 * Main entry point for the Asteroids game
 * Initializes and starts the game
 */

import { Game } from './core/Game.js';
import { logger, LogLevel } from './utils/logger.js';

/**
 * Initialize the game when the DOM is loaded
 */
function initializeGame() {
    try {
        logger.info('Initializing Asteroids game');
        
        // Set log level based on environment (you could make this configurable)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            logger.setLevel(LogLevel.DEBUG);
        }
        
        // Create and start the game
        const game = new Game('gameCanvas');
        
        // Make game accessible globally for debugging
        if (typeof window !== 'undefined') {
            window.game = game;
            window.logger = logger;
        }
        
        logger.info('Game initialization complete');
        
    } catch (error) {
        logger.error('Failed to initialize game', error);
        
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff0000;
            color: #fff;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
            font-family: monospace;
            z-index: 1000;
        `;
        errorMessage.innerHTML = `
            <h3>Game Failed to Load</h3>
            <p>An error occurred while initializing the game.</p>
            <p>Please check the console for more details.</p>
        `;
        document.body.appendChild(errorMessage);
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}