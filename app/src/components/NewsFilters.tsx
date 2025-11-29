import { Search, X } from 'lucide-react';

interface NewsFiltersProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    'All': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    'Technology': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Markets': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Cryptocurrency': 'bg-amber-100  text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Economy': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Business': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
};

export function NewsFilters({
    categories,
    selectedCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange
}: NewsFiltersProps) {
    return (
        <div className="glass rounded-xl p-4 space-y-4 border border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search news..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                    const isSelected = selectedCategory === category;
                    const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS['Business'];

                    return (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${isSelected
                                    ? `${colorClass} ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900 scale-105`
                                    : `${colorClass} hover:scale-105 opacity-60 hover:opacity-100`
                                }`}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>

            {/* Active Filters Summary */}
            {(selectedCategory !== 'All' || searchQuery) && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Active filters:</span>
                    {selectedCategory !== 'All' && (
                        <span className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
                            {selectedCategory}
                        </span>
                    )}
                    {searchQuery && (
                        <span className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
                            &quot;{searchQuery}&quot;
                        </span>
                    )}
                    <button
                        onClick={() => {
                            onCategoryChange('All');
                            onSearchChange('');
                        }}
                        className="ml-auto text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
