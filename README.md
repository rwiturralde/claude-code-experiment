# Asteroids Game

A modern implementation of the classic Asteroids arcade game using HTML5 Canvas and ES6 modules. Built with software engineering best practices including modular architecture, comprehensive testing, error handling, and logging.

## Features

- **Classic Gameplay**: Experience the nostalgic Asteroids arcade game with smooth controls and physics
- **Modern Architecture**: Built with ES6 modules for maintainable and scalable code
- **Comprehensive Testing**: Full test coverage with Jest
- **Error Handling**: Robust error handling throughout the application
- **Logging System**: Multi-level logging for debugging and monitoring
- **Responsive Design**: Optimized for different screen sizes

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
│   │   └── CollisionDetector.test.js  # Collision detection tests
│   └── entities/
│       ├── Asteroid.test.js    # Asteroid tests
│       ├── Bullet.test.js      # Bullet tests
│       └── Ship.test.js        # Ship tests
├── docs/                       # Documentation (empty)
├── index.html                  # Main HTML file
└── package.json               # Dependencies and scripts
```

## Architecture Overview

### Core Components

1. **Game (`src/js/core/Game.js`)**: Main game loop, state management, and entity coordination
2. **InputHandler (`src/js/core/InputHandler.js`)**: Centralized input processing and event handling
3. **CollisionDetector (`src/js/core/CollisionDetector.js`)**: Collision detection algorithms and utilities

### Entities

1. **Ship (`src/js/entities/Ship.js`)**: Player-controlled spaceship with physics and rendering
2. **Bullet (`src/js/entities/Bullet.js`)**: Projectiles fired by the ship
3. **Asteroid (`src/js/entities/Asteroid.js`)**: Destructible obstacles with fragment generation

### Utilities

1. **Logger (`src/js/utils/logger.js`)**: Multi-level logging system (ERROR, WARN, INFO, DEBUG)
2. **Config (`src/js/config/gameConfig.js`)**: Centralized configuration management

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

4. Open your browser and navigate to `http://localhost:8080`

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

This project maintains high code quality through:

- **ESLint**: Code linting with recommended rules
- **Jest**: Comprehensive unit testing
- **JSDoc**: Inline documentation for all public methods
- **Error Handling**: Try-catch blocks and graceful error recovery
- **Logging**: Structured logging at appropriate levels

### Testing

The project uses Jest for testing with the following setup:
- **Environment**: jsdom for DOM simulation
- **Mocking**: Canvas API mocking with jest-canvas-mock
- **Coverage**: Comprehensive coverage reporting
- **Test Organization**: Tests mirror the source code structure

Run tests:
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Logging

The application uses a custom logging system with four levels:

- **ERROR**: Critical errors that affect functionality
- **WARN**: Warnings that don't break functionality
- **INFO**: General information about game state
- **DEBUG**: Detailed debugging information

Log level is automatically set based on environment:
- Production: INFO level
- Development (localhost): DEBUG level

Access logs in browser console or programmatically:
```javascript
// Access the logger
window.logger.getLogs();

// Change log level
window.logger.setLevel(LogLevel.DEBUG);
```

## Configuration

Game settings can be modified in `src/js/config/gameConfig.js`:

- Canvas dimensions
- Game physics constants
- Entity properties (ship speed, bullet speed, etc.)
- Collision detection parameters
- Visual settings

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Requires ES6 module support and Canvas API.

## Deployment

This project includes infrastructure-as-code for deployment to AWS as a static website with CI/CD pipeline.

### Quick Deployment

1. **Prerequisites**:
   - AWS CLI configured with appropriate permissions
   - GitHub personal access token with repo access
   - GitHub repository containing this code

2. **Deploy to AWS**:
   ```bash
   # Copy and configure parameters
   cp infrastructure/parameters-template.json infrastructure/parameters.json
   # Edit parameters.json with your GitHub details
   
   # Deploy using the deployment script
   ./infrastructure/deploy.sh --environment prod
   ```

3. **Access your deployed game**:
   - Direct S3 URL: Check CloudFormation stack outputs
   - CloudFront URL: Available if CloudFront is enabled

### Infrastructure Components

- **S3 Static Website**: Hosts the game files
- **CodePipeline**: CI/CD pipeline with GitHub integration
- **CodeBuild**: Runs linting, testing, and deployment
- **CloudFront**: Optional CDN for global distribution
- **CloudWatch**: Monitoring and logging

### Pipeline Stages

1. **Source**: Pulls code from GitHub repository
2. **Build & Test**: 
   - Installs dependencies
   - Runs `npm run lint` (fails pipeline if errors)
   - Runs `npm run test` (fails pipeline if tests fail)
   - Deploys to S3 if all checks pass

For detailed deployment instructions, see [infrastructure/DEPLOYMENT.md](infrastructure/DEPLOYMENT.md).

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -am 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

### CI/CD Integration

When contributing to a deployed version:
- All pull requests trigger the CI/CD pipeline
- Code must pass linting and testing to be deployable
- Merges to main branch automatically deploy to production

### Code Style Guidelines

- Use ES6+ features and modules
- Follow existing naming conventions
- Add JSDoc comments for public methods
- Include unit tests for new functionality
- Handle errors gracefully with appropriate logging
- Maintain separation of concerns

## License

MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Asteroids game by Atari (1979)
- Modern web technologies and best practices
- Open source testing and development tools