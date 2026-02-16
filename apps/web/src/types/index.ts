export interface Developer {
  id: string
  githubId: string
  username: string
  avatarUrl: string | null
  email: string | null
  name: string | null
  teams: Team[]
  commitCount: number
  avgScore: number
  recentScore: number
  lastActive: string | null
}

export interface DeveloperDetail extends Developer {
  createdAt: string
  metrics: {
    totalCommits: number
    recentCommits: number
    avgScore: number
    recentScore: number
    totalAdditions: number
    totalDeletions: number
    totalFilesChanged: number
    codeChurn: number
  }
  performanceTrend: Array<{
    month: string
    avgScore: number
  }>
  recentCommits: Array<Commit>
}

export interface Team {
  id: string
  name: string
  description: string | null
  members: Developer[]
  repositories: Repository[]
  memberCount: number
  repositoryCount: number
  avgScore: number
  trend: 'up' | 'down' | 'neutral'
  createdAt?: string
}

export interface TeamDetail extends Team {
  metrics: {
    memberCount: number
    repositoryCount: number
    avgScore: number
  }
}

export interface Repository {
  id: string
  githubId: string
  name: string
  fullName: string
  owner: string
  url: string
  language: string | null
  teams: Team[]
  commitCount: number
  lastUpdated: string
}

export interface RepositoryDetail extends Repository {
  metrics: {
    totalCommits: number
    avgScore: number
    contributorCount: number
  }
  recentCommits: Array<Commit>
  createdAt: string
  updatedAt: string
}

export interface Commit {
  id: string
  sha: string
  message: string
  author: string
  authorEmail: string | null
  additions: number
  deletions: number
  filesChanged: number
  score: number
  scoreBreakdown: CommitScoreBreakdown | null
  committedAt: string
  developer: {
    id: string
    username: string
    avatarUrl: string | null
    name: string | null
  }
  repository: {
    id: string
    name: string
    fullName: string
  }
}

export interface CommitScoreBreakdown {
  linesScore: number
  filesScore: number
  messageScore: number
  consistencyBonus: number
  qualityIndicators: number
}

export interface DashboardStats {
  totalDevelopers: number
  totalTeams: number
  totalRepositories: number
  totalCommits: number
  avgScore: number
}

export interface PerformanceTrend {
  month: string
  avgScore: number
  commits: number
}

export interface TopPerformer {
  id: string
  username: string
  avatarUrl: string | null
  name: string | null
  avgScore: number
  commitCount: number
}

export interface RecentActivity {
  id: string
  sha: string
  message: string
  score: number
  committedAt: string
  developer: {
    username: string
    avatarUrl: string | null
    name: string | null
  }
  repository: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CommitAnalysis {
  summary: {
    totalCommits: number
    avgScore: number
    avgAdditions: number
    avgDeletions: number
    avgFilesChanged: number
  }
  distribution: Array<{
    range: string
    label: string
    count: number
    percentage: number
  }>
}
