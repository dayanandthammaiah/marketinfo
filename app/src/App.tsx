import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import { MainLayout } from './components/MainLayout';
import { ResponsiveTable, type Column } from './components/ResponsiveTable';
import { StockDetail } from './components/StockDetail';
import type { StockData, NewsItem } from './types/index';
import { cn } from './lib/utils';

// --- Modern Color Configuration ---
const COLORS = {
  STRONG_BUY: "text-emerald-600 dark:text-emerald-400 font-bold", // Bright Green
  BUY: "text-green-500 dark:text-green-400 font-semibold", // Green
  HOLD: "text-amber-500 dark:text-amber-400 font-medium", // Amber
  WAIT: "text-sky-500 dark:text-sky-400 font-medium", // Sky Blue
  AVOID: "text-red-600 dark:text-red-400 font-bold", // Red
  POSITIVE: "text-emerald-500 dark:text-emerald-400",
  NEGATIVE: "text-red-500 dark:text-red-400",
  NEUTRAL: "text-gray-500 dark:text-gray-400",
};

const getRecColor = (rec: string) => {
  switch (rec?.toLowerCase()) {
    case 'strong buy': return COLORS.STRONG_BUY;
    case 'buy': return COLORS.BUY;
    case 'hold': return COLORS.HOLD;
    case 'wait': return COLORS.WAIT;
    case 'avoid':
    case 'sell': return COLORS.AVOID;
    default: return COLORS.NEUTRAL;
  }
};

const getValueColor = (value: number | undefined) => {
  if (!value) return COLORS.NEUTRAL;
  return value > 0 ? COLORS.POSITIVE : value < 0 ? COLORS.NEGATIVE : COLORS.NEUTRAL;
};

// --- Columns Configuration ---
const stockColumns: Column<StockData>[] = [
  { header: 'Name', accessorKey: 'name', className: 'font-bold text-gray-900 dark:text-gray-100' },
  { header: 'Price', accessorKey: 'current_price', cell: (s) => `₹${s.current_price?.toLocaleString()}`, mobileLabel: 'Price' },
  { header: 'Score', accessorKey: 'score', cell: (s) => <span className="font-bold text-blue-600 dark:text-blue-400">{s.score}</span>, mobileLabel: 'Score' },
  { header: 'Ideal Range', accessorKey: 'ideal_range', cell: (s) => <span className="text-gray-600 dark:text-gray-400 text-xs">{s.ideal_range || '-'}</span>, mobileLabel: 'Target' },
  { header: 'ROCE', accessorKey: 'roce', cell: (s) => <span className={cn((s.roce || 0) > 0.15 ? COLORS.POSITIVE : COLORS.NEUTRAL)}>{((s.roce || 0) * 100).toFixed(1)}%</span>, mobileLabel: 'ROCE' },
  { header: 'Rec', accessorKey: 'recommendation', cell: (s) => <span className={getRecColor(s.recommendation)}>{s.recommendation}</span>, mobileLabel: 'Rec' },
];

const cryptoColumns: Column<StockData>[] = [
  { header: 'Asset', accessorKey: 'name', className: 'font-bold text-gray-900 dark:text-gray-100' },
  { header: 'Price', accessorKey: 'current_price', cell: (s) => `$${s.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, mobileLabel: 'Price' },
  {
    header: '24h %', accessorKey: 'price_change_24h', cell: (s) => (
      <span className={getValueColor(s.price_change_24h)}>
        {s.price_change_24h ? `${s.price_change_24h > 0 ? '+' : ''}${s.price_change_24h.toFixed(2)}%` : '-'}
      </span>
    ), mobileLabel: '24h'
  },
  { header: 'Score', accessorKey: 'score', cell: (s) => <span className="font-bold text-blue-600 dark:text-blue-400">{s.score}</span>, mobileLabel: 'Score' },
  {
    header: 'RSI', accessorKey: 'rsi', cell: (s) => (
      <span className={cn(
        s.rsi && s.rsi < 30 ? COLORS.STRONG_BUY :
          s.rsi && s.rsi > 70 ? COLORS.AVOID :
            COLORS.HOLD
      )}>{s.rsi?.toFixed(0)}</span>
    ), mobileLabel: 'RSI'
  },
  {
    header: 'Trend', accessorKey: 'supertrend', cell: (s) => (
      <span className={cn(
        s.supertrend === 'Bullish' ? COLORS.POSITIVE :
          s.supertrend === 'Bearish' ? COLORS.NEGATIVE :
            COLORS.NEUTRAL
      )}>{s.supertrend || 'N/A'}</span>
    ), mobileLabel: 'Trend'
  },
  { header: 'Rec', accessorKey: 'recommendation', cell: (s) => <span className={getRecColor(s.recommendation)}>{s.recommendation}</span>, mobileLabel: 'Rec' },
];

// --- Components ---
const NewsFeed = ({ news }: { news: NewsItem[] }) => {
  const categoryColors: Record<string, string> = {
    Markets: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Economy: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    Technology: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    Crypto: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    Science: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    Business: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    Entertainment: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    Sports: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    World: "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300",
    Politics: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {news?.map((item, i) => (
        <a
          key={i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-[1.02]"
        >
          {item.image && (
            <div className="h-48 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          )}
          <div className="p-4">
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                categoryColors[item.category] || "bg-gray-100 text-gray-700"
              )}>
                {item.category}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(item.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h3 className="font-bold text-base mb-2 line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.title}
            </h3>
            {item.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {item.summary}
              </p>
            )}
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.source}</div>
          </div>
        </a>
      ))}
    </div>
  );
};

const Legend = () => (
  <div className="flex flex-wrap gap-3 text-xs mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600 shadow-sm">
    <span className="font-bold text-gray-700 dark:text-gray-300">Legend:</span>
    <span className={COLORS.STRONG_BUY}>● Strong Buy</span>
    <span className={COLORS.BUY}>● Buy</span>
    <span className={COLORS.HOLD}>● Hold</span>
    <span className={COLORS.WAIT}>● Wait</span>
    <span className={COLORS.AVOID}>● Avoid</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('india');
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const { data, loading, error } = useData();

  const filteredData = useMemo(() => {
    if (!data) return null;
    const query = search.toLowerCase();
    return {
      nifty: data.nifty_50?.filter(s => s.name.toLowerCase().includes(query) || s.symbol.toLowerCase().includes(query)),
      us: data.us_stocks?.filter(s => s.name.toLowerCase().includes(query) || s.symbol.toLowerCase().includes(query)),
      crypto: data.crypto?.filter(s => s.name.toLowerCase().includes(query) || s.symbol.toLowerCase().includes(query)),
      news: data.news?.filter(n => n.title.toLowerCase().includes(query))
    };
  }, [data, search]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading market data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 text-lg font-semibold">⚠️ Error: {error}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (search) {
      return (
        <div className="space-y-8">
          {filteredData?.nifty && filteredData.nifty.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">India Stocks</h2>
              <ResponsiveTable data={filteredData.nifty} columns={stockColumns} onRowClick={setSelectedStock} />
            </section>
          )}
          {filteredData?.us && filteredData.us.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">US Stocks</h2>
              <ResponsiveTable data={filteredData.us} columns={stockColumns} onRowClick={setSelectedStock} />
            </section>
          )}
          {filteredData?.crypto && filteredData.crypto.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">Crypto</h2>
              <ResponsiveTable data={filteredData.crypto} columns={cryptoColumns} onRowClick={setSelectedStock} />
            </section>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case 'india': return (
        <>
          <Legend />
          <ResponsiveTable data={data?.nifty_50 || []} columns={stockColumns} onRowClick={setSelectedStock} />
        </>
      );
      case 'us': return (
        <>
          <Legend />
          <ResponsiveTable data={data?.us_stocks || []} columns={stockColumns} onRowClick={setSelectedStock} />
        </>
      );
      case 'crypto': return (
        <>
          <Legend />
          <ResponsiveTable data={data?.crypto || []} columns={cryptoColumns} onRowClick={setSelectedStock} />
        </>
      );
      case 'news': return <NewsFeed news={data?.news || []} />;
      default: return null;
    }
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab} onSearch={setSearch}>
      {renderContent()}
      {selectedStock && <StockDetail stock={selectedStock} onClose={() => setSelectedStock(null)} />}
    </MainLayout>
  );
}

export default App;
