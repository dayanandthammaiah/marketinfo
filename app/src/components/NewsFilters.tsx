import { Search, X, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

interface NewsFiltersProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function NewsFilters({
    categories,
    selectedCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange
}: NewsFiltersProps) {
    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-md-primary transition-colors" size={20} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search news topics, companies..."
                    className="w-full pl-11 pr-10 py-3 rounded-2xl border border-md-outline-variant bg-[var(--surface-1)] text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-md-primary/20 focus:border-md-primary transition-all elevation-1"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main p-1 rounded-full hover:bg-[var(--surface-2)] transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex items-center gap-2 pr-4">
                    <Filter size={16} className="text-muted flex-shrink-0" />
                    <div className="h-6 w-px bg-md-outline-variant mx-1" />
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category;
                        return (
                            <button
                                key={category}
                                onClick={() => onCategoryChange(category)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                                    isSelected
                                        ? "bg-md-primary border-md-primary text-md-on-primary elevation-2"
                                        : "bg-[var(--surface-1)] border-md-outline-variant text-muted hover:text-main hover:bg-[var(--surface-2)]"
                                )}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
