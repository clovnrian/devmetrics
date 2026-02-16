import { Chip } from '@mui/material'

interface PerformanceBadgeProps {
  score: number
  size?: 'small' | 'medium'
}

export function PerformanceBadge({ score, size = 'small' }: PerformanceBadgeProps) {
  const getColor = () => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'primary'
    if (score >= 50) return 'warning'
    return 'error'
  }

  const getLabel = () => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Average'
    return 'Needs Work'
  }

  return (
    <Chip
      label={`${score} - ${getLabel()}`}
      color={getColor()}
      size={size}
      sx={{
        fontWeight: 600,
        '& .MuiChip-label': {
          fontWeight: 600,
        },
      }}
    />
  )
}
