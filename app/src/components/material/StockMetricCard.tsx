import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  LinearProgress,
  Stack,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Info
} from '@mui/icons-material';

interface MetricValue {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  goodRange?: { min: number; max: number };
  tooltipInfo?: string;
}

interface StockMetricCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  metrics: MetricValue[];
  score: number;
  recommendation: string;
  onClick?: () => void;
}

export function StockMetricCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  metrics,
  score,
  recommendation,
  onClick
}: StockMetricCardProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'info.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getRecommendationColor = (rec: string) => {
    const recLower = rec.toLowerCase();
    if (recLower.includes('strong buy')) return 'success';
    if (recLower.includes('buy')) return 'info';
    if (recLower.includes('hold')) return 'warning';
    return 'error';
  };

  const getMetricColor = (value: number, goodRange?: { min: number; max: number }) => {
    if (!goodRange) return 'text.primary';
    if (value >= goodRange.min && value <= goodRange.max) return 'success.main';
    if (value >= goodRange.min * 0.8 && value <= goodRange.max * 1.2) return 'warning.main';
    return 'error.main';
  };

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : TrendingFlat;

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        '&:hover': onClick ? {
          transform: 'translateY(-8px)',
          boxShadow: 6,
        } : {},
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap maxWidth={200}>
              {name}
            </Typography>
          </Box>
          
          {/* Score Badge */}
          <Box 
            sx={{ 
              textAlign: 'center',
              minWidth: 70,
            }}
          >
            <Box
              sx={(theme) => {
                const colorKey = getScoreColor(score).split('.')[0] as 'success' | 'info' | 'warning' | 'error';
                return {
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette[colorKey].main} 0%, ${theme.palette[colorKey].dark} 100%)`,
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  boxShadow: 3,
                };
              }}
            >
              {score}
            </Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" mt={0.5}>
              {getScoreLabel(score)}
            </Typography>
          </Box>
        </Stack>

        {/* Price and Change */}
        <Box mb={3}>
          <Typography variant="h4" fontWeight={700} mb={0.5}>
            ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<TrendIcon style={{ fontSize: 18 }} />}
              label={`${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
              size="small"
              color={changePercent >= 0 ? 'success' : 'error'}
              sx={{ fontWeight: 700, fontSize: '0.85rem' }}
            />
            <Typography variant="body2" color={changePercent >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>
              ${change >= 0 ? '+' : ''}{change.toFixed(2)}
            </Typography>
          </Stack>
        </Box>

        {/* Key Metrics */}
        <Stack spacing={1.5} mb={2}>
          {metrics.map((metric, idx) => (
            <Box key={idx}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {metric.label}
                  </Typography>
                  {metric.tooltipInfo && (
                    <Tooltip title={metric.tooltipInfo} arrow>
                      <Info sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }} />
                    </Tooltip>
                  )}
                </Stack>
                <Typography 
                  variant="body2" 
                  fontWeight={700}
                  color={typeof metric.value === 'number' ? getMetricColor(metric.value, metric.goodRange) : 'text.primary'}
                >
                  {metric.value}{metric.unit}
                  {metric.trend && (
                    <Box component="span" ml={0.5}>
                      {metric.trend === 'up' && '↗'}
                      {metric.trend === 'down' && '↘'}
                      {metric.trend === 'neutral' && '→'}
                    </Box>
                  )}
                </Typography>
              </Stack>
              {typeof metric.value === 'number' && metric.goodRange && (
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (metric.value / metric.goodRange.max) * 100)}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getMetricColor(metric.value, metric.goodRange),
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            </Box>
          ))}
        </Stack>

        {/* Recommendation Badge */}
        <Box mt={2}>
          <Chip
            label={recommendation}
            color={getRecommendationColor(recommendation)}
            sx={{
              width: '100%',
              fontWeight: 700,
              fontSize: '0.9rem',
              height: 36,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
