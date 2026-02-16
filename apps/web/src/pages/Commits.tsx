import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Layout } from '../common/Layout'
import { PerformanceBadge } from '../common/PerformanceBadge'
import { getCommits, getCommitAnalysis, getRepositories, getDevelopers } from '../../api'
import type { Commit, PaginatedResponse, CommitAnalysis, Repository, Developer } from '../../types'

const COLORS = ['#e74c3c', '#f39c12', '#3498db', '#00d9a5']

function CommitsContent() {
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(20)
  const [repositoryId, setRepositoryId] = useState('')
  const [developerId, setDeveloperId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: commits, isLoading: commitsLoading } = useQuery<PaginatedResponse<Commit>>({
    queryKey: ['commits', page, limit, repositoryId, developerId, startDate, endDate],
    queryFn: () => getCommits({
      page: page + 1,
      limit,
      repositoryId: repositoryId || undefined,
      developerId: developerId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  })

  const { data: analysis } = useQuery<CommitAnalysis>({
    queryKey: ['commits', 'analysis', repositoryId, developerId, startDate, endDate],
    queryFn: () => getCommitAnalysis({
      repositoryId: repositoryId || undefined,
      developerId: developerId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  })

  const { data: repositories } = useQuery<{ data: Repository[] }>({
    queryKey: ['repositories', 'all'],
    queryFn: () => getRepositories(1, 100),
  })

  const { data: developers } = useQuery<{ data: Developer[] }>({
    queryKey: ['developers', 'all'],
    queryFn: () => getDevelopers(1, 100),
  })

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Commits Analysis
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Repository</InputLabel>
                <Select
                  value={repositoryId}
                  label="Repository"
                  onChange={(e) => setRepositoryId(e.target.value)}
                >
                  <MenuItem value="">All Repositories</MenuItem>
                  {repositories?.data.map((repo) => (
                    <MenuItem key={repo.id} value={repo.id}>
                      {repo.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Developer</InputLabel>
                <Select
                  value={developerId}
                  label="Developer"
                  onChange={(e) => setDeveloperId(e.target.value)}
                >
                  <MenuItem value="">All Developers</MenuItem>
                  {developers?.data.map((dev) => (
                    <MenuItem key={dev.id} value={dev.id}>
                      {dev.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                label="End Date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Summary Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Score Distribution
              </Typography>
              {analysis ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analysis.distribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#a0a0b0" />
                    <YAxis
                      dataKey="label"
                      type="category"
                      stroke="#a0a0b0"
                      width={80}
                      tick={{ fontSize: 11 }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="count" name="Commits">
                      {analysis.distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton variant="rectangular" height={200} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Metrics */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Summary Metrics
              </Typography>
              {analysis ? (
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {analysis.summary.totalCommits}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Commits
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {analysis.summary.avgScore}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Score
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {analysis.summary.avgAdditions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Additions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {analysis.summary.avgFilesChanged}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Files/Commit
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Skeleton variant="rectangular" height={150} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Commits Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Commits
              </Typography>
              {commitsLoading ? (
                <Box>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Commit</TableCell>
                          <TableCell>Author</TableCell>
                          <TableCell>Repository</TableCell>
                          <TableCell align="center">Score</TableCell>
                          <TableCell align="center">Files</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {commits?.data.map((commit) => (
                          <TableRow key={commit.id} hover>
                            <TableCell>
                              <Tooltip title={commit.message}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: '"JetBrains Mono", monospace',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {commit.sha.substring(0, 7)}
                                </Typography>
                              </Tooltip>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: 'block',
                                  maxWidth: 300,
                                }}
                              >
                                {commit.message}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {commit.developer.username}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {commit.repository.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <PerformanceBadge score={commit.score} />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                {commit.filesChanged}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(commit.committedAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={commits?.meta.total || 0}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={limit}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 20, 50]}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export function Commits() {
  return (
    <Layout>
      <CommitsContent />
    </Layout>
  )
}
