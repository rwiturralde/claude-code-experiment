# Asteroids Game

A modern implementation of the classic Asteroids arcade game using HTML5 Canvas and ES6 modules. Built with modular architecture, comprehensive testing, error handling, and logging.

## Game Controls

- **Arrow Keys**: Move the ship (left/right to rotate, up/down for thrust)
- **Spacebar**: Shoot bullets
- **R**: Restart the game

## Project Structure

```
asteroids-game/
├── src/
│   ├── css/
│   │   └── styles.css          # Game styling
│   └── js/
│       ├── config/
│       │   └── gameConfig.js   # Game configuration constants
│       ├── core/
│       │   ├── CollisionDetector.js  # Collision detection system
│       │   ├── Game.js         # Main game class
│       │   └── InputHandler.js # Input management
│       ├── entities/
│       │   ├── Asteroid.js     # Asteroid entity
│       │   ├── Bullet.js       # Bullet entity
│       │   └── Ship.js         # Ship entity
│       ├── utils/
│       │   └── logger.js       # Logging utility
│       └── main.js             # Application entry point
├── tests/
│   ├── core/
│   │   └── CollisionDetector.test.js
│   └── entities/
│       ├── Asteroid.test.js
│       ├── Bullet.test.js
│       └── Ship.test.js
├── infrastructure/             # AWS deployment (CloudFormation, CI/CD)
├── index.html                  # Main HTML file
└── package.json                # Dependencies and scripts
```

## Architecture Overview

### Core Components

- **Game** (`src/js/core/Game.js`): Main game loop, state management, and entity coordination
- **InputHandler** (`src/js/core/InputHandler.js`): Centralized input processing and event handling
- **CollisionDetector** (`src/js/core/CollisionDetector.js`): Collision detection algorithms

### Entities

- **Ship** (`src/js/entities/Ship.js`): Player-controlled spaceship with physics and rendering
- **Bullet** (`src/js/entities/Bullet.js`): Projectiles fired by the ship
- **Asteroid** (`src/js/entities/Asteroid.js`): Destructible obstacles with fragment generation

### Utilities

- **Logger** (`src/js/utils/logger.js`): Multi-level logging system (ERROR, WARN, INFO, DEBUG)
- **Config** (`src/js/config/gameConfig.js`): Centralized configuration management

## Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd asteroids-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   This opens `http://localhost:8080` in your browser automatically.

## Development

### Available Scripts

- `npm start` / `npm run serve`: Start the HTTP server
- `npm run dev`: Start development server with auto-open
- `npm test`: Run the test suite
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Generate test coverage report
- `npm run lint`: Run ESLint on source files
- `npm run lint:fix`: Auto-fix linting issues
- `npm run build`: Run lint and tests (build validation)

### Code Quality

- **ESLint**: Code linting with recommended rules
- **Jest**: Unit testing with jsdom environment and jest-canvas-mock
- **JSDoc**: Inline documentation for public methods
- **Error Handling**: Try-catch blocks and graceful error recovery
- **Logging**: Structured logging at appropriate levels

### Logging

The application uses a custom logging system with four levels: ERROR, WARN, INFO, DEBUG.

Log level is automatically set based on environment:
- Production: INFO level
- Development (localhost): DEBUG level

Access logs in the browser console or programmatically:
```javascript
window.logger.getLogs();
window.logger.setLevel(LogLevel.DEBUG);
```

## Configuration

Game settings can be modified in `src/js/config/gameConfig.js`:

- Canvas dimensions
- Game physics constants (thrust, friction, rotation speed)
- Entity properties (bullet speed, asteroid sizes, etc.)
- Visual settings (colors, line width)

## Deployment

This project includes infrastructure-as-code for deployment to AWS as a static website with a CI/CD pipeline.

### Quick Deployment

1. **Prerequisites**: AWS CLI configured, GitHub personal access token, GitHub repository
2. **Deploy**:
   ```bash
   cp infrastructure/parameters-template.json infrastructure/parameters.json
   # Edit parameters.json with your GitHub details
   ./infrastructure/deploy.sh --environment prod
   ```
3. **Access**: Check CloudFormation stack outputs for S3 or CloudFront URLs

### Infrastructure Components

- **S3 Static Website**: Hosts the game files
- **CodePipeline**: CI/CD pipeline with GitHub integration
- **CodeBuild**: Runs linting, testing, and deployment
- **CloudFront**: Optional CDN for global distribution
- **CloudWatch**: Monitoring and logging

### Pipeline Stages

1. **Source**: Pulls code from GitHub repository
2. **Build & Test**: Installs dependencies, runs `npm run lint` and `npm run test:coverage`, and deploys to S3 if all checks pass

For detailed deployment instructions, see [infrastructure/DEPLOYMENT.md](infrastructure/DEPLOYMENT.md).

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with tests and JSDoc comments
4. Run `npm test` and `npm run lint`
5. Submit a pull request

Merges to the main branch automatically deploy to production via the CI/CD pipeline.

## License

MIT License