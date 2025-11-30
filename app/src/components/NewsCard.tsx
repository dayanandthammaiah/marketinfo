import type { NewsItem } from '../types';
import { Newspaper, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

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
        if (cat.includes('tech')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        if (cat.includes('market') || cat.includes('stock')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        if (cat.includes('crypto')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        if (cat.includes('economy')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    };

    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group glass rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-white/10"
        >
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-full h-full flex items-center justify-center bg-surface-2';
                                placeholder.innerHTML = `
                                    <svg class="w-12 h-12 text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                `;
                                parent.appendChild(placeholder);
                            }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-2">
                        <Newspaper className="w-12 h-12 text-muted opacity-50" strokeWidth={1.5} />
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Category Badge on Image */}
                <div className="absolute top-3 left-3">
                    <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide backdrop-blur-md shadow-sm border",
                        getCategoryColor(item.category)
                    )}>
                        {item.category || 'Business'}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow relative">
                {/* Date */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-muted font-medium uppercase tracking-wider">
                        {formattedDate}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-main mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors leading-snug">
                    {item.title}
                </h3>

                {/* Summary */}
                {item.summary && (
                    <p className="text-sm text-muted line-clamp-3 mb-4 flex-grow leading-relaxed opacity-90">
                        {item.summary}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-white/5">
                    <span className="font-semibold text-muted truncate max-w-[120px]">
                        {item.source}
                    </span>
                    <span className="flex items-center gap-1.5 text-primary-500 font-semibold group-hover:translate-x-1 transition-transform">
                        Read Article <ExternalLink size={12} />
                    </span>
                </div>
            </div>
        </a>
    );
}
