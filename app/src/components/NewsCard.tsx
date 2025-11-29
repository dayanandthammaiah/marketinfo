import type { NewsItem } from '../types';
import { Newspaper } from 'lucide-react';

interface NewsCardProps {
    item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
    // Format date
    const formattedDate = new Date(item.published).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Get category color
    const getCategoryColor = (category?: string) => {
        const cat = category?.toLowerCase() || 'business';
        if (cat.includes('tech')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
        if (cat.includes('market') || cat.includes('stock')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        if (cat.includes('crypto')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
        if (cat.includes('economy')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    };

    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group card-gradient overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 flex flex-col h-full transition-all duration-300 hover:shadow-xl"
        >
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-full h-full flex items-center justify-center';
                                placeholder.innerHTML = `
                                    <svg class="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                `;
                                parent.appendChild(placeholder);
                            }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-16 h-16 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Meta Info */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${getCategoryColor(item.category)}`}>
                        {item.category || 'Business'}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        {formattedDate}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:gradient-text transition-all leading-tight">
                    {item.title}
                </h3>

                {/* Summary */}
                {item.summary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 flex-grow leading-relaxed">
                        {item.summary}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                        {item.source}
                    </span>
                    <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all font-medium whitespace-nowrap">
                        Read more →
                    </span>
                </div>
            </div>
        </a>
    );
}
