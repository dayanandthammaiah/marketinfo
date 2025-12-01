import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  TableSortLabel,
  Tooltip,
  IconButton,
  CircularProgress,
  Stack,
  Box,
} from '@mui/material';
import { Info, TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { useState } from 'react';
import { getMetricColor } from '../../utils/institutionalMetrics';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string | React.ReactElement;
  sortable?: boolean;
  tooltip?: string;
}

interface StockDataTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

export function StockDataTable({
  data,
  columns,
  onRowClick,
  loading = false,
  stickyHeader = true,
  maxHeight = 600,
}: StockDataTableProps) {
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!orderBy) return 0;
    
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return order === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const getRecommendationColor = (rec: string) => {
    const recLower = rec.toLowerCase();
    if (recLower.includes('strong buy')) return 'success';
    if (recLower.includes('buy')) return 'info';
    if (recLower.includes('hold')) return 'warning';
    return 'error';
  };

  const formatValue = (value: any, column: Column) => {
    if (column.format) {
      return column.format(value);
    }

    // Handle institutional metrics with color coding
    if (column.id === 'roce' || column.id === 'eps_growth') {
      const color = getMetricColor(value, column.id === 'roce' ? 'roce' : 'eps');
      const icon = value >= 15 ? '🟢' : value >= 8 ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value.toFixed(1)}%`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 80 }}
        />
      );
    }

    if (column.id === 'fcf_yield') {
      const color = getMetricColor(value, 'fcf');
      const icon = value >= 4 ? '🟢' : value >= 2 ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value.toFixed(1)}%`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 70 }}
        />
      );
    }

    if (column.id === 'debt_to_ebitda' || column.id === 'debt_to_equity') {
      const color = getMetricColor(value, 'debt');
      const icon = value <= 2 ? '🟢' : value <= 4 ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value.toFixed(1)}`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 60 }}
        />
      );
    }

    if (column.id === 'price_6m_return' || column.id === 'ev_ebitda_vs_sector') {
      const color = value >= 0 ? 'success' : 'error';
      const icon = value >= 10 ? '🟢' : value >= 0 ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value >= 0 ? '+' : ''}${value.toFixed(1)}%`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 80 }}
        />
      );
    }

    if (column.id === 'earnings_quality') {
      const colorMap: Record<string, 'success' | 'warning' | 'error'> = {
        'High': 'success',
        'Medium': 'warning',
        'Low': 'error'
      };
      const icon = value === 'High' ? '🟢' : value === 'Medium' ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value}`}
          color={colorMap[value] || 'warning'}
          size="small"
          sx={{ fontWeight: 700 }}
        />
      );
    }

    if (column.id === 'esg_score') {
      const color = getMetricColor(value, 'esg');
      const icon = value >= 85 ? '🟢' : value >= 70 ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value}`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 60 }}
        />
      );
    }

    if (column.id === 'rank') {
      return (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: value === 1 ? 'success.main' : value === 2 ? 'info.main' : value === 3 ? 'warning.main' : 'action.selected',
            color: 'white',
            fontWeight: 900,
            fontSize: '0.9rem',
          }}
        >
          {value}
        </Box>
      );
    }

    // Crypto-specific formatting
    if (column.id === 'rsi') {
      const color = value < 30 ? 'success' : value > 70 ? 'error' : 'warning';
      const icon = value < 30 ? '🟢' : value > 70 ? '🔴' : '🟡';
      return (
        <Chip
          label={`${icon} ${value.toFixed(1)}`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 70 }}
        />
      );
    }

    if (column.id === 'macd_vs_200ema') {
      const colorMap: Record<string, 'success' | 'error' | 'warning'> = {
        'BULLISH': 'success',
        'BEARISH': 'error',
        'NEUTRAL': 'warning'
      };
      const icon = value === 'BULLISH' ? '🟢' : value === 'BEARISH' ? '🔴' : '🟡';
      return (
        <Chip
          label={`${icon} ${value}`}
          color={colorMap[value] || 'warning'}
          size="small"
          sx={{ fontWeight: 700 }}
        />
      );
    }

    if (column.id === 'adx') {
      const color = value >= 50 ? 'success' : value >= 25 ? 'warning' : 'error';
      const icon = value >= 50 ? '🟢' : value >= 25 ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value.toFixed(1)}`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 70 }}
        />
      );
    }

    if (column.id === 'cmf') {
      const color = value >= 0.1 ? 'success' : value >= -0.1 ? 'warning' : 'error';
      const icon = value >= 0.1 ? '🟢' : value >= -0.1 ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value.toFixed(3)}`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 80 }}
        />
      );
    }

    if (column.id === 'macd_slope') {
      const color = value > 100 ? 'success' : value > -100 ? 'warning' : 'error';
      const icon = value > 100 ? '🟢' : value > -100 ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value >= 0 ? '+' : ''}${value.toFixed(0)}`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 80 }}
        />
      );
    }

    if (column.id === 'distance_from_200_ema') {
      const color = value > 0 ? 'success' : value > -10 ? 'warning' : 'error';
      const icon = value > 0 ? '🟢' : value > -10 ? '🟡' : '🔴';
      return (
        <Chip
          label={`${icon} ${value >= 0 ? '+' : ''}${value.toFixed(1)}%`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, minWidth: 80 }}
        />
      );
    }

    if (column.id === 'squeeze') {
      return (
        <Typography variant="body2" color="text.secondary">
          —
        </Typography>
      );
    }

    // Auto-format numbers
    if (typeof value === 'number') {
      if (column.id.includes('percent') || column.id.includes('change')) {
        return (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {value > 0 ? <TrendingUp fontSize="small" color="success" /> : 
             value < 0 ? <TrendingDown fontSize="small" color="error" /> :
             <TrendingFlat fontSize="small" color="action" />}
            <Typography
              variant="body2"
              fontWeight={700}
              color={value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.primary'}
            >
              {value > 0 ? '+' : ''}{value.toFixed(2)}%
            </Typography>
          </Stack>
        );
      }
      
      if (column.id === 'score') {
        const color = getMetricColor(value, 'score');
        return (
          <Chip
            label={value}
            color={color}
            size="small"
            sx={{ fontWeight: 900, minWidth: 50, fontSize: '0.95rem' }}
          />
        );
      }

      return value.toLocaleString();
    }

    // Auto-format recommendation
    if (column.id === 'recommendation' && typeof value === 'string') {
      return (
        <Chip
          label={value}
          color={getRecommendationColor(value)}
          size="small"
          sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', px: 1 }}
        />
      );
    }

    return value;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Loading data...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2}
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 3,
      }}
    >
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    backgroundColor: 'action.hover',
                    borderBottom: 2,
                    borderColor: 'divider',
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                      {column.tooltip && (
                        <Tooltip title={column.tooltip} arrow>
                          <IconButton size="small" sx={{ ml: 0.5 }}>
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableSortLabel>
                  ) : (
                    <>
                      {column.label}
                      {column.tooltip && (
                        <Tooltip title={column.tooltip} arrow>
                          <IconButton size="small" sx={{ ml: 0.5 }}>
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, idx) => (
              <TableRow
                key={idx}
                hover
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.id} 
                    align={column.align}
                    sx={{
                      py: 2,
                      px: 1.5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatValue(row[column.id], column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
