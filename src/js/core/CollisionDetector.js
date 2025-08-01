/**
 * Collision detection utility for the Asteroids game
 * Handles all collision detection between game entities
 */

import { logger } from '../utils/logger.js';

export class CollisionDetector {
    /**
     * Calculate distance between two points
     * @param {number} x1 - First point x coordinate
     * @param {number} y1 - First point y coordinate
     * @param {number} x2 - Second point x coordinate
     * @param {number} y2 - Second point y coordinate
     * @returns {number} Distance between the points
     */
    static distanceBetween(x1, y1, x2, y2) {
        try {
            if (typeof x1 !== 'number' || typeof y1 !== 'number' ||
                typeof x2 !== 'number' || typeof y2 !== 'number' ||
                isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
                throw new Error('All coordinates must be valid numbers');
            }
            
            return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        } catch (error) {
            logger.error('Failed to calculate distance between points', error);
            return Infinity;
        }
    }

    /**
     * Check collision between two circular objects
     * @param {Object} obj1 - First object with x, y properties and getCollisionRadius method
     * @param {Object} obj2 - Second object with x, y properties and getCollisionRadius method
     * @returns {boolean} True if objects are colliding
     */
    static checkCircularCollision(obj1, obj2) {
        try {
            if (!obj1 || !obj2) {
                throw new Error('Both objects must be provided');
            }

            if (typeof obj1.x !== 'number' || typeof obj1.y !== 'number' ||
                typeof obj2.x !== 'number' || typeof obj2.y !== 'number') {
                throw new Error('Objects must have valid x and y coordinates');
            }

            if (typeof obj1.getCollisionRadius !== 'function' ||
                typeof obj2.getCollisionRadius !== 'function') {
                throw new Error('Objects must have getCollisionRadius method');
            }

            const distance = this.distanceBetween(obj1.x, obj1.y, obj2.x, obj2.y);
            const combinedRadius = obj1.getCollisionRadius() + obj2.getCollisionRadius();

            return distance <= combinedRadius;
        } catch (error) {
            logger.error('Failed to check circular collision', error);
            return false;
        }
    }

    /**
     * Check collision between a bullet and an asteroid
     * @param {Bullet} bullet - The bullet object
     * @param {Asteroid} asteroid - The asteroid object
     * @returns {boolean} True if bullet hits asteroid
     */
    static checkBulletAsteroidCollision(bullet, asteroid) {
        try {
            if (!bullet || !asteroid) {
                return false;
            }

            return this.checkCircularCollision(bullet, asteroid);
        } catch (error) {
            logger.error('Failed to check bullet-asteroid collision', error);
            return false;
        }
    }

    /**
     * Check collision between a ship and an asteroid
     * @param {Ship} ship - The ship object
     * @param {Asteroid} asteroid - The asteroid object
     * @returns {boolean} True if ship hits asteroid
     */
    static checkShipAsteroidCollision(ship, asteroid) {
        try {
            if (!ship || !asteroid) {
                return false;
            }

            return this.checkCircularCollision(ship, asteroid);
        } catch (error) {
            logger.error('Failed to check ship-asteroid collision', error);
            return false;
        }
    }

    /**
     * Find all collisions between bullets and asteroids
     * @param {Array<Bullet>} bullets - Array of bullet objects
     * @param {Array<Asteroid>} asteroids - Array of asteroid objects
     * @returns {Array<Object>} Array of collision objects with bullet and asteroid indices
     */
    static findBulletAsteroidCollisions(bullets, asteroids) {
        const collisions = [];

        try {
            if (!Array.isArray(bullets) || !Array.isArray(asteroids)) {
                throw new Error('Bullets and asteroids must be arrays');
            }

            for (let i = 0; i < bullets.length; i++) {
                const bullet = bullets[i];
                if (!bullet) continue;

                for (let j = 0; j < asteroids.length; j++) {
                    const asteroid = asteroids[j];
                    if (!asteroid) continue;

                    if (this.checkBulletAsteroidCollision(bullet, asteroid)) {
                        collisions.push({
                            bulletIndex: i,
                            asteroidIndex: j,
                            bullet,
                            asteroid
                        });
                        break; // Bullet can only hit one asteroid
                    }
                }
            }
        } catch (error) {
            logger.error('Failed to find bullet-asteroid collisions', error);
        }

        return collisions;
    }

    /**
     * Find all collisions between ship and asteroids
     * @param {Ship} ship - The ship object
     * @param {Array<Asteroid>} asteroids - Array of asteroid objects
     * @returns {Array<Object>} Array of collision objects with asteroid information
     */
    static findShipAsteroidCollisions(ship, asteroids) {
        const collisions = [];

        try {
            if (!ship) {
                return collisions;
            }

            if (!Array.isArray(asteroids)) {
                throw new Error('Asteroids must be an array');
            }

            for (let i = 0; i < asteroids.length; i++) {
                const asteroid = asteroids[i];
                if (!asteroid) continue;

                if (this.checkShipAsteroidCollision(ship, asteroid)) {
                    collisions.push({
                        asteroidIndex: i,
                        asteroid
                    });
                }
            }
        } catch (error) {
            logger.error('Failed to find ship-asteroid collisions', error);
        }

        return collisions;
    }

    /**
     * Check if a point is within screen bounds
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Screen width
     * @param {number} height - Screen height
     * @returns {boolean} True if point is within bounds
     */
    static isPointInBounds(x, y, width, height) {
        try {
            if (typeof x !== 'number' || typeof y !== 'number' ||
                typeof width !== 'number' || typeof height !== 'number' ||
                isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
                throw new Error('All parameters must be valid numbers');
            }

            return x >= 0 && x <= width && y >= 0 && y <= height;
        } catch (error) {
            logger.error('Failed to check if point is in bounds', error);
            return false;
        }
    }

    /**
     * Wrap an object's position to screen bounds (for screen wrapping)
     * @param {Object} obj - Object with x and y properties
     * @param {number} width - Screen width
     * @param {number} height - Screen height
     */
    static wrapToScreen(obj, width, height) {
        try {
            if (!obj || typeof obj.x !== 'number' || typeof obj.y !== 'number') {
                throw new Error('Object must have valid x and y coordinates');
            }

            if (typeof width !== 'number' || typeof height !== 'number' ||
                isNaN(width) || isNaN(height)) {
                throw new Error('Width and height must be valid numbers');
            }

            if (obj.x < 0) obj.x = width;
            if (obj.x > width) obj.x = 0;
            if (obj.y < 0) obj.y = height;
            if (obj.y > height) obj.y = 0;
        } catch (error) {
            logger.error('Failed to wrap object to screen', error);
        }
    }
}