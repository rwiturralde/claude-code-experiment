/**
 * Unit tests for the Bullet class
 */

import { Bullet } from '../../src/js/entities/Bullet.js';
import { Ship } from '../../src/js/entities/Ship.js';
import { GAME_CONFIG } from '../../src/js/config/gameConfig.js';

describe('Bullet', () => {
    let bullet;
    let mockCtx;

    beforeEach(() => {
        bullet = new Bullet(100, 200, 5, -3);
        
        // Mock canvas context
        mockCtx = {
            fillStyle: '',
            fillRect: jest.fn()
        };
    });

    describe('Constructor', () => {
        test('should create bullet with valid parameters', () => {
            expect(bullet.x).toBe(100);
            expect(bullet.y).toBe(200);
            expect(bullet.vx).toBe(5);
            expect(bullet.vy).toBe(-3);
            expect(bullet.life).toBe(GAME_CONFIG.BULLET.LIFETIME);
            expect(bullet.size).toBe(GAME_CONFIG.BULLET.SIZE);
        });

        test('should throw error with invalid coordinates', () => {
            expect(() => new Bullet('invalid', 200, 5, -3)).toThrow('Bullet parameters must be valid numbers');
            expect(() => new Bullet(100, 'invalid', 5, -3)).toThrow('Bullet parameters must be valid numbers');
            expect(() => new Bullet(100, 200, 'invalid', -3)).toThrow('Bullet parameters must be valid numbers');
            expect(() => new Bullet(100, 200, 5, 'invalid')).toThrow('Bullet parameters must be valid numbers');
        });

        test('should throw error with NaN values', () => {
            expect(() => new Bullet(NaN, 200, 5, -3)).toThrow('Bullet parameters must be valid numbers');
            expect(() => new Bullet(100, NaN, 5, -3)).toThrow('Bullet parameters must be valid numbers');
        });
    });

    describe('update', () => {
        test('should update position based on velocity', () => {
            const initialX = bullet.x;
            const initialY = bullet.y;
            const initialLife = bullet.life;
            
            const result = bullet.update();
            
            expect(bullet.x).toBe(initialX + bullet.vx);
            expect(bullet.y).toBe(initialY + bullet.vy);
            expect(bullet.life).toBe(initialLife - 1);
            expect(result).toBe(true);
        });

        test('should return false when life reaches zero', () => {
            bullet.life = 1;
            
            const result = bullet.update();
            
            expect(bullet.life).toBe(0);
            expect(result).toBe(false);
        });

        test('should return false when life goes below zero', () => {
            bullet.life = 0;
            
            const result = bullet.update();
            
            expect(bullet.life).toBe(-1);
            expect(result).toBe(false);
        });
    });

    describe('render', () => {
        test('should call fillRect with correct parameters', () => {
            bullet.render(mockCtx);
            
            const halfSize = bullet.size / 2;
            expect(mockCtx.fillRect).toHaveBeenCalledWith(
                bullet.x - halfSize,
                bullet.y - halfSize,
                bullet.size,
                bullet.size
            );
        });

        test('should set correct fill style', () => {
            bullet.render(mockCtx);
            
            expect(mockCtx.fillStyle).toBe(GAME_CONFIG.GRAPHICS.FOREGROUND_COLOR);
        });

        test('should handle invalid context gracefully', () => {
            expect(() => bullet.render(null)).not.toThrow();
            expect(() => bullet.render({})).not.toThrow();
        });
    });

    describe('isAlive', () => {
        test('should return true when bullet has life', () => {
            bullet.life = 10;
            expect(bullet.isAlive()).toBe(true);
        });

        test('should return false when bullet has no life', () => {
            bullet.life = 0;
            expect(bullet.isAlive()).toBe(false);
        });

        test('should return false when bullet has negative life', () => {
            bullet.life = -5;
            expect(bullet.isAlive()).toBe(false);
        });
    });

    describe('getCollisionRadius', () => {
        test('should return bullet size as collision radius', () => {
            expect(bullet.getCollisionRadius()).toBe(bullet.size);
        });
    });

    describe('createFromShip', () => {
        let ship;

        beforeEach(() => {
            ship = new Ship(100, 200);
            ship.angle = 0; // Facing right
        });

        test('should create bullet from ship position and angle', () => {
            const bullet = Bullet.createFromShip(ship);
            
            expect(bullet.x).toBe(115); // ship.x + 15 (front position)
            expect(bullet.y).toBe(200);  // ship.y
            expect(bullet.vx).toBe(GAME_CONFIG.BULLET.SPEED);
            expect(bullet.vy).toBe(0);
        });

        test('should create bullet with correct velocity for angled ship', () => {
            ship.angle = Math.PI / 2; // Facing down
            const bullet = Bullet.createFromShip(ship);
            
            expect(Math.abs(bullet.vx)).toBeLessThan(0.01); // Should be close to 0
            expect(bullet.vy).toBe(GAME_CONFIG.BULLET.SPEED);
        });

        test('should throw error with invalid ship', () => {
            expect(() => Bullet.createFromShip(null)).toThrow('Invalid ship object provided');
            expect(() => Bullet.createFromShip({})).toThrow('Invalid ship object provided');
            expect(() => Bullet.createFromShip({ x: 'invalid' })).toThrow('Invalid ship object provided');
        });

        test('should create bullet at ship front position', () => {
            ship.x = 50;
            ship.y = 75;
            ship.angle = Math.PI; // Facing left
            
            const bullet = Bullet.createFromShip(ship);
            
            expect(bullet.x).toBe(35); // ship.x - 15
            expect(bullet.y).toBe(75);
            expect(bullet.vx).toBe(-GAME_CONFIG.BULLET.SPEED);
            expect(Math.abs(bullet.vy)).toBeLessThan(0.01);
        });
    });
});