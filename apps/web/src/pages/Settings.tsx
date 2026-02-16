import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { Layout } from '../common/Layout'
import { getSettings, updateSettings, getGithubRepositories, setGithubToken, verifyGithubToken } from '../../api'

function SettingsContent() {
  const queryClient = useQueryClient()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  })

  const { data: githubRepos } = useQuery({
    queryKey: ['github', 'repositories'],
    queryFn: getGithubRepositories,
    enabled: settings?.githubConnected || false,
  })

  const verifyMutation = useMutation({
    mutationFn: verifyGithubToken,
    onSuccess: (data) => {
      if (data.valid) {
        setSuccess('GitHub token is valid!')
        setError('')
      } else {
        setError('Invalid GitHub token')
      }
    },
    onError: () => {
      setError('Failed to verify token')
    },
  })

  const saveTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      await setGithubToken(token)
      await updateSettings({ githubToken: token })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setSuccess('GitHub token saved successfully!')
      setError('')
      setToken('')
    },
    onError: () => {
      setError('Failed to save token')
    },
  })

  const handleSaveToken = () => {
    if (!token) {
      setError('Please enter a token')
      return
    }
    saveTokenMutation.mutate(token)
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Settings
      </Typography>

      {/* GitHub Connection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            GitHub Connection
          </Typography>
          
          {settingsLoading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              {settings?.githubConnected ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  GitHub account is connected
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Connect your GitHub account to import commits
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                <TextField
                  label="GitHub Personal Access Token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  sx={{ flex: 1 }}
                  size="small"
                  helperText="Create a token with 'repo' scope at GitHub Settings > Developer Settings > Personal Access Tokens"
                />
                <Button
                  variant="contained"
                  onClick={handleSaveToken}
                  disabled={saveTokenMutation.isPending || !token}
                >
                  {saveTokenMutation.isPending ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Connected Repositories */}
      {settings?.githubConnected && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Available Repositories
            </Typography>
            
            {githubRepos && githubRepos.length > 0 ? (
              <List>
                {githubRepos.slice(0, 10).map((repo: any, index: number) => (
                  <Box key={repo.id}>
                    <ListItem>
                      <ListItemText
                        primary={repo.name}
                        secondary={repo.description || repo.full_name}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" disabled>
                          <AddIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < githubRepos.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No repositories found. Make sure your token has the correct permissions.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* About */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            About DevMetrics
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            DevMetrics is a developer performance evaluation platform that helps CTOs and 
            development managers assess and compare developer performance based on GitHub commit data.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Version: 1.0.0
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export function Settings() {
  return (
    <Layout>
      <SettingsContent />
    </Layout>
  )
}
