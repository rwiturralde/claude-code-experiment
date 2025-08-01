/**
 * Unit tests for the CollisionDetector class
 */

import { CollisionDetector } from '../../src/js/core/CollisionDetector.js';

describe('CollisionDetector', () => {
    let mockObject1;
    let mockObject2;

    beforeEach(() => {
        mockObject1 = {
            x: 100,
            y: 200,
            getCollisionRadius: () => 10
        };

        mockObject2 = {
            x: 110,
            y: 200,
            getCollisionRadius: () => 5
        };
    });

    describe('distanceBetween', () => {
        test('should calculate correct distance between points', () => {
            const distance = CollisionDetector.distanceBetween(0, 0, 3, 4);
            expect(distance).toBe(5); // 3-4-5 triangle
        });

        test('should return zero for same points', () => {
            const distance = CollisionDetector.distanceBetween(100, 200, 100, 200);
            expect(distance).toBe(0);
        });

        test('should handle negative coordinates', () => {
            const distance = CollisionDetector.distanceBetween(-3, -4, 0, 0);
            expect(distance).toBe(5);
        });

        test('should return Infinity for invalid coordinates', () => {
            const distance = CollisionDetector.distanceBetween('invalid', 0, 3, 4);
            expect(distance).toBe(Infinity);
        });

        test('should return Infinity for NaN coordinates', () => {
            const distance = CollisionDetector.distanceBetween(NaN, 0, 3, 4);
            expect(distance).toBe(Infinity);
        });
    });

    describe('checkCircularCollision', () => {
        test('should detect collision when objects overlap', () => {
            // Objects are 10 units apart, combined radius is 15
            const collision = CollisionDetector.checkCircularCollision(mockObject1, mockObject2);
            expect(collision).toBe(true);
        });

        test('should not detect collision when objects are apart', () => {
            mockObject2.x = 120; // Now 20 units apart, combined radius is 15
            const collision = CollisionDetector.checkCircularCollision(mockObject1, mockObject2);
            expect(collision).toBe(false);
        });

        test('should detect collision when objects touch exactly', () => {
            mockObject2.x = 115; // Exactly 15 units apart, combined radius is 15
            const collision = CollisionDetector.checkCircularCollision(mockObject1, mockObject2);
            expect(collision).toBe(true);
        });

        test('should return false for null objects', () => {
            const collision = CollisionDetector.checkCircularCollision(null, mockObject2);
            expect(collision).toBe(false);
        });

        test('should return false for objects without coordinates', () => {
            const invalidObject = { getCollisionRadius: () => 5 };
            const collision = CollisionDetector.checkCircularCollision(invalidObject, mockObject2);
            expect(collision).toBe(false);
        });

        test('should return false for objects without getCollisionRadius method', () => {
            const invalidObject = { x: 100, y: 200 };
            const collision = CollisionDetector.checkCircularCollision(invalidObject, mockObject2);
            expect(collision).toBe(false);
        });
    });

    describe('checkBulletAsteroidCollision', () => {
        test('should delegate to checkCircularCollision', () => {
            const spy = jest.spyOn(CollisionDetector, 'checkCircularCollision');
            CollisionDetector.checkBulletAsteroidCollision(mockObject1, mockObject2);
            expect(spy).toHaveBeenCalledWith(mockObject1, mockObject2);
            spy.mockRestore();
        });

        test('should return false for null objects', () => {
            const collision = CollisionDetector.checkBulletAsteroidCollision(null, mockObject2);
            expect(collision).toBe(false);
        });
    });

    describe('checkShipAsteroidCollision', () => {
        test('should delegate to checkCircularCollision', () => {
            const spy = jest.spyOn(CollisionDetector, 'checkCircularCollision');
            CollisionDetector.checkShipAsteroidCollision(mockObject1, mockObject2);
            expect(spy).toHaveBeenCalledWith(mockObject1, mockObject2);
            spy.mockRestore();
        });

        test('should return false for null objects', () => {
            const collision = CollisionDetector.checkShipAsteroidCollision(null, mockObject2);
            expect(collision).toBe(false);
        });
    });

    describe('findBulletAsteroidCollisions', () => {
        let bullets;
        let asteroids;

        beforeEach(() => {
            bullets = [
                { x: 100, y: 200, getCollisionRadius: () => 2 },
                { x: 150, y: 250, getCollisionRadius: () => 2 }
            ];

            asteroids = [
                { x: 105, y: 200, getCollisionRadius: () => 10 }, // Collides with first bullet
                { x: 200, y: 300, getCollisionRadius: () => 10 }  // No collision
            ];
        });

        test('should find collision between bullet and asteroid', () => {
            const collisions = CollisionDetector.findBulletAsteroidCollisions(bullets, asteroids);
            
            expect(collisions).toHaveLength(1);
            expect(collisions[0].bulletIndex).toBe(0);
            expect(collisions[0].asteroidIndex).toBe(0);
            expect(collisions[0].bullet).toBe(bullets[0]);
            expect(collisions[0].asteroid).toBe(asteroids[0]);
        });

        test('should return empty array when no collisions', () => {
            // Move asteroids far away
            asteroids[0].x = 1000;
            const collisions = CollisionDetector.findBulletAsteroidCollisions(bullets, asteroids);
            expect(collisions).toHaveLength(0);
        });

        test('should handle empty arrays', () => {
            const collisions = CollisionDetector.findBulletAsteroidCollisions([], []);
            expect(collisions).toHaveLength(0);
        });

        test('should handle invalid arrays gracefully', () => {
            expect(() => {
                CollisionDetector.findBulletAsteroidCollisions('invalid', asteroids);
            }).not.toThrow();
        });

        test('should handle null elements in arrays', () => {
            bullets[0] = null;
            const collisions = CollisionDetector.findBulletAsteroidCollisions(bullets, asteroids);
            expect(collisions).toHaveLength(0);
        });
    });

    describe('findShipAsteroidCollisions', () => {
        let ship;
        let asteroids;

        beforeEach(() => {
            ship = { x: 100, y: 200, getCollisionRadius: () => 10 };
            asteroids = [
                { x: 105, y: 200, getCollisionRadius: () => 15 }, // Collides
                { x: 200, y: 300, getCollisionRadius: () => 10 }  // No collision
            ];
        });

        test('should find collision between ship and asteroid', () => {
            const collisions = CollisionDetector.findShipAsteroidCollisions(ship, asteroids);
            
            expect(collisions).toHaveLength(1);
            expect(collisions[0].asteroidIndex).toBe(0);
            expect(collisions[0].asteroid).toBe(asteroids[0]);
        });

        test('should return empty array when no collisions', () => {
            // Move asteroids far away
            asteroids[0].x = 1000;
            const collisions = CollisionDetector.findShipAsteroidCollisions(ship, asteroids);
            expect(collisions).toHaveLength(0);
        });

        test('should return empty array for null ship', () => {
            const collisions = CollisionDetector.findShipAsteroidCollisions(null, asteroids);
            expect(collisions).toHaveLength(0);
        });

        test('should handle invalid asteroids array gracefully', () => {
            expect(() => {
                CollisionDetector.findShipAsteroidCollisions(ship, 'invalid');
            }).not.toThrow();
        });
    });

    describe('isPointInBounds', () => {
        test('should return true for point within bounds', () => {
            const result = CollisionDetector.isPointInBounds(50, 75, 100, 150);
            expect(result).toBe(true);
        });

        test('should return true for point on boundary', () => {
            const result = CollisionDetector.isPointInBounds(0, 0, 100, 150);
            expect(result).toBe(true);
        });

        test('should return false for point outside bounds', () => {
            const result = CollisionDetector.isPointInBounds(150, 75, 100, 150);
            expect(result).toBe(false);
        });

        test('should return false for negative coordinates outside bounds', () => {
            const result = CollisionDetector.isPointInBounds(-10, 75, 100, 150);
            expect(result).toBe(false);
        });

        test('should return false for invalid parameters', () => {
            const result = CollisionDetector.isPointInBounds('invalid', 75, 100, 150);
            expect(result).toBe(false);
        });
    });

    describe('wrapToScreen', () => {
        let object;

        beforeEach(() => {
            object = { x: 50, y: 75 };
        });

        test('should wrap object when x goes below 0', () => {
            object.x = -5;
            CollisionDetector.wrapToScreen(object, 100, 150);
            expect(object.x).toBe(100);
        });

        test('should wrap object when x goes above width', () => {
            object.x = 105;
            CollisionDetector.wrapToScreen(object, 100, 150);
            expect(object.x).toBe(0);
        });

        test('should wrap object when y goes below 0', () => {
            object.y = -5;
            CollisionDetector.wrapToScreen(object, 100, 150);
            expect(object.y).toBe(150);
        });

        test('should wrap object when y goes above height', () => {
            object.y = 155;
            CollisionDetector.wrapToScreen(object, 100, 150);
            expect(object.y).toBe(0);
        });

        test('should not change object when within bounds', () => {
            const originalX = object.x;
            const originalY = object.y;
            CollisionDetector.wrapToScreen(object, 100, 150);
            expect(object.x).toBe(originalX);
            expect(object.y).toBe(originalY);
        });

        test('should handle invalid object gracefully', () => {
            expect(() => {
                CollisionDetector.wrapToScreen(null, 100, 150);
            }).not.toThrow();
        });

        test('should handle invalid dimensions gracefully', () => {
            expect(() => {
                CollisionDetector.wrapToScreen(object, 'invalid', 150);
            }).not.toThrow();
        });
    });
});