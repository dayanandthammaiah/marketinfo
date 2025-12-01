import { useState, useMemo } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Container,
  Stack,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  TrendingUp,
  AttachMoney,
  CurrencyBitcoin,
  Newspaper,
  WorkspacePremium,
  Notifications,
  Menu as MenuIcon,
  Refresh,
} from '@mui/icons-material';
import { createAppTheme } from './theme/muiTheme';
import { useData } from './hooks/useData';
import { StockDataTable } from './components/material/StockDataTable';
import { NewsCard } from './components/material/NewsCard';

export function AppMaterial() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { data, loading, error, refresh, isRefreshing } = useData();

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const tabs = [
    { label: 'India Stocks', icon: <TrendingUp />, id: 'india' },
    { label: 'US Stocks', icon: <AttachMoney />, id: 'us' },
    { label: 'Crypto', icon: <CurrencyBitcoin />, id: 'crypto' },
    { label: 'News', icon: <Newspaper />, id: 'news' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Prepare India stocks data for INSTITUTIONAL table
  const indiaColumns = [
    { id: 'symbol', label: 'Stock', minWidth: 100, align: 'left' as const, sortable: true },
    { id: 'roce', label: 'ROCE', minWidth: 100, align: 'center' as const, tooltip: 'Return on Capital Employed', sortable: true },
    { id: 'eps_growth', label: 'EPS Growth (3Y)', minWidth: 130, align: 'center' as const, tooltip: '3-Year CAGR', sortable: true },
    { id: 'fcf_yield', label: 'FCF Yield', minWidth: 100, align: 'center' as const, tooltip: 'Free Cash Flow Yield', sortable: true },
    { id: 'ev_ebitda_vs_sector', label: 'EV/EBITDA vs Sector', minWidth: 150, align: 'center' as const, sortable: true },
    { id: 'price_6m_return', label: '6M Rel. Return', minWidth: 120, align: 'center' as const, tooltip: '6-Month Relative Return', sortable: true },
    { id: 'debt_to_ebitda', label: 'Debt/EBITDA', minWidth: 120, align: 'center' as const, sortable: true },
    { id: 'earnings_quality', label: 'Earnings Quality', minWidth: 130, align: 'center' as const, sortable: true },
    { id: 'esg_score', label: 'ESG Score', minWidth: 100, align: 'center' as const, tooltip: 'Environmental, Social, Governance Score', sortable: true },
    { id: 'score', label: 'Composite', minWidth: 100, align: 'center' as const, tooltip: 'Composite Score (0-100)', sortable: true },
    { id: 'rank', label: 'Rank', minWidth: 80, align: 'center' as const, sortable: true },
    { id: 'recommendation', label: 'Recommendation', minWidth: 150, align: 'center' as const, sortable: true },
  ];

  // US Stocks columns with USD
  const usColumns = [
    { id: 'symbol', label: 'Symbol', minWidth: 100, align: 'left' as const },
    { id: 'name', label: 'Company', minWidth: 200, align: 'left' as const },
    { 
      id: 'current_price', 
      label: 'Price (USD)', 
      minWidth: 120, 
      align: 'right' as const,
      format: (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    { id: 'changePercent', label: 'Change %', minWidth: 100, align: 'right' as const },
    { id: 'roce', label: 'ROCE %', minWidth: 100, align: 'right' as const, tooltip: 'Return on Capital Employed' },
    { id: 'eps_growth', label: 'EPS Growth %', minWidth: 120, align: 'right' as const },
    { id: 'pe_ratio', label: 'P/E', minWidth: 80, align: 'right' as const },
    { id: 'score', label: 'Score', minWidth: 80, align: 'center' as const },
    { id: 'recommendation', label: 'Recommendation', minWidth: 150, align: 'center' as const },
  ];

  // Crypto Table 1: Technical Indicators Summary
  const cryptoTechnicalColumns = [
    { id: 'symbol', label: 'Asset', minWidth: 120, align: 'left' as const, sortable: true },
    { 
      id: 'current_price', 
      label: 'Price', 
      minWidth: 130, 
      align: 'right' as const,
      format: (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    { id: 'price_change_percentage_30d', label: '1m', minWidth: 90, align: 'center' as const, sortable: true },
    { id: 'price_change_7d', label: '3m', minWidth: 90, align: 'center' as const, sortable: true },
    { id: 'price_change_percentage_24h', label: '6m', minWidth: 90, align: 'center' as const, sortable: true },
    { id: 'price_change_1y', label: '1y', minWidth: 90, align: 'center' as const, sortable: true },
    { id: 'price_change_5y', label: '5Y', minWidth: 90, align: 'center' as const, sortable: true },
    { id: 'rsi', label: 'RSI(14)', minWidth: 100, align: 'center' as const, tooltip: 'Relative Strength Index', sortable: true },
    { id: 'macd_vs_200ema', label: 'MACD', minWidth: 100, align: 'center' as const, tooltip: 'MACD Trend', sortable: true },
    { id: 'distance_from_200_ema', label: 'vs 200 EMA', minWidth: 120, align: 'center' as const, sortable: true },
    { id: 'recommendation', label: 'Rec.', minWidth: 120, align: 'center' as const, sortable: true },
  ];

  // Crypto Table 2: Institutional-Grade Analysis
  const cryptoInstitutionalColumns = [
    { id: 'symbol', label: 'Asset', minWidth: 120, align: 'left' as const, sortable: true },
    { id: 'score', label: 'Score (0-100)', minWidth: 120, align: 'center' as const, sortable: true },
    { id: 'adx', label: 'ADX(14)', minWidth: 100, align: 'center' as const, tooltip: 'Trend Strength', sortable: true },
    { id: 'cmf', label: 'CMF(20)', minWidth: 100, align: 'center' as const, tooltip: 'Chaikin Money Flow', sortable: true },
    { id: 'distance_from_200_ema', label: 'Dist 200EMA', minWidth: 120, align: 'center' as const, sortable: true },
    { id: 'macd_slope', label: 'MACD Slope', minWidth: 120, align: 'center' as const, sortable: true },
    { id: 'squeeze', label: 'Squeeze', minWidth: 90, align: 'center' as const },
    { id: 'recommendation', label: 'Composite Rec.', minWidth: 150, align: 'center' as const, sortable: true },
  ];

  const renderContent = () => {
    if (loading && !data) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Loading market data...
            </Typography>
          </Stack>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6">Error loading data</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      );
    }

    console.log('Active Tab:', activeTab, 'Data:', data); // Debug log

    switch (activeTab) {
      case 0: // India Stocks
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                🇮🇳 India Stock Market
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Nifty 50 stocks with institutional analysis and recommendations
              </Typography>
              {data?.nifty_50 && data.nifty_50.length > 0 ? (
                <StockDataTable
                  data={data.nifty_50}
                  columns={indiaColumns}
                  onRowClick={(row) => console.log('Row clicked:', row)}
                  maxHeight={700}
                />
              ) : (
                <Alert severity="info">No India stock data available</Alert>
              )}
            </Box>
          </Stack>
        );

      case 1: // US Stocks
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                🇺🇸 US Stock Market
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                S&P 500 and major US stocks with comprehensive metrics
              </Typography>
              {data?.us_stocks && data.us_stocks.length > 0 ? (
                <StockDataTable
                  data={data.us_stocks}
                  columns={usColumns}
                  onRowClick={(row) => console.log('Row clicked:', row)}
                  maxHeight={700}
                />
              ) : (
                <Alert severity="info">No US stock data available</Alert>
              )}
            </Box>
          </Stack>
        );

      case 2: // Crypto
        return (
          <Stack spacing={4}>
            {/* Technical Indicators Summary */}
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                ₿ Cryptocurrency Market - Technical Indicators
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Multi-timeframe price analysis with RSI, MACD, and trend indicators
              </Typography>
              {data?.crypto && data.crypto.length > 0 ? (
                <StockDataTable
                  data={data.crypto}
                  columns={cryptoTechnicalColumns}
                  onRowClick={(row) => console.log('Row clicked:', row)}
                  maxHeight={500}
                />
              ) : (
                <Alert severity="info">No cryptocurrency data available</Alert>
              )}
            </Box>

            {/* Institutional-Grade Analysis */}
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Institutional-Grade Analysis
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Advanced technical indicators: ADX, CMF, MACD Slope, and composite scoring
              </Typography>
              {data?.crypto && data.crypto.length > 0 ? (
                <StockDataTable
                  data={data.crypto}
                  columns={cryptoInstitutionalColumns}
                  onRowClick={(row) => console.log('Row clicked:', row)}
                  maxHeight={500}
                />
              ) : (
                <Alert severity="info">No cryptocurrency data available</Alert>
              )}
            </Box>
          </Stack>
        );

      case 3: // News
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                📰 Market News & Analysis
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Latest financial news from trusted sources worldwide
              </Typography>
              {data?.news && data.news.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                    },
                    gap: 3,
                  }}
                >
                  {data.news.map((article, idx) => (
                    <NewsCard
                      key={idx}
                      title={article.title || 'Untitled'}
                      summary={article.summary || ''}
                      image={article.image}
                      source={article.source || 'Unknown'}
                      published={article.published || new Date().toISOString()}
                      category={article.category || 'General'}
                      link={article.link || '#'}
                    />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  <Typography variant="h6">No news available</Typography>
                  <Typography variant="body2">
                    News data is currently unavailable. Please try refreshing.
                  </Typography>
                </Alert>
              )}
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700}>
          InvestIQ
        </Typography>
      </Toolbar>
      <List>
        {tabs.map((tab, index) => (
          <ListItem key={tab.id} disablePadding>
            <ListItemButton
              selected={activeTab === index}
              onClick={() => {
                setActiveTab(index);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>{tab.icon}</ListItemIcon>
              <ListItemText primary={tab.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* App Bar */}
        <AppBar 
          position="fixed" 
          elevation={2}
          color={mode === 'light' ? 'default' : 'inherit'}
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: 'blur(20px)',
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
            borderBottom: 2,
            borderColor: 'primary.main',
            color: mode === 'light' ? '#000000' : '#ffffff',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <WorkspacePremium sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, mr: 2 }}>
              InvestIQ
            </Typography>

            <Tabs
              value={activeTab}
              onChange={(_, newValue) => {
                console.log('Tab changed to:', newValue); // Debug
                setActiveTab(newValue);
              }}
              sx={{ 
                flexGrow: 1,
                maxWidth: 800,
                '& .MuiTab-root': {
                  color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3,
                },
              }}
              textColor="inherit"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              {tabs.map((tab, idx) => (
                <Tab
                  key={tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition="start"
                  value={idx}
                  sx={{
                    minWidth: 120,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    px: 2,
                  }}
                />
              ))}
            </Tabs>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh data">
                <IconButton color="inherit" onClick={refresh} disabled={isRefreshing}>
                  <Refresh sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={0} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton onClick={toggleColorMode} color="inherit">
                  {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: 8, sm: 10 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: 4,
          }}
        >
          <Container maxWidth="xl">
            {renderContent()}
          </Container>
        </Box>
      </Box>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </ThemeProvider>
  );
}
