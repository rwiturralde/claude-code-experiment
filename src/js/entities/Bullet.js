/**
 * Bullet class for the Asteroids game
 * Represents projectiles fired by the player's ship
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { logger } from '../utils/logger.js';

export class Bullet {
    /**
     * Creates a new Bullet instance
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} vx - Velocity in x direction
     * @param {number} vy - Velocity in y direction
     * @throws {Error} If invalid parameters are provided
     */
    constructor(x, y, vx, vy) {
        if (typeof x !== 'number' || typeof y !== 'number' || 
            typeof vx !== 'number' || typeof vy !== 'number' ||
            isNaN(x) || isNaN(y) || isNaN(vx) || isNaN(vy)) {
            throw new Error('Bullet parameters must be valid numbers');
        }

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = GAME_CONFIG.BULLET.LIFETIME;
        this.size = GAME_CONFIG.BULLET.SIZE;
        
        logger.debug('Bullet created', { x, y, vx, vy });
    }

    /**
     * Update the bullet's position and lifetime
     * @returns {boolean} True if bullet is still alive, false otherwise
     */
    update() {
        try {
            this.x += this.vx;
            this.y += this.vy;
            this.life--;
            
            return this.life > 0;
        } catch (error) {
            logger.error('Failed to update bullet', error);
            return false;
        }
    }

    /**
     * Render the bullet on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        try {
            if (!ctx || typeof ctx.fillRect !== 'function') {
                throw new Error('Invalid canvas context provided');
            }

            ctx.fillStyle = GAME_CONFIG.GRAPHICS.FOREGROUND_COLOR;
            const halfSize = this.size / 2;
            ctx.fillRect(this.x - halfSize, this.y - halfSize, this.size, this.size);
        } catch (error) {
            logger.error('Failed to render bullet', error);
        }
    }

    /**
     * Check if the bullet is still alive
     * @returns {boolean} True if bullet has remaining life
     */
    isAlive() {
        return this.life > 0;
    }

    /**
     * Get the bullet's collision radius
     * @returns {number} The collision radius
     */
    getCollisionRadius() {
        return this.size;
    }

    /**
     * Create a bullet from ship position and angle
     * @param {Ship} ship - The ship firing the bullet
     * @returns {Bullet} New bullet instance
     * @throws {Error} If invalid ship is provided
     */
    static createFromShip(ship) {
        try {
            if (!ship || typeof ship.x !== 'number' || typeof ship.angle !== 'number') {
                throw new Error('Invalid ship object provided');
            }

            const speed = GAME_CONFIG.BULLET.SPEED;
            const bulletVx = Math.cos(ship.angle) * speed;
            const bulletVy = Math.sin(ship.angle) * speed;
            
            const frontPos = ship.getFrontPosition();
            
            return new Bullet(frontPos.x, frontPos.y, bulletVx, bulletVy);
        } catch (error) {
            logger.error('Failed to create bullet from ship', error);
            throw error;
        }
    }
}