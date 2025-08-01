/**
 * Main Game class for the Asteroids game
 * Manages game state, entities, and the main game loop
 */

import { Ship } from '../entities/Ship.js';
import { Bullet } from '../entities/Bullet.js';
import { Asteroid } from '../entities/Asteroid.js';
import { InputHandler } from './InputHandler.js';
import { CollisionDetector } from './CollisionDetector.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { logger } from '../utils/logger.js';

export class Game {
    /**
     * Creates a new Game instance
     * @param {string} canvasId - The ID of the canvas element
     * @throws {Error} If canvas element is not found or invalid
     */
    constructor(canvasId = 'gameCanvas') {
        try {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                throw new Error(`Canvas element with ID '${canvasId}' not found`);
            }

            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Failed to get 2D rendering context');
            }

            this.width = this.canvas.width || GAME_CONFIG.CANVAS_WIDTH;
            this.height = this.canvas.height || GAME_CONFIG.CANVAS_HEIGHT;
            
            this._initializeGame();
            this._setupInputHandling();
            
            logger.info('Game initialized successfully', { 
                width: this.width, 
                height: this.height 
            });
            
            this.start();
        } catch (error) {
            logger.error('Failed to initialize game', error);
            throw error;
        }
    }

    /**
     * Initialize game state and entities
     * @private
     */
    _initializeGame() {
        this.score = 0;
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.gameRunning = true;
        this.gameStarted = false;
        
        this.ship = new Ship(this.width / 2, this.height / 2);
        this.bullets = [];
        this.asteroids = [];
        
        this._initializeAsteroids();
        this._updateUI();
    }

    /**
     * Setup input handling
     * @private
     */
    _setupInputHandling() {
        try {
            this.inputHandler = new InputHandler();
            
            this.inputHandler.onShoot(() => {
                if (this.gameRunning) {
                    this._shoot();
                }
            });
            
            this.inputHandler.onRestart(() => {
                this.restart();
            });
        } catch (error) {
            logger.error('Failed to setup input handling', error);
        }
    }

    /**
     * Initialize asteroids at safe distances from the ship
     * @private
     */
    _initializeAsteroids() {
        try {
            const safeDistance = GAME_CONFIG.SHIP.RESPAWN_SAFETY_DISTANCE;
            
            for (let i = 0; i < GAME_CONFIG.INITIAL_ASTEROID_COUNT; i++) {
                const asteroid = Asteroid.createAtSafeDistance(
                    this.width,
                    this.height,
                    this.ship.x,
                    this.ship.y,
                    safeDistance,
                    'large'
                );
                this.asteroids.push(asteroid);
            }
            
            logger.debug('Asteroids initialized', { count: this.asteroids.length });
        } catch (error) {
            logger.error('Failed to initialize asteroids', error);
        }
    }

    /**
     * Fire a bullet from the ship
     * @private
     */
    _shoot() {
        try {
            const bullet = Bullet.createFromShip(this.ship);
            this.bullets.push(bullet);
            logger.debug('Bullet fired', { bulletCount: this.bullets.length });
        } catch (error) {
            logger.error('Failed to shoot bullet', error);
        }
    }

    /**
     * Update game state
     * @private
     */
    _update() {
        if (!this.gameRunning) return;

        try {
            this._updateShip();
            this._updateBullets();
            this._updateAsteroids();
            this._checkCollisions();
            this._checkGameConditions();
        } catch (error) {
            logger.error('Failed to update game state', error);
        }
    }

    /**
     * Update ship based on input
     * @private
     */
    _updateShip() {
        try {
            if (this.inputHandler.isLeftPressed()) {
                this.ship.rotate(-GAME_CONFIG.SHIP.ROTATION_SPEED);
            }
            if (this.inputHandler.isRightPressed()) {
                this.ship.rotate(GAME_CONFIG.SHIP.ROTATION_SPEED);
            }
            if (this.inputHandler.isUpPressed()) {
                this.ship.thrust(1);
            }
            if (this.inputHandler.isDownPressed()) {
                this.ship.thrust(-1);
            }
            
            this.ship.update();
            CollisionDetector.wrapToScreen(this.ship, this.width, this.height);
        } catch (error) {
            logger.error('Failed to update ship', error);
        }
    }

    /**
     * Update all bullets
     * @private
     */
    _updateBullets() {
        try {
            // Update bullets and remove dead ones
            this.bullets = this.bullets.filter(bullet => {
                if (!bullet.update()) {
                    return false;
                }
                CollisionDetector.wrapToScreen(bullet, this.width, this.height);
                return true;
            });
        } catch (error) {
            logger.error('Failed to update bullets', error);
        }
    }

    /**
     * Update all asteroids
     * @private
     */
    _updateAsteroids() {
        try {
            this.asteroids.forEach(asteroid => {
                asteroid.update();
                CollisionDetector.wrapToScreen(asteroid, this.width, this.height);
            });
        } catch (error) {
            logger.error('Failed to update asteroids', error);
        }
    }

    /**
     * Check for collisions between entities
     * @private
     */
    _checkCollisions() {
        try {
            this._checkBulletAsteroidCollisions();
            this._checkShipAsteroidCollisions();
        } catch (error) {
            logger.error('Failed to check collisions', error);
        }
    }

    /**
     * Check collisions between bullets and asteroids
     * @private
     */
    _checkBulletAsteroidCollisions() {
        try {
            const collisions = CollisionDetector.findBulletAsteroidCollisions(
                this.bullets, 
                this.asteroids
            );

            // Process collisions in reverse order to avoid index issues
            collisions.reverse().forEach(collision => {
                const { bulletIndex, asteroidIndex, asteroid } = collision;
                
                // Remove bullet and asteroid
                this.bullets.splice(bulletIndex, 1);
                this.asteroids.splice(asteroidIndex, 1);
                
                // Add score
                this.score += asteroid.getPointValue();
                
                // Break asteroid into smaller pieces
                const fragments = asteroid.break();
                this.asteroids.push(...fragments);
                
                logger.debug('Bullet-asteroid collision processed', {
                    score: this.score,
                    fragments: fragments.length
                });
            });

            if (collisions.length > 0) {
                this._updateUI();
            }
        } catch (error) {
            logger.error('Failed to check bullet-asteroid collisions', error);
        }
    }

    /**
     * Check collisions between ship and asteroids
     * @private
     */
    _checkShipAsteroidCollisions() {
        try {
            const collisions = CollisionDetector.findShipAsteroidCollisions(
                this.ship, 
                this.asteroids
            );

            if (collisions.length > 0) {
                this._handleShipDestroyed();
            }
        } catch (error) {
            logger.error('Failed to check ship-asteroid collisions', error);
        }
    }

    /**
     * Handle ship destruction
     * @private
     */
    _handleShipDestroyed() {
        try {
            this.lives--;
            this._updateUI();
            
            logger.info('Ship destroyed', { livesRemaining: this.lives });
            
            if (this.lives <= 0) {
                this._gameOver();
            } else {
                this._respawnShip();
            }
        } catch (error) {
            logger.error('Failed to handle ship destruction', error);
        }
    }

    /**
     * Respawn the ship at the center
     * @private
     */
    _respawnShip() {
        try {
            this.ship.reset(this.width / 2, this.height / 2);
            logger.debug('Ship respawned');
        } catch (error) {
            logger.error('Failed to respawn ship', error);
        }
    }

    /**
     * Check game win/lose conditions
     * @private
     */
    _checkGameConditions() {
        try {
            if (this.asteroids.length === 0) {
                this._nextLevel();
            }
        } catch (error) {
            logger.error('Failed to check game conditions', error);
        }
    }

    /**
     * Start the next level with more asteroids
     * @private
     */
    _nextLevel() {
        try {
            this._initializeAsteroids();
            logger.info('Next level started', { asteroidCount: this.asteroids.length });
        } catch (error) {
            logger.error('Failed to start next level', error);
        }
    }

    /**
     * Render all game entities
     * @private
     */
    _render() {
        try {
            // Clear canvas
            this.ctx.fillStyle = GAME_CONFIG.GRAPHICS.BACKGROUND_COLOR;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Render entities
            if (this.ship) {
                this.ship.render(this.ctx);
            }
            
            this.bullets.forEach(bullet => bullet.render(this.ctx));
            this.asteroids.forEach(asteroid => asteroid.render(this.ctx));
        } catch (error) {
            logger.error('Failed to render game', error);
        }
    }

    /**
     * Update UI elements
     * @private
     */
    _updateUI() {
        try {
            const scoreElement = document.getElementById('score');
            const livesElement = document.getElementById('lives');
            
            if (scoreElement) {
                scoreElement.textContent = this.score;
            }
            if (livesElement) {
                livesElement.textContent = this.lives;
            }
        } catch (error) {
            logger.error('Failed to update UI', error);
        }
    }

    /**
     * Handle game over
     * @private
     */
    _gameOver() {
        try {
            this.gameRunning = false;
            const gameOverElement = document.getElementById('gameOver');
            const finalScoreElement = document.getElementById('finalScore');
            
            if (gameOverElement) {
                gameOverElement.style.display = 'block';
            }
            if (finalScoreElement) {
                finalScoreElement.textContent = this.score;
            }
            
            logger.info('Game over', { finalScore: this.score });
        } catch (error) {
            logger.error('Failed to handle game over', error);
        }
    }

    /**
     * Main game loop
     * @private
     */
    _gameLoop() {
        try {
            this._update();
            this._render();
            requestAnimationFrame(() => this._gameLoop());
        } catch (error) {
            logger.error('Game loop error', error);
            // Continue the loop even if there's an error
            requestAnimationFrame(() => this._gameLoop());
        }
    }

    /**
     * Start the game
     */
    start() {
        try {
            if (!this.gameStarted) {
                this.gameStarted = true;
                this._gameLoop();
                logger.info('Game started');
            }
        } catch (error) {
            logger.error('Failed to start game', error);
        }
    }

    /**
     * Restart the game
     */
    restart() {
        try {
            logger.info('Game restarting');
            
            this._initializeGame();
            
            // Hide game over screen
            const gameOverElement = document.getElementById('gameOver');
            if (gameOverElement) {
                gameOverElement.style.display = 'none';
            }
            
            logger.info('Game restarted successfully');
        } catch (error) {
            logger.error('Failed to restart game', error);
        }
    }

    /**
     * Pause the game
     */
    pause() {
        try {
            this.gameRunning = false;
            logger.info('Game paused');
        } catch (error) {
            logger.error('Failed to pause game', error);
        }
    }

    /**
     * Resume the game
     */
    resume() {
        try {
            this.gameRunning = true;
            logger.info('Game resumed');
        } catch (error) {
            logger.error('Failed to resume game', error);
        }
    }

    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getGameState() {
        return {
            score: this.score,
            lives: this.lives,
            gameRunning: this.gameRunning,
            asteroidCount: this.asteroids.length,
            bulletCount: this.bullets.length
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        try {
            if (this.inputHandler) {
                this.inputHandler.destroy();
            }
            logger.info('Game destroyed');
        } catch (error) {
            logger.error('Failed to destroy game', error);
        }
    }
}