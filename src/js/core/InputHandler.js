/**
 * Input handling class for the Asteroids game
 * Manages keyboard input and provides a clean interface for game controls
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { logger } from '../utils/logger.js';

export class InputHandler {
    /**
     * Creates a new InputHandler instance
     */
    constructor() {
        this.keys = {};
        this.callbacks = {
            shoot: [],
            restart: []
        };
        
        this._setupEventListeners();
        logger.debug('InputHandler initialized');
    }

    /**
     * Set up keyboard event listeners
     * @private
     */
    _setupEventListeners() {
        try {
            document.addEventListener('keydown', (e) => this._handleKeyDown(e));
            document.addEventListener('keyup', (e) => this._handleKeyUp(e));
        } catch (error) {
            logger.error('Failed to setup input event listeners', error);
        }
    }

    /**
     * Handle keydown events
     * @private
     * @param {KeyboardEvent} event - The keyboard event
     */
    _handleKeyDown(event) {
        try {
            this.keys[event.code] = true;
            
            // Prevent default behavior for game keys
            if (this._isGameKey(event.code)) {
                event.preventDefault();
            }
            
            // Handle special actions
            if (event.code === GAME_CONFIG.INPUT.KEYS.SHOOT) {
                this._triggerCallbacks('shoot');
            } else if (event.code === GAME_CONFIG.INPUT.KEYS.RESTART) {
                this._triggerCallbacks('restart');
            }
        } catch (error) {
            logger.error('Failed to handle keydown event', error);
        }
    }

    /**
     * Handle keyup events
     * @private
     * @param {KeyboardEvent} event - The keyboard event
     */
    _handleKeyUp(event) {
        try {
            this.keys[event.code] = false;
            
            // Prevent default behavior for game keys
            if (this._isGameKey(event.code)) {
                event.preventDefault();
            }
        } catch (error) {
            logger.error('Failed to handle keyup event', error);
        }
    }

    /**
     * Check if a key code is a game control key
     * @private
     * @param {string} keyCode - The key code to check
     * @returns {boolean} True if it's a game key
     */
    _isGameKey(keyCode) {
        return Object.values(GAME_CONFIG.INPUT.KEYS).includes(keyCode);
    }

    /**
     * Trigger callbacks for a specific action
     * @private
     * @param {string} action - The action to trigger
     */
    _triggerCallbacks(action) {
        try {
            if (this.callbacks[action]) {
                this.callbacks[action].forEach(callback => {
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            }
        } catch (error) {
            logger.error(`Failed to trigger callbacks for action: ${action}`, error);
        }
    }

    /**
     * Check if a key is currently pressed
     * @param {string} keyCode - The key code to check
     * @returns {boolean} True if key is pressed
     */
    isKeyPressed(keyCode) {
        return Boolean(this.keys[keyCode]);
    }

    /**
     * Check if the left arrow key is pressed
     * @returns {boolean} True if left is pressed
     */
    isLeftPressed() {
        return this.isKeyPressed(GAME_CONFIG.INPUT.KEYS.LEFT);
    }

    /**
     * Check if the right arrow key is pressed
     * @returns {boolean} True if right is pressed
     */
    isRightPressed() {
        return this.isKeyPressed(GAME_CONFIG.INPUT.KEYS.RIGHT);
    }

    /**
     * Check if the up arrow key is pressed
     * @returns {boolean} True if up is pressed
     */
    isUpPressed() {
        return this.isKeyPressed(GAME_CONFIG.INPUT.KEYS.UP);
    }

    /**
     * Check if the down arrow key is pressed
     * @returns {boolean} True if down is pressed
     */
    isDownPressed() {
        return this.isKeyPressed(GAME_CONFIG.INPUT.KEYS.DOWN);
    }

    /**
     * Register a callback for the shoot action
     * @param {Function} callback - Function to call when shoot is pressed
     */
    onShoot(callback) {
        if (typeof callback === 'function') {
            this.callbacks.shoot.push(callback);
        } else {
            logger.warn('Invalid callback provided for shoot action');
        }
    }

    /**
     * Register a callback for the restart action
     * @param {Function} callback - Function to call when restart is pressed
     */
    onRestart(callback) {
        if (typeof callback === 'function') {
            this.callbacks.restart.push(callback);
        } else {
            logger.warn('Invalid callback provided for restart action');
        }
    }

    /**
     * Remove a callback for a specific action
     * @param {string} action - The action to remove callback from
     * @param {Function} callback - The callback function to remove
     */
    removeCallback(action, callback) {
        try {
            if (this.callbacks[action]) {
                const index = this.callbacks[action].indexOf(callback);
                if (index > -1) {
                    this.callbacks[action].splice(index, 1);
                }
            }
        } catch (error) {
            logger.error(`Failed to remove callback for action: ${action}`, error);
        }
    }

    /**
     * Clear all callbacks
     */
    clearCallbacks() {
        try {
            this.callbacks = {
                shoot: [],
                restart: []
            };
            logger.debug('All input callbacks cleared');
        } catch (error) {
            logger.error('Failed to clear callbacks', error);
        }
    }

    /**
     * Cleanup event listeners (call when destroying the input handler)
     */
    destroy() {
        try {
            document.removeEventListener('keydown', this._handleKeyDown);
            document.removeEventListener('keyup', this._handleKeyUp);
            this.clearCallbacks();
            logger.debug('InputHandler destroyed');
        } catch (error) {
            logger.error('Failed to destroy InputHandler', error);
        }
    }
}