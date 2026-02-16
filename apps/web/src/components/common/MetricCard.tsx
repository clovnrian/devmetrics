import { Box, Card, CardContent, Typography } from '@mui/material'
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material'
import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: string
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  color = 'primary.main',
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
      case 'down':
        return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
      default:
        return <TrendingFlat sx={{ fontSize: 16, color: 'text.secondary' }} />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main'
      case 'down':
        return 'error.main'
      default:
        return 'text.secondary'
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color, opacity: 0.8 }}>
              {icon}
            </Box>
          )}
        </Box>
        
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            mb: 1,
          }}
        >
          {value}
        </Typography>
        
        {trend && trendValue && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getTrendIcon()}
            <Typography variant="caption" sx={{ color: getTrendColor() }}>
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
