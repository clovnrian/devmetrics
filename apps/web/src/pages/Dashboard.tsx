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
  Avatar,
  Paper,
  Skeleton,
  Chip,
} from '@mui/material'
import {
  People as PeopleIcon,
  Groups as GroupsIcon,
  Storage as StorageIcon,
  Commit as CommitIcon,
  Score as ScoreIcon,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Layout } from '../common/Layout'
import { MetricCard } from '../common/MetricCard'
import { PerformanceBadge } from '../common/PerformanceBadge'
import { getDashboardStats, getPerformanceTrend, getTopPerformers, getRecentActivity } from '../../api'
import type { DashboardStats, PerformanceTrend, TopPerformer, RecentActivity } from '../../types'

function DashboardContent() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  })

  const { data: trend, isLoading: trendLoading } = useQuery<PerformanceTrend[]>({
    queryKey: ['dashboard', 'trend'],
    queryFn: () => getPerformanceTrend(12),
  })

  const { data: topPerformers, isLoading: performersLoading } = useQuery<TopPerformer[]>({
    queryKey: ['dashboard', 'top-performers'],
    queryFn: () => getTopPerformers(10),
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery<RecentActivity[]>({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => getRecentActivity(5),
  })

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          {statsLoading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <MetricCard
              title="Total Developers"
              value={stats?.totalDevelopers || 0}
              icon={<PeopleIcon />}
              color="primary.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          {statsLoading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <MetricCard
              title="Active Teams"
              value={stats?.totalTeams || 0}
              icon={<GroupsIcon />}
              color="secondary.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          {statsLoading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <MetricCard
              title="Repositories"
              value={stats?.totalRepositories || 0}
              icon={<StorageIcon />}
              color="warning.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          {statsLoading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <MetricCard
              title="Total Commits"
              value={stats?.totalCommits || 0}
              icon={<CommitIcon />}
              color="success.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          {statsLoading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <MetricCard
              title="Avg Score"
              value={Math.round(stats?.avgScore || 0)}
              icon={<ScoreIcon />}
              color="error.main"
              trend="neutral"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Performance Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Performance Trend
              </Typography>
              {trendLoading ? (
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="month"
                      stroke="#a0a0b0"
                      tick={{ fill: '#a0a0b0', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#a0a0b0"
                      tick={{ fill: '#a0a0b0', fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: 8,
                      }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#e94560"
                      strokeWidth={3}
                      dot={{ fill: '#e94560', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#e94560' }}
                      name="Avg Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              {activityLoading ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : recentActivity && recentActivity.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentActivity.map((activity) => (
                    <Paper
                      key={activity.id}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar
                          src={activity.developer.avatarUrl || undefined}
                          sx={{ width: 28, height: 28 }}
                        >
                          {activity.developer.username[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {activity.developer.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.repository}
                          </Typography>
                        </Box>
                        <PerformanceBadge score={activity.score} />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {activity.message}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                  }}
                >
                  <Typography color="text.secondary">
                    No recent activity
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Performers
              </Typography>
              {performersLoading ? (
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              ) : topPerformers && topPerformers.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Developer</TableCell>
                        <TableCell>Commits</TableCell>
                        <TableCell>Avg Score</TableCell>
                        <TableCell>Performance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topPerformers.map((performer, index) => (
                        <TableRow key={performer.id} hover>
                          <TableCell>
                            <Chip
                              label={index + 1}
                              size="small"
                              sx={{
                                bgcolor:
                                  index === 0
                                    ? '#f39c12'
                                    : index === 1
                                    ? '#bdc3c7'
                                    : index === 2
                                    ? '#cd6133'
                                    : 'transparent',
                                color: index < 3 ? 'white' : 'text.primary',
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={performer.avatarUrl || undefined}>
                                {performer.username[0].toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {performer.name || performer.username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  @{performer.username}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{performer.commitCount}</TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                color:
                                  performer.avgScore >= 90
                                    ? 'success.main'
                                    : performer.avgScore >= 70
                                    ? 'primary.main'
                                    : performer.avgScore >= 50
                                    ? 'warning.main'
                                    : 'error.main',
                              }}
                            >
                              {performer.avgScore}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <PerformanceBadge score={performer.avgScore} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                  }}
                >
                  <Typography color="text.secondary">
                    No performer data yet. Import commits to see rankings.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export function Dashboard() {
  return (
    <Layout>
      <DashboardContent />
    </Layout>
  )
}
