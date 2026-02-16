import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
  Skeleton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Groups as GroupsIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'
import { Layout } from '../common/Layout'
import { PerformanceBadge } from '../common/PerformanceBadge'
import { getTeams } from '../../api'
import type { Team, PaginatedResponse } from '../../types'

function TeamsContent() {
  const navigate = useNavigate()
  const [page] = useState(0)
  const [limit] = useState(20)

  const { data, isLoading } = useQuery<PaginatedResponse<Team>>({
    queryKey: ['teams', page, limit],
    queryFn: () => getTeams(page + 1, limit),
  })

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: 'success.main' }} />
      case 'down':
        return <TrendingDown sx={{ color: 'error.main' }} />
      default:
        return <TrendingFlat sx={{ color: 'text.secondary' }} />
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Teams
      </Typography>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : data?.data && data.data.length > 0 ? (
        <Grid container spacing={3}>
          {data.data.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  },
                }}
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'secondary.main',
                          width: 40,
                          height: 40,
                        }}
                      >
                        <GroupsIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {team.name}
                        </Typography>
                        {team.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {team.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {getTrendIcon(team.trend)}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <GroupsIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {team.memberCount} members
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StorageIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {team.repositoryCount} repos
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Team Score
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{
                        color:
                          team.avgScore >= 90
                            ? 'success.main'
                            : team.avgScore >= 70
                            ? 'primary.main'
                            : team.avgScore >= 50
                            ? 'warning.main'
                            : 'error.main',
                      }}
                    >
                      {team.avgScore}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
              }}
            >
              <Typography color="text.secondary">
                No teams yet. Create a team to get started.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export function Teams() {
  return (
    <Layout>
      <TeamsContent />
    </Layout>
  )
}
