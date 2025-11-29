import { useState, useMemo, useEffect } from 'react';
import { useData } from './hooks/useData';
import { MainLayout } from './components/MainLayout';
import { InstitutionalStockTable } from './components/InstitutionalStockTable';
import { CryptoInstitutionalTable } from './components/CryptoInstitutionalTable';
import { StockDetail } from './components/StockDetail';
import { NewsCard } from './components/NewsCard';
import { FloatingActionButton } from './components/FloatingActionButton';
import { FavoritesTab } from './components/FavoritesTab';
import { AlertsList } from './components/AlertsList';
import { PortfolioTab } from './components/PortfolioTab';
import { NewsFilters } from './components/NewsFilters';
import { useAlerts } from './contexts/AlertsContext';
import { usePortfolio } from './contexts/PortfolioContext';
import type { StockData } from './types/index';

function App() {
  const { data, loading, error, lastUpdated, refresh, isRefreshing } = useData();
  const { checkAlerts } = useAlerts();
  const { updatePrices } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'india' | 'us' | 'crypto' | 'news' | 'favorites' | 'alerts' | 'portfolio'>('india');
  const [search, setSearch] = useState('');
  const [newsCategory, setNewsCategory] = useState('All');
  const [newsSearch, setNewsSearch] = useState('');
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

  // Check alerts and update portfolio prices
  useEffect(() => {
    if (data) {
      const allPrices = [
        ...(data.nifty_50?.map(s => ({ symbol: s.symbol, price: s.current_price })) || []),
        ...(data.us_stocks?.map(s => ({ symbol: s.symbol, price: s.current_price })) || []),
        ...(data.crypto?.map(c => ({ symbol: c.symbol, price: c.current_price })) || [])
      ];

      checkAlerts(allPrices);
      updatePrices(allPrices);
    }
  }, [data, checkAlerts, updatePrices]);

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
          <div className="w-full overflow-auto">
            <InstitutionalStockTable data={filteredData.nifty} onRowClick={setSelectedStock} />
          </div>
        ) : null;

      case 'us':
        return filteredData?.us ? (
          <div className="w-full overflow-auto">
            <InstitutionalStockTable data={filteredData.us} onRowClick={setSelectedStock} />
          </div>
        ) : null;

      case 'crypto':
        return filteredData?.crypto ? (
          <div className="w-full overflow-auto">
            <CryptoInstitutionalTable data={filteredData.crypto} />
          </div>
        ) : null;

      case 'news':
        const filteredNews = filteredData?.news?.filter(n => {
          const matchesCategory = newsCategory === 'All' || n.category === newsCategory;
          const matchesSearch = !newsSearch || n.title.toLowerCase().includes(newsSearch.toLowerCase());
          return matchesCategory && matchesSearch;
        });

        return filteredNews ? (
          <div className="space-y-6 pb-20">
            <div className="glass rounded-xl px-6 py-4 border border-gray-200 dark:border-gray-700">
              <h2 className="gradient-text text-3xl font-bold mb-2">Latest Market News</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Top financial news from trusted sources • Real-time updates
              </p>
            </div>
            <NewsFilters
              categories={['All', 'Technology', 'Markets', 'Cryptocurrency', 'Economy', 'Business']}
              selectedCategory={newsCategory}
              onCategoryChange={setNewsCategory}
              searchQuery={newsSearch}
              onSearchChange={setNewsSearch}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((item, i) => (
                <NewsCard key={i} item={item} />
              ))}
            </div>
          </div>
        ) : null;

      case 'favorites':
        return <FavoritesTab data={data} onStockClick={setSelectedStock} />;

      case 'alerts':
        return (
          <div className="space-y-6 pb-20">
            <div className="glass rounded-xl px-6 py-4 border border-gray-200 dark:border-gray-700">
              <h2 className="gradient-text text-3xl font-bold mb-2">Price Alerts</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get notified when assets reach your target price
              </p>
            </div>
            <AlertsList />
          </div>
        );

      case 'portfolio':
        return <PortfolioTab data={data} />;

      default:
        return null;
    }
  };

  return (
    <>
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

      {/* Floating Refresh Button */}
      <FloatingActionButton
        onClick={refresh}
        loading={isRefreshing}
      />
    </>
  );
}

export default App;
