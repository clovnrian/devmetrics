# DevMetrics - Developer Performance Evaluation Platform

## 1. Project Overview

**Project Name:** DevMetrics

**Project Type:** Full-stack Web Application

**Core Functionality:** A platform that evaluates developer performance by analyzing GitHub commit data, providing performance metrics and analytics that can be compared across teams and codebases. Designed for CTOs and development managers to assess individual and team performance.

**Target Users:**
- CTOs evaluating overall engineering performance
- Development Managers comparing team and individual performance
- Engineering Leads tracking sprint/quarterly developer metrics

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** Material UI (MUI) - enterprise-ready, maintainable
- **State Management:** React Query + Context API
- **Charts:** Recharts for analytics visualizations

### Backend
- **Framework:** NestJS with TypeScript
- **Database:** PostgreSQL (Supabase provides hosted PostgreSQL)
- **ORM:** Prisma
- **API Style:** RESTful with OpenAPI/Swagger documentation

### Infrastructure
- **Hosting:** Supabase (PostgreSQL + optional hosting)
- **CI/CD:** GitHub Actions
- **GitHub Integration:** GitHub REST API v3

---

## 3. UI/UX Specification

### Color Palette
```css
--primary: #1a1a2e;        /* Deep navy - main background */
--primary-light: #16213e; /* Slightly lighter navy */
--secondary: #0f3460;     /* Dark blue accent */
--accent: #e94560;        /* Vibrant coral/red - CTAs, highlights */
--accent-secondary: #533483; /* Purple accent */
--success: #00d9a5;       /* Teal green - positive metrics */
--warning: #f39c12;       /* Orange - warnings */
--error: #e74c3c;         /* Red - errors/negative */
--text-primary: #ffffff;  /* White text */
--text-secondary: #a0a0b0; /* Muted gray text */
--surface: #1f2937;       /* Card/panel backgrounds */
--border: #374151;        /* Borders */
```

### Typography
- **Primary Font:** "Inter" - clean, readable for data
- **Headings:** "Space Grotesk" - modern, distinctive
- **Monospace:** "JetBrains Mono" - code/commits display

### Layout Structure

#### Navigation (Sidebar)
- Fixed left sidebar (240px width)
- Logo at top
- Navigation items:
  - Dashboard (home)
  - Developers
  - Teams
  - Repositories
  - Commits Analysis
  - Settings
- Collapsed mode on mobile (icon-only)

#### Pages

**1. Dashboard (Home)**
- Overview cards: Total Developers, Active Teams, Repositories Tracked, Average Performance Score
- Performance trend chart (line chart - last 12 months)
- Top performers leaderboard (table)
- Recent activity feed
- Quick filters: Date range, Team selector

**2. Developers Page**
- Searchable/filterable table of all developers
- Columns: Avatar, Name, Email, Team, Avg Performance Score, Commits (period), Last Active
- Click row to view individual developer profile
- Sort by any column
- Bulk actions: Export, Add to team

**3. Developer Detail Profile**
- Header: Avatar, Name, Role, Team, Join date
- Performance score breakdown (donut chart)
- Commit history timeline
- Metrics cards: Code churn, Review participation, Bug introduction rate
- Performance over time (line chart)
- Recent commits table with individual scores

**4. Teams Page**
- Grid of team cards showing:
  - Team name, member count
  - Average performance score (color-coded)
  - Repository count
  - Trend arrow
- Team comparison chart (bar chart)

**5. Team Detail**
- Team info header
- Member list with individual scores
- Team aggregate metrics
- Repository list for team
- Performance trend chart

**6. Repositories Page**
- Table: Repository Name, Owner, Team(s), Language, Commits, Last Updated
- Click to see repo-specific metrics

**7. Commits Analysis Page**
- Main feature for detailed commit analysis
- Filter controls: Repository, Developer, Date range, Branch
- Commit list with performance scores
- Score breakdown tooltip on each commit
- Bulk import commits feature

**8. Settings**
- GitHub connection setup (API token)
- Team management
- Repository management (add/remove repos to track)
- User preferences

### Components

**MetricCard**
- Title, value, trend indicator
- Optional sparkline
- Hover: slight elevation

**PerformanceBadge**
- Color-coded badge based on score:
  - 90-100: Success (green)
  - 70-89: Good (blue)
  - 50-69: Warning (orange)
  - 0-49: Error (red)

**DataTable**
- Sortable columns
- Pagination
- Row selection
- Search/filter bar
- Export button

**CommitScoreCard**
- Commit hash (truncated)
- Author avatar
- Timestamp
- Performance score (large, colored)
- Score breakdown (lines added, complexity, files touched)

### Animations
- Page transitions: Fade in (200ms ease-out)
- Cards: Hover scale (1.02) with shadow
- Charts: Animated on load (500ms)
- Loading: Skeleton screens
- Modals: Scale + fade

---

## 4. Functionality Specification

### Core Features

#### F1: GitHub Integration
- Authenticate with GitHub Personal Access Token
- Fetch repositories (user-owned + organization)
- Fetch commits for selected repositories
- Fetch contributors per repository
- Webhook support for real-time updates (future)
- Rate limit handling with caching

#### F2: Commit Analysis Engine
Each commit gets a performance score (0-100) based on:

**Base Metrics:**
- Lines added (positive: more is often better, but up to a point)
- Lines deleted (positive: cleanup/refactoring)
- Files touched (moderate is good - too few = trivial, too many = risky)
- Commit message quality (length, format, ticket references)

**Weighted Factors:**
- Consistency (regular commits vs bursts)
- Code review participation (if PR data available)
- Bug fix ratio (commit messages mentioning "fix", "bug", "hotfix")
- Test coverage changes (if detected)

**Score Formula:**
```
Base Score = 50 (neutral)
+ Lines Score (0-15): Based on productive code volume
+ Files Score (0-10): Based on appropriate scope
+ Message Score (0-10): Based on commit message quality
+ Consistency Bonus (0-10): Based on commit frequency patterns
+ Quality Indicators (0-5): Fix mentions, refactoring indicators
```

#### F3: Developer Profiles
- Aggregate all commits per developer
- Calculate rolling averages (30, 90, 365 days)
- Track performance trends
- Identify strengths and areas for improvement

#### F4: Team Analytics
- Aggregate developer scores within teams
- Calculate team velocity and consistency
- Compare teams on same metrics
- Team health indicators

#### F5: Repository Metrics
- Overall health score
- Contributor distribution
- Activity timeline
- Language breakdown

### API Endpoints

```
GET    /api/dashboard          - Dashboard overview stats
GET    /api/developers         - List all developers
GET    /api/developers/:id     - Developer detail with commits
GET    /api/teams              - List all teams
GET    /api/teams/:id          - Team detail with members
GET    /api/repositories       - List tracked repositories
GET    /api/repositories/:id   - Repository detail
GET    /api/commits            - List commits with scores
GET    /api/commits/analysis   - Detailed commit analysis
POST   /api/github/import      - Import commits from GitHub
POST   /api/github/connect     - Save GitHub token
GET    /api/settings           - Get user settings
PUT    /api/settings           - Update settings
```

### Data Models

```prisma
model Developer {
  id            String    @id @default(cuid())
  githubId      String    @unique
  username      String
  avatarUrl     String?
  email         String?
  name          String?
  teams         TeamMember[]
  commits       Commit[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Team {
  id            String    @id @default(cuid())
  name          String
  description   String?
  members       TeamMember[]
  repositories  TeamRepository[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model TeamMember {
  id            String    @id @default(cuid())
  teamId        String
  developerId   String
  role          String    @default("member")
  team          Team      @relation(fields: [teamId], references: [id])
  developer     Developer @relation(fields: [developerId], references: [id])
  joinedAt      DateTime  @default(now())

  @@unique([teamId, developerId])
}

model Repository {
  id            String    @id @default(cuid())
  githubId      String    @unique
  name          String
  fullName      String    @unique
  owner         String
  url           String
  language      String?
  teams         TeamRepository[]
  commits       Commit[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model TeamRepository {
  id            String    @id @default(cuid())
  teamId        String
  repositoryId  String
  team          Team      @relation(fields: [teamId], references: [id])
  repository    Repository @relation(fields: [repositoryId], references: [id])

  @@unique([teamId, repositoryId])
}

model Commit {
  id              String    @id @default(cuid())
  sha             String    @unique
  message         String
  author          String
  authorEmail     String?
  additions       Int       @default(0)
  deletions       Int       @default(0)
  filesChanged    Int       @default(0)
  score           Float     @default(50)
  scoreBreakdown  Json?
  committedAt     DateTime
  repositoryId    String
  developerId     String
  repository      Repository @relation(fields: [repositoryId], references: [id])
  developer       Developer  @relation(fields: [developerId], references: [id])
  createdAt       DateTime  @default(now())

  @@index([developerId, committedAt])
  @@index([repositoryId, committedAt])
}

model Settings {
  id              String    @id @default(cuid())
  githubToken     String?
  userId          String    @unique
  preferences     Json      @default("{}")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 5. Acceptance Criteria

### Dashboard
- [ ] Shows 4 metric cards with real data
- [ ] Displays performance trend chart (12 months)
- [ ] Shows top 10 performers leaderboard
- [ ] Recent activity shows last 5 commits
- [ ] Filters work correctly (date range, team)

### Developers
- [ ] Table displays all developers with pagination
- [ ] Search filters by name/email
- [ ] Sorting works on all columns
- [ ] Click navigates to developer detail

### Developer Profile
- [ ] Shows all profile information
- [ ] Performance donut chart renders
- [ ] Commit history shows with scores
- [ ] Timeline displays correctly

### Teams
- [ ] Team cards display with correct metrics
- [ ] Click navigates to team detail
- [ ] Team comparison chart works

### Commits Analysis
- [ ] Filters work (repo, developer, date)
- [ ] Commits display with scores
- [ ] Score breakdown visible on hover/click

### GitHub Integration
- [ ] Can connect GitHub account with token
- [ ] Can import commits from repositories
- [ ] Rate limiting handled gracefully

### General
- [ ] Responsive design works on tablet+
- [ ] Loading states show skeletons
- [ ] Error states display user-friendly messages
- [ ] Dark theme consistent throughout

---

## 6. Project Structure

```
devmetrics/
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── api/                 # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── prisma/
│   │   │   ├── modules/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── developers/
│   │   │   │   ├── teams/
│   │   │   │   ├── repositories/
│   │   │   │   ├── commits/
│   │   │   │   ├── github/
│   │   │   │   └── settings/
│   │   │   └── common/
│   │   ├── test/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── api/
│       │   ├── components/
│       │   │   ├── common/
│       │   │   ├── dashboard/
│       │   │   ├── developers/
│       │   │   ├── teams/
│       │   │   └── commits/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── theme/
│       │   └── types/
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
│
├── docker-compose.yml
├── package.json             # Root package.json for workspaces
├── turbo.json              # Turborepo config
├── tsconfig.base.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 7. Deployment

### GitHub Actions CI/CD
- **Trigger:** Push to main, PR to main
- **Jobs:**
  1. Lint & Type Check (both apps)
  2. Build (both apps)
  3. Test (backend with coverage)

### Supabase Setup
- Create PostgreSQL database
- Run Prisma migrations
- Configure connection pooling

### Environment Variables
```
DATABASE_URL=postgresql://...
GITHUB_TOKEN=ghp_...
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```
