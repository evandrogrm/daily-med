## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Yarn

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn
   ```
3. Copy environment file:
   ```bash
   cp .env.example .env
   ```
4. Start services:
   ```bash
   yarn docker:up
   ```
5. Run the application:
   ```bash
   yarn dev
   ```

## Development Workflow

### Running Tests
```bash
yarn test          # Run all tests
yarn test:watch    # Run tests in watch mode
yarn test:coverage # Run tests with coverage
```

### Linting & Formatting
```bash
yarn lint     # Run ESLint
yarn format   # Format code with Prettier
```

### Docker Commands
```bash
yarn docker:up     # Start all services
yarn docker:down   # Stop and remove all containers
yarn docker:logs   # View container logs
```

## API Endpoints

### Medications
- `GET    /api/medications`       - List all medications
- `GET    /api/medications/:id`   - Get medication details
- `POST   /api/medications`       - Create new medication
- `PUT    /api/medications/:id`   - Update medication
- `DELETE /api/medications/:id`   - Delete medication

## Development Checklist

### Phase 1: Core Setup
- [x] Initialize project with TypeScript
- [x] Configure ESLint & Prettier
- [x] Set up Jest for testing
- [x] Configure Docker with MongoDB
- [x] Basic Express server setup

### Phase 2: Database & Models
- [ ] Create Medication model
- [ ] Set up Mongoose schemas
- [ ] Implement base repository pattern
- [ ] Add data validation

### Phase 3: API Endpoints
- [ ] Implement CRUD operations
- [ ] Add request validation
- [ ] Implement error handling
- [ ] Add pagination and filtering

### Phase 4: Advanced Features
- [ ] Add search functionality
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Set up API documentation
