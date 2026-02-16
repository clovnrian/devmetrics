# DevMetrics

Developer Performance Evaluation Platform - Analyze GitHub commits and evaluate developer performance.

## Overview

DevMetrics is a comprehensive platform designed to help CTOs and development managers evaluate and compare developer performance based on GitHub commit data. It provides detailed analytics and insights that can be used across different teams and codebases.

## Features

- **Dashboard** - Overview of key metrics including total developers, teams, repositories, and average performance scores
- **Developer Profiles** - Individual developer metrics with performance trends, commit history, and score breakdowns
- **Team Analytics** - Compare team performance and track team health metrics
- **Repository Metrics** - Track activity and contributor distribution per repository
- **Commit Analysis** - Detailed commit-level analysis with performance scores based on multiple factors
- **GitHub Integration** - Import commits directly from GitHub repositories

## Performance Scoring

Each commit receives a performance score (0-100) based on:

- **Lines Score** (0-15): Code volume assessment
- **Files Score** (0-10): Change scope evaluation
- **Message Score** (0-10): Commit message quality
- **Quality Indicators** (0-5): Bonus for valuable commit types (fixes, refactoring, tests)

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Material UI for components
- React Query for state management
- Recharts for data visualization

### Backend
- NestJS with TypeScript
- Prisma ORM
- PostgreSQL database
- Swagger/OpenAPI documentation

### Infrastructure
- Supabase for PostgreSQL hosting
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Supabase)
- GitHub Personal Access Token (for importing commits)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/devmetrics.git
cd devmetrics
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/api/.env.example apps/api/.env
# Edit .env with your database URL and GitHub token
```

4. Set up the database:
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
# or: npx prisma db push
```

5. Start development servers:
```bash
# From root directory
npm run dev
```

This starts:
- API server at http://localhost:3000
- Web app at http://localhost:5173
- API docs at http://localhost:3000/api/docs

### Docker Setup

```bash
docker-compose up -d
```

## Usage

1. **Connect GitHub**: Go to Settings and add your GitHub Personal Access Token
2. **Import Data**: Use the commits import feature to fetch commit data
3. **View Analytics**: Explore the dashboard, developers, teams, and commits pages
4. **Export Reports**: Use the data for performance reviews

## API Documentation

Once the server is running, visit http://localhost:3000/api/docs for the interactive Swagger documentation.

### Key Endpoints

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/developers` - List all developers
- `GET /api/teams` - List all teams
- `GET /api/repositories` - List all repositories
- `GET /api/commits` - List commits with scores
- `POST /api/commits/import` - Import commits from GitHub

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE for details
