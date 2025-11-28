import { useState, useMemo } from 'react';
import { LayoutDashboard, TrendingUp, Bitcoin, Newspaper, Search } from 'lucide-react';
import { cn } from './lib/utils';
import { useData } from './hooks/useData';
import { ThemeToggle } from './components/ThemeToggle';
import { StockDetail } from './components/StockDetail';
import type { StockData } from './types/index';

// Components with Search Filter
const IndiaMarket = ({ data, filter, onSelect }: { data: any, filter: string, onSelect: (s: StockData) => void }) => {
  const filtered = useMemo(() => {
    return data?.nifty_50?.filter((s: any) => s.name.toLowerCase().includes(filter.toLowerCase()));
  }, [data, filter]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">India Market (Nifty 50)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Score</th>
              <th className="p-3 text-left">Rec</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map((stock: any, i: number) => (
              <tr key={i} onClick={() => onSelect(stock)} className="border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 font-medium">{stock.name}</td>
                <td className="p-3">₹{stock.current_price?.toFixed(2)}</td>
                <td className="p-3">{stock.score}</td>
                <td className={cn("p-3 font-bold", {
                  'text-green-600': stock.recommendation === 'Strong Buy',
                  'text-green-500': stock.recommendation === 'Buy',
                  'text-yellow-500': stock.recommendation === 'Hold',
                  'text-red-500': stock.recommendation === 'Avoid',
                })}>{stock.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const USMarket = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">US Market</h2>
    <p>Coming Soon...</p>
  </div>
);

const Crypto = ({ data, filter, onSelect }: { data: any, filter: string, onSelect: (s: StockData) => void }) => {
  const filtered = useMemo(() => {
    return data?.crypto?.filter((c: any) => c.name.toLowerCase().includes(filter.toLowerCase()));
  }, [data, filter]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Crypto</h2>
      <div className="grid gap-4">
        {filtered?.map((coin: any) => (
          <div key={coin.id} onClick={() => onSelect(coin)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <div>
              <h3 className="font-bold">{coin.name}</h3>
              <p className="text-sm text-gray-500">{coin.symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">${coin.current_price}</p>
              <p className={cn("text-sm", coin.price_change_24h > 0 ? "text-green-500" : "text-red-500")}>
                {coin.price_change_24h?.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const News = () => <div className="p-4"><h2>News</h2><p>Latest updates...</p></div>;

function App() {
  const [activeTab, setActiveTab] = useState('india');
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const { data, loading, error } = useData();

  if (loading) return <div className="flex items-center justify-center h-screen dark:bg-gray-900 dark:text-white">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500 dark:bg-gray-900">Error: {error}</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'india': return <IndiaMarket data={data} filter={search} onSelect={setSelectedStock} />;
      case 'us': return <USMarket />;
      case 'crypto': return <Crypto data={data} filter={search} onSelect={setSelectedStock} />;
      case 'news': return <News />;
      default: return <IndiaMarket data={data} filter={search} onSelect={setSelectedStock} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around p-2 pb-safe z-10">
        <button onClick={() => setActiveTab('india')} className={cn("flex flex-col items-center p-2", activeTab === 'india' ? "text-blue-600" : "text-gray-500 dark:text-gray-400")}>
          <LayoutDashboard size={24} />
          <span className="text-xs mt-1">India</span>
        </button>
        <button onClick={() => setActiveTab('us')} className={cn("flex flex-col items-center p-2", activeTab === 'us' ? "text-blue-600" : "text-gray-500 dark:text-gray-400")}>
          <TrendingUp size={24} />
          <span className="text-xs mt-1">US</span>
        </button>
        <button onClick={() => setActiveTab('crypto')} className={cn("flex flex-col items-center p-2", activeTab === 'crypto' ? "text-blue-600" : "text-gray-500 dark:text-gray-400")}>
          <Bitcoin size={24} />
          <span className="text-xs mt-1">Crypto</span>
        </button>
        <button onClick={() => setActiveTab('news')} className={cn("flex flex-col items-center p-2", activeTab === 'news' ? "text-blue-600" : "text-gray-500 dark:text-gray-400")}>
          <Newspaper size={24} />
          <span className="text-xs mt-1">News</span>
        </button>
      </nav>

      {selectedStock && (
        <StockDetail stock={selectedStock} onClose={() => setSelectedStock(null)} />
      )}
    </div>
  );
}

export default App;
