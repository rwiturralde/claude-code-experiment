/**
 * Ship class for the Asteroids game
 * Represents the player's spaceship with movement, rotation, and rendering capabilities
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { logger } from '../utils/logger.js';

export class Ship {
    /**
     * Creates a new Ship instance
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @throws {Error} If invalid coordinates are provided
     */
    constructor(x, y) {
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
            throw new Error('Ship coordinates must be valid numbers');
        }

        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.thrustPower = GAME_CONFIG.SHIP.THRUST_POWER;
        this.friction = GAME_CONFIG.SHIP.FRICTION;
        
        logger.debug('Ship created', { x, y });
    }

    /**
     * Rotate the ship by the specified amount
     * @param {number} amount - Rotation amount in radians
     */
    rotate(amount) {
        try {
            if (typeof amount !== 'number' || isNaN(amount)) {
                throw new Error('Rotation amount must be a valid number');
            }
            this.angle += amount;
        } catch (error) {
            logger.error('Failed to rotate ship', error);
        }
    }

    /**
     * Apply thrust to the ship in the current direction
     * @param {number} direction - Thrust direction multiplier (1 for forward, -1 for backward)
     */
    thrust(direction = 1) {
        try {
            if (typeof direction !== 'number' || isNaN(direction)) {
                throw new Error('Thrust direction must be a valid number');
            }

            const thrustX = Math.cos(this.angle) * this.thrustPower * direction;
            const thrustY = Math.sin(this.angle) * this.thrustPower * direction;
            
            this.vx += thrustX;
            this.vy += thrustY;
        } catch (error) {
            logger.error('Failed to apply thrust to ship', error);
        }
    }

    /**
     * Update the ship's position and apply friction
     */
    update() {
        try {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= this.friction;
            this.vy *= this.friction;
        } catch (error) {
            logger.error('Failed to update ship position', error);
        }
    }

    /**
     * Render the ship on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        try {
            if (!ctx || typeof ctx.save !== 'function') {
                throw new Error('Invalid canvas context provided');
            }

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            ctx.strokeStyle = GAME_CONFIG.GRAPHICS.FOREGROUND_COLOR;
            ctx.lineWidth = GAME_CONFIG.GRAPHICS.LINE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(-10, -8);
            ctx.lineTo(-5, 0);
            ctx.lineTo(-10, 8);
            ctx.closePath();
            ctx.stroke();
            
            ctx.restore();
        } catch (error) {
            logger.error('Failed to render ship', error);
        }
    }

    /**
     * Reset the ship to initial state
     * @param {number} x - Reset x position
     * @param {number} y - Reset y position
     */
    reset(x, y) {
        try {
            if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
                throw new Error('Reset coordinates must be valid numbers');
            }

            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.angle = 0;
            
            logger.debug('Ship reset', { x, y });
        } catch (error) {
            logger.error('Failed to reset ship', error);
        }
    }

    /**
     * Get the ship's collision radius
     * @returns {number} The collision radius
     */
    getCollisionRadius() {
        return GAME_CONFIG.SHIP.COLLISION_RADIUS;
    }

    /**
     * Get the ship's front position for bullet spawning
     * @returns {Object} Object with x and y coordinates
     */
    getFrontPosition() {
        return {
            x: this.x + Math.cos(this.angle) * 15,
            y: this.y + Math.sin(this.angle) * 15
        };
    }
}