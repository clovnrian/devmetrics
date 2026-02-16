import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats').then(res => res.data)
export const getPerformanceTrend = (months?: number) => 
  api.get('/dashboard/trend', { params: { months } }).then(res => res.data)
export const getTopPerformers = (limit?: number) => 
  api.get('/dashboard/top-performers', { params: { limit } }).then(res => res.data)
export const getRecentActivity = (limit?: number) => 
  api.get('/dashboard/recent-activity', { params: { limit } }).then(res => res.data)

// Developers
export const getDevelopers = (page?: number, limit?: number, search?: string) =>
  api.get('/developers', { params: { page, limit, search } }).then(res => res.data)
export const getDeveloper = (id: string) => 
  api.get(`/developers/${id}`).then(res => res.data)

// Teams
export const getTeams = (page?: number, limit?: number) =>
  api.get('/teams', { params: { page, limit } }).then(res => res.data)
export const getTeam = (id: string) => 
  api.get(`/teams/${id}`).then(res => res.data)

// Repositories
export const getRepositories = (page?: number, limit?: number) =>
  api.get('/repositories', { params: { page, limit } }).then(res => res.data)
export const getRepository = (id: string) => 
  api.get(`/repositories/${id}`).then(res => res.data)

// Commits
export const getCommits = (params: {
  page?: number
  limit?: number
  repositoryId?: string
  developerId?: string
  startDate?: string
  endDate?: string
}) => api.get('/commits', { params }).then(res => res.data)

export const getCommitAnalysis = (params: {
  repositoryId?: string
  developerId?: string
  startDate?: string
  endDate?: string
}) => api.get('/commits/analysis', { params }).then(res => res.data)

export const importCommits = (data: {
  repositoryId: string
  owner: string
  repo: string
  branch?: string
}) => api.post('/commits/import', data).then(res => res.data)

// GitHub
export const verifyGithubToken = () => api.get('/github/verify').then(res => res.data)
export const getGithubUser = () => api.get('/github/user').then(res => res.data)
export const getGithubRepositories = () => api.get('/github/repositories').then(res => res.data)
export const setGithubToken = (token: string) => 
  api.post('/github/token', { token }).then(res => res.data)

// Settings
export const getSettings = () => api.get('/settings').then(res => res.data)
export const updateSettings = (data: { githubToken?: string; preferences?: any }) =>
  api.put('/settings', data).then(res => res.data)

export default api
