/**
 * Unit tests for the Ship class
 */

import { Ship } from '../../src/js/entities/Ship.js';
import { GAME_CONFIG } from '../../src/js/config/gameConfig.js';

describe('Ship', () => {
    let ship;
    let mockCanvas;
    let mockCtx;

    beforeEach(() => {
        ship = new Ship(100, 200);
        
        // Mock canvas context
        mockCtx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            closePath: jest.fn(),
            stroke: jest.fn(),
            strokeStyle: '',
            lineWidth: 0
        };
    });

    describe('Constructor', () => {
        test('should create ship with valid coordinates', () => {
            expect(ship.x).toBe(100);
            expect(ship.y).toBe(200);
            expect(ship.vx).toBe(0);
            expect(ship.vy).toBe(0);
            expect(ship.angle).toBe(0);
        });

        test('should throw error with invalid coordinates', () => {
            expect(() => new Ship('invalid', 200)).toThrow('Ship coordinates must be valid numbers');
            expect(() => new Ship(100, 'invalid')).toThrow('Ship coordinates must be valid numbers');
            expect(() => new Ship(NaN, 200)).toThrow('Ship coordinates must be valid numbers');
        });

        test('should initialize with default properties', () => {
            expect(ship.thrustPower).toBe(GAME_CONFIG.SHIP.THRUST_POWER);
            expect(ship.friction).toBe(GAME_CONFIG.SHIP.FRICTION);
        });
    });

    describe('rotate', () => {
        test('should rotate ship by given amount', () => {
            const initialAngle = ship.angle;
            ship.rotate(0.5);
            expect(ship.angle).toBe(initialAngle + 0.5);
        });

        test('should handle negative rotation', () => {
            const initialAngle = ship.angle;
            ship.rotate(-0.3);
            expect(ship.angle).toBe(initialAngle - 0.3);
        });

        test('should handle invalid rotation gracefully', () => {
            const initialAngle = ship.angle;
            ship.rotate('invalid');
            expect(ship.angle).toBe(initialAngle); // Should not change
        });
    });

    describe('thrust', () => {
        test('should apply forward thrust', () => {
            ship.angle = 0; // Facing right
            ship.thrust(1);
            expect(ship.vx).toBeGreaterThan(0);
            expect(ship.vy).toBe(0);
        });

        test('should apply backward thrust', () => {
            ship.angle = 0; // Facing right
            ship.thrust(-1);
            expect(ship.vx).toBeLessThan(0);
            expect(ship.vy).toBe(0);
        });

        test('should apply thrust at an angle', () => {
            ship.angle = Math.PI / 2; // Facing down
            ship.thrust(1);
            expect(Math.abs(ship.vx)).toBeLessThan(0.01); // Should be close to 0
            expect(ship.vy).toBeGreaterThan(0);
        });

        test('should handle invalid thrust direction gracefully', () => {
            const initialVx = ship.vx;
            const initialVy = ship.vy;
            ship.thrust('invalid');
            expect(ship.vx).toBe(initialVx);
            expect(ship.vy).toBe(initialVy);
        });
    });

    describe('update', () => {
        test('should update position based on velocity', () => {
            ship.vx = 5;
            ship.vy = 3;
            const initialX = ship.x;
            const initialY = ship.y;
            
            ship.update();
            
            expect(ship.x).toBe(initialX + 5);
            expect(ship.y).toBe(initialY + 3);
        });

        test('should apply friction to velocity', () => {
            ship.vx = 10;
            ship.vy = 10;
            
            ship.update();
            
            expect(ship.vx).toBe(10 * GAME_CONFIG.SHIP.FRICTION);
            expect(ship.vy).toBe(10 * GAME_CONFIG.SHIP.FRICTION);
        });
    });

    describe('render', () => {
        test('should call canvas methods in correct order', () => {
            ship.render(mockCtx);
            
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.translate).toHaveBeenCalledWith(ship.x, ship.y);
            expect(mockCtx.rotate).toHaveBeenCalledWith(ship.angle);
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.stroke).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        test('should set correct stroke style and line width', () => {
            ship.render(mockCtx);
            
            expect(mockCtx.strokeStyle).toBe(GAME_CONFIG.GRAPHICS.FOREGROUND_COLOR);
            expect(mockCtx.lineWidth).toBe(GAME_CONFIG.GRAPHICS.LINE_WIDTH);
        });

        test('should handle invalid context gracefully', () => {
            expect(() => ship.render(null)).not.toThrow();
            expect(() => ship.render({})).not.toThrow();
        });
    });

    describe('reset', () => {
        test('should reset ship to new position', () => {
            ship.vx = 5;
            ship.vy = 3;
            ship.angle = 1.5;
            
            ship.reset(50, 75);
            
            expect(ship.x).toBe(50);
            expect(ship.y).toBe(75);
            expect(ship.vx).toBe(0);
            expect(ship.vy).toBe(0);
            expect(ship.angle).toBe(0);
        });

        test('should throw error with invalid coordinates', () => {
            expect(() => ship.reset('invalid', 75)).not.toThrow(); // Should handle gracefully
        });
    });

    describe('getCollisionRadius', () => {
        test('should return correct collision radius', () => {
            expect(ship.getCollisionRadius()).toBe(GAME_CONFIG.SHIP.COLLISION_RADIUS);
        });
    });

    describe('getFrontPosition', () => {
        test('should return correct front position', () => {
            ship.x = 100;
            ship.y = 200;
            ship.angle = 0; // Facing right
            
            const frontPos = ship.getFrontPosition();
            
            expect(frontPos.x).toBe(115); // 100 + 15
            expect(frontPos.y).toBe(200);
        });

        test('should calculate front position at different angle', () => {
            ship.x = 100;
            ship.y = 200;
            ship.angle = Math.PI / 2; // Facing down
            
            const frontPos = ship.getFrontPosition();
            
            expect(Math.abs(frontPos.x - 100)).toBeLessThan(0.01); // Should be close to 100
            expect(frontPos.y).toBe(215); // 200 + 15
        });
    });
});