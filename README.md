# DailyMed API

A RESTful API for managing medication information with MongoDB, Node.js, and TypeScript. This application provides endpoints for managing medications, including CRUD operations and indication extraction using AI.

## Features

- **Medication Management**: Create, read, update, and delete medications
- **Search**: Search medications by name, description, or indications
- **Indication Extraction**: Extract and map medication indications to ICD-10 codes using AI
- **Validation**: Request validation using Zod schemas
- **Testing**: Comprehensive test suite with Jest
- **Containerization**: Docker support for easy development and deployment

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI/ML**: LangChain for indication extraction
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest with Supertest
- **Linting/Formatting**: ESLint & Prettier
- **Dependency Injection**: tsyringe
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Yarn 1.22 or higher
- Docker 20.10+ & Docker Compose 2.0+
- MongoDB 6.0+ (or use Docker)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/daily-med-api.git
   cd daily-med-api
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

### Running the Application

#### Development Mode

```bash
# Start MongoDB using Docker
docker-compose up -d mongo

# Start the development server
yarn dev
```

The API will be available at `http://localhost:3000/api`

#### Production Mode

```bash
# Build the application
yarn build

# Start the production server
yarn start
```

### Using Docker

Start the entire stack (API + MongoDB):

```bash
docker-compose up -d
```

Stop the stack:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f
```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Medications

- `POST /medications` - Create a new medication
- `GET /medications` - List all medications
- `GET /medications/:id` - Get a medication by ID
- `PUT /medications/:id` - Update a medication
- `DELETE /medications/:id` - Delete a medication
- `GET /medications/search?q=query` - Search medications
- `POST /medications/extract-indications` - Extract and map indications from text

#### Health Check

- `GET /health` - Check API status

### Example Requests

**Create a new medication:**

```http
POST /api/medications
Content-Type: application/json

{
  "name": "Ibuprofen",
  "dosage": "200mg",
  "frequency": "Every 6 hours",
  "description": "Pain reliever and fever reducer",
  "activeIngredients": ["Ibuprofen"],
  "sideEffects": ["Upset stomach", "Heartburn", "Dizziness"]
}
```

**Extract indications from text:**

```http
POST /api/medications/extract-indications
Content-Type: application/json

{
  "text": "Ibuprofen is used to relieve pain from various conditions such as headache, dental pain, menstrual cramps, muscle aches, or arthritis. It is also used to reduce fever and to relieve minor aches and pain due to the common cold or flu."
}
```

## Testing

Run the test suite:

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run integration tests only
yarn test:integration

# Run unit tests only
yarn test:unit
```

## Development

### Code Style

This project uses ESLint and Prettier for code style and formatting.

```bash
# Check for linting errors
yarn lint

# Fix linting errors
yarn lint:fix

# Format code
yarn format
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
- [x] Add request validation
- [ ] Implement error handling
- [ ] Add pagination and filtering

### Phase 4: Advanced Features
- [ ] Add search functionality
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Set up API documentation
