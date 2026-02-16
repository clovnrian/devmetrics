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
  Paper,
  Skeleton,
  TablePagination,
  Chip,
  Link,
} from '@mui/material'
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material'
import { Layout } from '../common/Layout'
import { getRepositories } from '../../api'
import type { Repository, PaginatedResponse } from '../../types'

function RepositoriesContent() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)

  const { data, isLoading } = useQuery<PaginatedResponse<Repository>>({
    queryKey: ['repositories', page, limit],
    queryFn: () => getRepositories(page + 1, limit),
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
        Repositories
      </Typography>

      <Card>
        <CardContent>
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
                      <TableCell>Repository</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Language</TableCell>
                      <TableCell align="center">Teams</TableCell>
                      <TableCell align="center">Commits</TableCell>
                      <TableCell>Last Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.data.map((repo) => (
                      <TableRow
                        key={repo.id}
                        hover
                        onClick={() => navigate(`/repositories/${repo.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {repo.name}
                            </Typography>
                            <Link
                              href={repo.url}
                              target="_blank"
                              rel="noopener"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <OpenInNewIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </Link>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {repo.fullName}
                          </Typography>
                        </TableCell>
                        <TableCell>{repo.owner}</TableCell>
                        <TableCell>
                          <Chip
                            label={repo.language || 'Unknown'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {repo.teams.slice(0, 2).map((team) => (
                              <Chip
                                key={team.id}
                                label={team.name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {repo.teams.length > 2 && (
                              <Chip
                                label={`+${repo.teams.length - 2}`}
                                size="small"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">{repo.commitCount}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(repo.lastUpdated).toLocaleDateString()}
                          </Typography>
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

export function Repositories() {
  return (
    <Layout>
      <RepositoriesContent />
    </Layout>
  )
}
