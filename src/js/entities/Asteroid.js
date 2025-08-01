/**
 * Asteroid class for the Asteroids game
 * Represents asteroids that float through space and can be destroyed
 */

import { GAME_CONFIG } from '../config/gameConfig.js';
import { logger } from '../utils/logger.js';

export class Asteroid {
    /**
     * Creates a new Asteroid instance
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {string} size - Asteroid size ('large', 'medium', or 'small')
     * @throws {Error} If invalid parameters are provided
     */
    constructor(x, y, size) {
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
            throw new Error('Asteroid coordinates must be valid numbers');
        }

        if (!GAME_CONFIG.ASTEROID.SIZES[size.toUpperCase()]) {
            throw new Error(`Invalid asteroid size: ${size}`);
        }

        this.x = x;
        this.y = y;
        this.size = size.toLowerCase();
        
        const sizeConfig = GAME_CONFIG.ASTEROID.SIZES[size.toUpperCase()];
        this.radius = sizeConfig.radius;
        this.points = sizeConfig.points;
        
        // Generate random velocity
        this.vx = (Math.random() - 0.5) * GAME_CONFIG.ASTEROID.MAX_SPEED;
        this.vy = (Math.random() - 0.5) * GAME_CONFIG.ASTEROID.MAX_SPEED;
        
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        
        this._generateShape();
        
        logger.debug('Asteroid created', { x, y, size, radius: this.radius });
    }

    /**
     * Generate the asteroid's irregular shape
     * @private
     */
    _generateShape() {
        try {
            this.shapePoints = [];
            const numPoints = GAME_CONFIG.ASTEROID.SHAPE_POINTS;
            const variance = GAME_CONFIG.ASTEROID.SHAPE_VARIANCE;
            
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                const radius = this.radius * (1 + (Math.random() - 0.5) * variance);
                this.shapePoints.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius
                });
            }
        } catch (error) {
            logger.error('Failed to generate asteroid shape', error);
            // Fallback to circular shape
            this.shapePoints = [{x: this.radius, y: 0}];
        }
    }

    /**
     * Update the asteroid's position and rotation
     */
    update() {
        try {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
        } catch (error) {
            logger.error('Failed to update asteroid', error);
        }
    }

    /**
     * Render the asteroid on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        try {
            if (!ctx || typeof ctx.save !== 'function') {
                throw new Error('Invalid canvas context provided');
            }

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            ctx.strokeStyle = GAME_CONFIG.GRAPHICS.FOREGROUND_COLOR;
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            if (this.shapePoints && this.shapePoints.length > 0) {
                for (let i = 0; i < this.shapePoints.length; i++) {
                    const point = this.shapePoints[i];
                    if (i === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
                ctx.closePath();
            } else {
                // Fallback to circle
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            }
            
            ctx.stroke();
            ctx.restore();
        } catch (error) {
            logger.error('Failed to render asteroid', error);
        }
    }

    /**
     * Break the asteroid into smaller pieces
     * @returns {Array<Asteroid>} Array of smaller asteroids, or empty array if asteroid is too small
     */
    break() {
        try {
            const fragments = [];
            
            if (this.size === 'large') {
                fragments.push(
                    new Asteroid(this.x, this.y, 'medium'),
                    new Asteroid(this.x, this.y, 'medium')
                );
            } else if (this.size === 'medium') {
                fragments.push(
                    new Asteroid(this.x, this.y, 'small'),
                    new Asteroid(this.x, this.y, 'small')
                );
            }
            
            logger.debug('Asteroid broken', { originalSize: this.size, fragments: fragments.length });
            return fragments;
        } catch (error) {
            logger.error('Failed to break asteroid', error);
            return [];
        }
    }

    /**
     * Get the asteroid's collision radius
     * @returns {number} The collision radius
     */
    getCollisionRadius() {
        return this.radius;
    }

    /**
     * Get the points awarded for destroying this asteroid
     * @returns {number} Points value
     */
    getPointValue() {
        return this.points;
    }

    /**
     * Check if a point is within the asteroid's bounds
     * @param {number} px - Point x coordinate
     * @param {number} py - Point y coordinate
     * @returns {boolean} True if point is within asteroid
     */
    containsPoint(px, py) {
        try {
            const dx = px - this.x;
            const dy = py - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.radius;
        } catch (error) {
            logger.error('Failed to check point containment', error);
            return false;
        }
    }

    /**
     * Create an asteroid at a safe distance from a point
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @param {number} avoidX - X coordinate to avoid
     * @param {number} avoidY - Y coordinate to avoid
     * @param {number} safeDistance - Minimum safe distance
     * @param {string} size - Asteroid size
     * @returns {Asteroid} New asteroid instance
     */
    static createAtSafeDistance(canvasWidth, canvasHeight, avoidX, avoidY, safeDistance, size) {
        try {
            let x, y;
            let attempts = 0;
            const maxAttempts = 100;
            
            do {
                x = Math.random() * canvasWidth;
                y = Math.random() * canvasHeight;
                attempts++;
                
                if (attempts > maxAttempts) {
                    logger.warn('Could not find safe position for asteroid after max attempts');
                    break;
                }
            } while (this._distanceTo(x, y, avoidX, avoidY) < safeDistance);
            
            return new Asteroid(x, y, size);
        } catch (error) {
            logger.error('Failed to create asteroid at safe distance', error);
            throw error;
        }
    }

    /**
     * Calculate distance between two points
     * @private
     * @param {number} x1 - First point x
     * @param {number} y1 - First point y
     * @param {number} x2 - Second point x
     * @param {number} y2 - Second point y
     * @returns {number} Distance between points
     */
    static _distanceTo(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
}