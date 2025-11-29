import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import { MainLayout } from './components/MainLayout';
import { InstitutionalStockTable } from './components/InstitutionalStockTable';
import { CryptoInstitutionalTable } from './components/CryptoInstitutionalTable';
import { StockDetail } from './components/StockDetail';
import type { StockData } from './types/index';

function App() {
  const { data, loading, error, lastUpdated, refresh, isRefreshing } = useData();
  const [activeTab, setActiveTab] = useState<'india' | 'us' | 'crypto' | 'news'>('india');
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);

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
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">India Stocks</h2>
              <InstitutionalStockTable data={filteredData.nifty} onRowClick={setSelectedStock} />
            </section>
          )}
          {filteredData?.us && filteredData.us.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">US Markets</h2>
              <InstitutionalStockTable data={filteredData.us} onRowClick={setSelectedStock} />
            </section>
          )}
          {filteredData?.crypto && filteredData.crypto.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400">Cryptocurrency</h2>
              <CryptoInstitutionalTable data={filteredData.crypto} />
            </section>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case 'india':
        return filteredData?.nifty ? (
          <InstitutionalStockTable data={filteredData.nifty} onRowClick={setSelectedStock} />
        ) : null;

      case 'us':
        return filteredData?.us ? (
          <InstitutionalStockTable data={filteredData.us} onRowClick={setSelectedStock} />
        ) : null;

      case 'crypto':
        return filteredData?.crypto ? (
          <CryptoInstitutionalTable data={filteredData.crypto} />
        ) : null;

      case 'news':
        return filteredData?.news ? (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Latest Market News</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Top financial news from trusted sources</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.news.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col h-full"
                >
                  <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {item.category || 'Business'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {item.title}
                    </h3>
                    {item.summary && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 flex-grow leading-relaxed">
                        {item.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="font-medium truncate">{item.source}</span>
                      <span className="flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 whitespace-nowrap">
                        Read more →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as 'india' | 'us' | 'crypto' | 'news')}
      onSearch={setSearch}
      lastUpdated={lastUpdated}
      onRefresh={refresh}
      isRefreshing={isRefreshing}
    >
      {renderContent()}
      {selectedStock && <StockDetail stock={selectedStock} onClose={() => setSelectedStock(null)} />}
    </MainLayout>
  );
}

export default App;
