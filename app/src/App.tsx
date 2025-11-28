import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import { MainLayout } from './components/MainLayout';
import { ResponsiveTable, type Column } from './components/ResponsiveTable';
import { StockDetail } from './components/StockDetail';
import type { StockData } from './types/index';
import { cn } from './lib/utils';

// --- Columns Configuration ---
const stockColumns: Column<StockData>[] = [
  { header: 'Name', accessorKey: 'name', className: 'font-medium text-blue-600 dark:text-blue-400' },
  { header: 'Price', accessorKey: 'current_price', cell: (s) => `₹${s.current_price?.toFixed(2)}` },
  { header: 'Score', accessorKey: 'score', cell: (s) => <span className="font-bold">{s.score}</span> },
  { header: 'ROCE', accessorKey: 'roce', cell: (s) => <span className={cn((s.roce || 0) > 0.15 ? "text-green-600" : "text-gray-600")}>{((s.roce || 0) * 100).toFixed(1)}%</span> },
  { header: 'EPS Growth', accessorKey: 'eps_growth', cell: (s) => <span className={cn((s.eps_growth || 0) > 0.15 ? "text-green-600" : "text-gray-600")}>{((s.eps_growth || 0) * 100).toFixed(1)}%</span> },
  {
    header: 'Rec', accessorKey: 'recommendation', cell: (s) => (
      <span className={cn(
        "px-2 py-1 rounded-full text-xs font-bold",
        s.recommendation === 'Strong Buy' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
          s.recommendation === 'Buy' ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-500" :
            s.recommendation === 'Hold' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
              "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      )}>{s.recommendation}</span>
    )
  },
];

const cryptoColumns: Column<StockData>[] = [
  { header: 'Pair', accessorKey: 'name', className: 'font-medium text-blue-600 dark:text-blue-400' },
  { header: 'Price', accessorKey: 'current_price', cell: (s) => `$${s.current_price?.toLocaleString()}` },
  {
    header: '24h %', accessorKey: 'price_change_24h', cell: (s) => (
      <span className={cn((s.price_change_24h || 0) > 0 ? "text-green-600" : "text-red-600")}>
        {(s.price_change_24h || 0).toFixed(2)}%
      </span>
    )
  },
  { header: 'Score', accessorKey: 'score', cell: (s) => <span className="font-bold">{s.score}</span> },
  { header: 'RSI', accessorKey: 'rsi', cell: (s) => <span className={cn(s.rsi && s.rsi < 30 ? "text-green-600" : s.rsi && s.rsi > 70 ? "text-red-600" : "")}>{s.rsi?.toFixed(1)}</span> },
  {
    header: 'Rec', accessorKey: 'recommendation', cell: (s) => (
      <span className={cn(
        "px-2 py-1 rounded-full text-xs font-bold",
        s.recommendation === 'Strong Buy' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
      )}>{s.recommendation}</span>
    )
  },
];

// --- Components ---
const NewsFeed = ({ news }: { news: any[] }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {news?.map((item, i) => (
      <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{item.category}</span>
          <span className="text-xs text-gray-400">{new Date(item.published).toLocaleDateString()}</span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{item.summary}</p>
        <div className="mt-4 text-xs font-medium text-gray-400">{item.source}</div>
      </a>
    ))}
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
      // Global Search Results View
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
      case 'india': return <ResponsiveTable data={data?.nifty_50 || []} columns={stockColumns} onRowClick={setSelectedStock} />;
      case 'us': return <ResponsiveTable data={data?.us_stocks || []} columns={stockColumns} onRowClick={setSelectedStock} />;
      case 'crypto': return <ResponsiveTable data={data?.crypto || []} columns={cryptoColumns} onRowClick={setSelectedStock} />;
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
