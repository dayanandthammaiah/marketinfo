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
} from '@mui/material';
import { Info, TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { useState } from 'react';

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

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
        return (
          <Chip
            label={value}
            color={getScoreColor(value)}
            size="small"
            sx={{ fontWeight: 700, minWidth: 50 }}
          />
        );
      }

      // Price formatting is now handled by column.format, so skip here
      if (column.id.includes('price') && !column.format) {
        return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}
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
                  <TableCell key={column.id} align={column.align}>
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
