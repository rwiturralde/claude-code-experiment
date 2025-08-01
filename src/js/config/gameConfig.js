/**
 * Game configuration constants
 * Centralized configuration for all game settings
 */

export const GAME_CONFIG = {
    // Canvas dimensions
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Game settings
    INITIAL_LIVES: 3,
    INITIAL_ASTEROID_COUNT: 5,
    
    // Ship settings
    SHIP: {
        THRUST_POWER: 0.3,
        FRICTION: 0.98,
        ROTATION_SPEED: 0.1,
        COLLISION_RADIUS: 10,
        RESPAWN_SAFETY_DISTANCE: 150
    },
    
    // Bullet settings
    BULLET: {
        SPEED: 7,
        LIFETIME: 60, // frames
        SIZE: 2
    },
    
    // Asteroid settings
    ASTEROID: {
        SIZES: {
            LARGE: { radius: 40, points: 20 },
            MEDIUM: { radius: 25, points: 50 },
            SMALL: { radius: 15, points: 100 }
        },
        MAX_SPEED: 2,
        SHAPE_VARIANCE: 0.3,
        SHAPE_POINTS: 8
    },
    
    // Visual settings
    GRAPHICS: {
        BACKGROUND_COLOR: '#000',
        FOREGROUND_COLOR: '#fff',
        BORDER_COLOR: '#333',
        LINE_WIDTH: 2
    },
    
    // Input settings
    INPUT: {
        KEYS: {
            LEFT: 'ArrowLeft',
            RIGHT: 'ArrowRight',
            UP: 'ArrowUp',
            DOWN: 'ArrowDown',
            SHOOT: 'Space',
            RESTART: 'KeyR'
        }
    }
};