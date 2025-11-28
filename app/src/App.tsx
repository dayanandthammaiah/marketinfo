import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import { MainLayout } from './components/MainLayout';
import { ResponsiveTable, type Column } from './components/ResponsiveTable';
import { StockDetail } from './components/StockDetail';
import type { StockData } from './types/index';
import { cn } from './lib/utils';

// --- Color Configuration ---
const COLORS = {
  STRONG_BUY: "text-green-600 dark:text-green-400 font-bold", // Bright Green
  BUY: "text-green-500 dark:text-green-500 font-medium", // Light Green
  HOLD: "text-yellow-600 dark:text-yellow-400 font-medium", // Amber
  WAIT: "text-blue-500 dark:text-blue-400 font-medium", // Blue
  AVOID: "text-red-600 dark:text-red-400 font-bold", // Red
};

const getRecColor = (rec: string) => {
  switch (rec?.toLowerCase()) {
    case 'strong buy': return COLORS.STRONG_BUY;
    case 'buy': return COLORS.BUY;
    case 'hold': return COLORS.HOLD;
    case 'wait': return COLORS.WAIT;
    case 'avoid':
    case 'sell': return COLORS.AVOID;
    default: return "text-gray-500";
  }
};

// --- Columns Configuration ---
const stockColumns: Column<StockData>[] = [
  { header: 'Name', accessorKey: 'name', className: 'font-bold text-gray-900 dark:text-gray-100' },
  { header: 'Price', accessorKey: 'current_price', cell: (s) => `₹${s.current_price?.toLocaleString()}`, mobileLabel: 'Price' },
  { header: 'Score', accessorKey: 'score', cell: (s) => <span className="font-bold">{s.score}</span>, mobileLabel: 'Score' },
  { header: 'Ideal Range', accessorKey: 'ideal_range', cell: (s) => <span className="text-gray-500 text-xs">{s.ideal_range || '-'}</span>, mobileLabel: 'Target' },
  { header: 'ROCE', accessorKey: 'roce', cell: (s) => <span className={cn((s.roce || 0) > 0.15 ? COLORS.BUY : "")}>{((s.roce || 0) * 100).toFixed(1)}%</span>, mobileLabel: 'ROCE' },
  { header: 'Rec', accessorKey: 'recommendation', cell: (s) => <span className={getRecColor(s.recommendation)}>{s.recommendation}</span>, mobileLabel: 'Rec' },
];

const cryptoColumns: Column<StockData>[] = [
  { header: 'Pair', accessorKey: 'name', className: 'font-bold text-gray-900 dark:text-gray-100' },
  { header: 'Price', accessorKey: 'current_price', cell: (s) => `$${s.current_price?.toLocaleString()}`, mobileLabel: 'Price' },
  {
    header: '24h %', accessorKey: 'price_change_24h', cell: (s) => (
      <span className={cn((s.price_change_24h || 0) > 0 ? COLORS.BUY : COLORS.AVOID)}>
        {(s.price_change_24h || 0).toFixed(2)}%
      </span>
    ), mobileLabel: '24h %'
  },
  { header: 'Score', accessorKey: 'score', cell: (s) => <span className="font-bold">{s.score}</span>, mobileLabel: 'Score' },
  {
    header: 'RSI', accessorKey: 'rsi', cell: (s) => (
      <span className={cn(
        s.rsi && s.rsi < 30 ? COLORS.STRONG_BUY :
          s.rsi && s.rsi > 70 ? COLORS.AVOID :
            COLORS.HOLD
      )}>{s.rsi?.toFixed(1)}</span>
    ), mobileLabel: 'RSI'
  },
  { header: 'Rec', accessorKey: 'recommendation', cell: (s) => <span className={getRecColor(s.recommendation)}>{s.recommendation}</span>, mobileLabel: 'Rec' },
];

// --- Components ---
const NewsFeed = ({ news }: { news: any[] }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {news?.map((item, i) => (
      <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 group">
        {item.image && (
          <div className="mb-3 h-40 overflow-hidden rounded-lg">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{item.category}</span>
          <span className="text-xs text-gray-400">{new Date(item.published).toLocaleDateString()}</span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{item.summary}</p>
        <div className="mt-4 text-xs font-medium text-gray-400">{item.source}</div>
      </a>
    ))}
  </div>
);

const Legend = () => (
  <div className="flex flex-wrap gap-4 text-xs mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
    <span className="font-bold text-gray-500">Legend:</span>
    <span className={COLORS.STRONG_BUY}>● Strong Buy</span>
    <span className={COLORS.BUY}>● Buy</span>
    <span className={COLORS.HOLD}>● Hold</span>
    <span className={COLORS.WAIT}>● Wait</span>
    <span className={COLORS.AVOID}>● Avoid/Sell</span>
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

  if (loading) return <div className="flex items-center justify-center h-screen dark:bg-gray-900 dark:text-white">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500 dark:bg-gray-900">Error: {error}</div>;

  const renderContent = () => {
    if (search) {
      return (
        <div className="space-y-8">
          {filteredData?.nifty?.length ? (
            <section>
              <h2 className="text-xl font-bold mb-4">India Stocks</h2>
              <ResponsiveTable data={filteredData.nifty} columns={stockColumns} onRowClick={setSelectedStock} />
            </section>
          ) : null}
          {filteredData?.us?.length ? (
            <section>
              <h2 className="text-xl font-bold mb-4">US Stocks</h2>
              <ResponsiveTable data={filteredData.us} columns={stockColumns} onRowClick={setSelectedStock} />
            </section>
          ) : null}
          {filteredData?.crypto?.length ? (
            <section>
              <h2 className="text-xl font-bold mb-4">Crypto</h2>
              <ResponsiveTable data={filteredData.crypto} columns={cryptoColumns} onRowClick={setSelectedStock} />
            </section>
          ) : null}
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
