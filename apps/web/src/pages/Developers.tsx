import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
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
  TextField,
  InputAdornment,
  TablePagination,
  Chip,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { Layout } from '../common/Layout'
import { PerformanceBadge } from '../common/PerformanceBadge'
import { getDevelopers } from '../../api'
import type { Developer, PaginatedResponse } from '../../types'

function DevelopersContent() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery<PaginatedResponse<Developer>>({
    queryKey: ['developers', page, limit, search],
    queryFn: () => getDevelopers(page + 1, limit, search),
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
        Developers
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="Search developers by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {isLoading ? (
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
                      <TableCell>Developer</TableCell>
                      <TableCell>Teams</TableCell>
                      <TableCell align="center">Commits</TableCell>
                      <TableCell align="center">Avg Score</TableCell>
                      <TableCell align="center">Recent Score</TableCell>
                      <TableCell align="center">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.data.map((developer) => (
                      <TableRow
                        key={developer.id}
                        hover
                        onClick={() => navigate(`/developers/${developer.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={developer.avatarUrl || undefined}>
                              {developer.username[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {developer.name || developer.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                @{developer.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {developer.teams.slice(0, 2).map((team) => (
                              <Chip
                                key={team.id}
                                label={team.name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {developer.teams.length > 2 && (
                              <Chip
                                label={`+${developer.teams.length - 2}`}
                                size="small"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">{developer.commitCount}</TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              color:
                                developer.avgScore >= 90
                                  ? 'success.main'
                                  : developer.avgScore >= 70
                                  ? 'primary.main'
                                  : developer.avgScore >= 50
                                  ? 'warning.main'
                                  : 'error.main',
                            }}
                          >
                            {developer.avgScore}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {developer.recentScore}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <PerformanceBadge score={developer.avgScore} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={data?.meta.total || 0}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={limit}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export function Developers() {
  return (
    <Layout>
      <DevelopersContent />
    </Layout>
  )
}
