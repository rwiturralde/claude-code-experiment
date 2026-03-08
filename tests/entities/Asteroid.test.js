/**
 * Unit tests for the Asteroid class
 */

import { Asteroid } from '../../src/js/entities/Asteroid.js';
import { GAME_CONFIG } from '../../src/js/config/gameConfig.js';

const RAINBOW_COLORS = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#8800ff'];

describe('Asteroid', () => {
    let asteroid;
    let mockCtx;

    beforeEach(() => {
        asteroid = new Asteroid(100, 200, 'large');
        
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
            arc: jest.fn(),
            strokeStyle: '',
            lineWidth: 0
        };
    });

    describe('Constructor', () => {
        test('should create large asteroid with correct properties', () => {
            expect(asteroid.x).toBe(100);
            expect(asteroid.y).toBe(200);
            expect(asteroid.size).toBe('large');
            expect(asteroid.radius).toBe(GAME_CONFIG.ASTEROID.SIZES.LARGE.radius);
            expect(asteroid.points).toBe(GAME_CONFIG.ASTEROID.SIZES.LARGE.points);
        });

        test('should create medium asteroid', () => {
            const mediumAsteroid = new Asteroid(50, 75, 'medium');
            expect(mediumAsteroid.size).toBe('medium');
            expect(mediumAsteroid.radius).toBe(GAME_CONFIG.ASTEROID.SIZES.MEDIUM.radius);
            expect(mediumAsteroid.points).toBe(GAME_CONFIG.ASTEROID.SIZES.MEDIUM.points);
        });

        test('should create small asteroid', () => {
            const smallAsteroid = new Asteroid(25, 35, 'small');
            expect(smallAsteroid.size).toBe('small');
            expect(smallAsteroid.radius).toBe(GAME_CONFIG.ASTEROID.SIZES.SMALL.radius);
            expect(smallAsteroid.points).toBe(GAME_CONFIG.ASTEROID.SIZES.SMALL.points);
        });

        test('should handle case-insensitive size parameter', () => {
            const upperCaseAsteroid = new Asteroid(100, 200, 'LARGE');
            expect(upperCaseAsteroid.size).toBe('large');
            expect(upperCaseAsteroid.radius).toBe(GAME_CONFIG.ASTEROID.SIZES.LARGE.radius);
        });

        test('should throw error with invalid coordinates', () => {
            expect(() => new Asteroid('invalid', 200, 'large')).toThrow('Asteroid coordinates must be valid numbers');
            expect(() => new Asteroid(100, 'invalid', 'large')).toThrow('Asteroid coordinates must be valid numbers');
            expect(() => new Asteroid(NaN, 200, 'large')).toThrow('Asteroid coordinates must be valid numbers');
        });

        test('should throw error with invalid size', () => {
            expect(() => new Asteroid(100, 200, 'invalid')).toThrow('Invalid asteroid size: invalid');
            expect(() => new Asteroid(100, 200, '')).toThrow('Invalid asteroid size: ');
        });

        test('should initialize velocity within bounds', () => {
            expect(Math.abs(asteroid.vx)).toBeLessThanOrEqual(GAME_CONFIG.ASTEROID.MAX_SPEED);
            expect(Math.abs(asteroid.vy)).toBeLessThanOrEqual(GAME_CONFIG.ASTEROID.MAX_SPEED);
        });

        test('should generate shape points', () => {
            expect(asteroid.shapePoints).toBeDefined();
            expect(Array.isArray(asteroid.shapePoints)).toBe(true);
            expect(asteroid.shapePoints.length).toBe(GAME_CONFIG.ASTEROID.SHAPE_POINTS);
        });

        test('should initialize color as white (FOREGROUND_COLOR)', () => {
            expect(asteroid.color).toBe(GAME_CONFIG.GRAPHICS.FOREGROUND_COLOR);
        });
    });

    describe('update', () => {
        test('should update position based on velocity', () => {
            const initialX = asteroid.x;
            const initialY = asteroid.y;
            const initialRotation = asteroid.rotation;
            
            asteroid.update();
            
            expect(asteroid.x).toBe(initialX + asteroid.vx);
            expect(asteroid.y).toBe(initialY + asteroid.vy);
            expect(asteroid.rotation).toBe(initialRotation + asteroid.rotationSpeed);
        });
    });

    describe('render', () => {
        test('should call canvas methods in correct order', () => {
            asteroid.render(mockCtx);
            
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.translate).toHaveBeenCalledWith(asteroid.x, asteroid.y);
            expect(mockCtx.rotate).toHaveBeenCalledWith(asteroid.rotation);
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.stroke).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
        });

        test('should set correct stroke style and line width', () => {
            asteroid.render(mockCtx);
            
            expect(mockCtx.strokeStyle).toBe(GAME_CONFIG.GRAPHICS.FOREGROUND_COLOR);
            expect(mockCtx.lineWidth).toBe(1);
        });

        test('should use asteroid color for stroke style', () => {
            asteroid.color = '#ff0000';
            asteroid.render(mockCtx);
            
            expect(mockCtx.strokeStyle).toBe('#ff0000');
        });

        test('should handle invalid context gracefully', () => {
            expect(() => asteroid.render(null)).not.toThrow();
            expect(() => asteroid.render({})).not.toThrow();
        });

        test('should fallback to circle if no shape points', () => {
            asteroid.shapePoints = null;
            asteroid.render(mockCtx);
            
            expect(mockCtx.arc).toHaveBeenCalledWith(0, 0, asteroid.radius, 0, Math.PI * 2);
        });
    });

    describe('break', () => {
        test('should break large asteroid into medium asteroids', () => {
            const fragments = asteroid.break();
            
            expect(fragments).toHaveLength(2);
            expect(fragments[0].size).toBe('medium');
            expect(fragments[1].size).toBe('medium');
            expect(fragments[0].x).toBe(asteroid.x);
            expect(fragments[0].y).toBe(asteroid.y);
        });

        test('should break medium asteroid into small asteroids', () => {
            const mediumAsteroid = new Asteroid(100, 200, 'medium');
            const fragments = mediumAsteroid.break();
            
            expect(fragments).toHaveLength(2);
            expect(fragments[0].size).toBe('small');
            expect(fragments[1].size).toBe('small');
        });

        test('should not break small asteroid', () => {
            const smallAsteroid = new Asteroid(100, 200, 'small');
            const fragments = smallAsteroid.break();
            
            expect(fragments).toHaveLength(0);
        });

        test('should pass parent color to fragments', () => {
            asteroid.color = '#ff0000';
            const fragments = asteroid.break();
            
            expect(fragments[0].color).toBe('#ff0000');
            expect(fragments[1].color).toBe('#ff0000');
        });
    });

    describe('changeToRandomColor', () => {
        test('should change color to a rainbow color', () => {
            asteroid.changeToRandomColor();
            expect(RAINBOW_COLORS).toContain(asteroid.color);
        });

        test('should change to a different color than current', () => {
            asteroid.color = '#ff0000';
            let changedToDifferent = false;
            for (let i = 0; i < 50; i++) {
                asteroid.color = '#ff0000';
                asteroid.changeToRandomColor();
                if (asteroid.color !== '#ff0000') {
                    changedToDifferent = true;
                    break;
                }
            }
            expect(changedToDifferent).toBe(true);
        });
    });

    describe('getRandomRainbowColor', () => {
        test('should return a rainbow color', () => {
            const color = Asteroid.getRandomRainbowColor();
            expect(RAINBOW_COLORS).toContain(color);
        });

        test('should exclude the specified color', () => {
            const excludedColor = '#ff0000';
            for (let i = 0; i < 50; i++) {
                const color = Asteroid.getRandomRainbowColor(excludedColor);
                expect(color).not.toBe(excludedColor);
            }
        });

        test('should return a rainbow color when no exclude provided', () => {
            const color = Asteroid.getRandomRainbowColor(null);
            expect(RAINBOW_COLORS).toContain(color);
        });
    });

    describe('getCollisionRadius', () => {
        test('should return correct collision radius', () => {
            expect(asteroid.getCollisionRadius()).toBe(asteroid.radius);
        });
    });

    describe('getPointValue', () => {
        test('should return correct point value', () => {
            expect(asteroid.getPointValue()).toBe(asteroid.points);
        });
    });

    describe('containsPoint', () => {
        test('should return true for point inside asteroid', () => {
            const result = asteroid.containsPoint(asteroid.x + 5, asteroid.y + 5);
            expect(result).toBe(true);
        });

        test('should return false for point outside asteroid', () => {
            const result = asteroid.containsPoint(
                asteroid.x + asteroid.radius + 10,
                asteroid.y + asteroid.radius + 10
            );
            expect(result).toBe(false);
        });

        test('should return true for point exactly on edge', () => {
            const result = asteroid.containsPoint(
                asteroid.x + asteroid.radius,
                asteroid.y
            );
            expect(result).toBe(true);
        });

        test('should handle invalid coordinates gracefully', () => {
            expect(() => asteroid.containsPoint('invalid', 100)).not.toThrow();
        });
    });

    describe('createAtSafeDistance', () => {
        test('should create asteroid at safe distance', () => {
            const safeDistance = 150;
            const newAsteroid = Asteroid.createAtSafeDistance(
                800, 600, 400, 300, safeDistance, 'large'
            );
            
            expect(newAsteroid).toBeInstanceOf(Asteroid);
            expect(newAsteroid.size).toBe('large');
            
            const distance = Math.sqrt(
                (newAsteroid.x - 400) ** 2 + (newAsteroid.y - 300) ** 2
            );
            expect(distance).toBeGreaterThanOrEqual(safeDistance);
        });

        test('should handle case where safe position cannot be found', () => {
            // This test might be difficult to guarantee failure, but we test that it doesn't crash
            expect(() => {
                Asteroid.createAtSafeDistance(10, 10, 5, 5, 1000, 'large');
            }).not.toThrow();
        });
    });

    describe('_distanceTo', () => {
        test('should calculate correct distance between points', () => {
            const distance = Asteroid._distanceTo(0, 0, 3, 4);
            expect(distance).toBe(5); // 3-4-5 triangle
        });

        test('should return zero for same points', () => {
            const distance = Asteroid._distanceTo(100, 200, 100, 200);
            expect(distance).toBe(0);
        });

        test('should handle negative coordinates', () => {
            const distance = Asteroid._distanceTo(-3, -4, 0, 0);
            expect(distance).toBe(5);
        });
    });
});