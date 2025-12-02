import type { NewsItem } from '../types';
import { Newspaper, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { cardHover } from '../utils/animations';

interface NewsCardProps {
    item: NewsItem;
    index?: number;
}

export function NewsCard({ item, index = 0 }: NewsCardProps) {
    // Format date
    const formattedDate = new Date(item.published).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Get category color using Material 3 tokens
    const getCategoryColor = (category?: string) => {
        const cat = category?.toLowerCase() || 'business';
        if (cat.includes('tech')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-300 dark:border-purple-800';
        if (cat.includes('market') || cat.includes('stock')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-300 dark:border-blue-800';
        if (cat.includes('crypto')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-300 dark:border-amber-800';
        if (cat.includes('economy')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800';
        return 'bg-[var(--surface-3)] text-[var(--text-main)] border-[var(--md-sys-color-outline-variant)]';
    };

    return (
        <motion.a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.2, 0.0, 0, 1.0],
            }}
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
            className="group overflow-hidden rounded-2xl bg-[var(--surface-1)] elevation-1 hover:elevation-3 flex flex-col h-full transition-all duration-300 border border-[var(--md-sys-color-outline-variant)]/10"
        >
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 blur-sm will-change-transform"
                        onLoad={(e) => { e.currentTarget.classList.remove('blur-sm'); }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-full h-full flex items-center justify-center bg-[var(--surface-2)]';
                                placeholder.innerHTML = `
                                    <svg class="w-12 h-12 text-[var(--text-muted)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                `;
                                parent.appendChild(placeholder);
                            }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--surface-2)]">
                        <Newspaper className="w-12 h-12 text-[var(--text-muted)] opacity-50" strokeWidth={1.5} />
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Category Badge on Image */}
                <div className="absolute top-3 left-3">
                    <span className={cn(
                        "m3-label-small font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide backdrop-blur-md shadow-sm border transition-transform group-hover:scale-105",
                        getCategoryColor(item.category)
                    )}>
                        {item.category || 'Business'}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow relative">
                {/* Date */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="m3-label-small text-[var(--text-muted)] uppercase tracking-wider">
                        {formattedDate}
                    </span>
                </div>

                {/* Title */}
                <h3 className="m3-title-medium text-[var(--text-main)] mb-2 line-clamp-2 group-hover:text-[var(--md-sys-color-primary)] transition-colors leading-snug">
                    {item.title}
                </h3>

                {/* Summary */}
                {item.summary && (
                    <p className="m3-body-small text-[var(--text-muted)] line-clamp-3 mb-4 flex-grow leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                        {item.summary}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--md-sys-color-outline-variant)]/20">
                    <span className="m3-label-small text-[var(--text-muted)] truncate max-w-[120px] font-medium">
                        {item.source}
                    </span>
                    <motion.span
                        className="m3-label-small flex items-center gap-1.5 text-[var(--md-sys-color-primary)] font-bold"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                    >
                        Read <ExternalLink size={12} />
                    </motion.span>
                </div>
            </div>
        </motion.a>
    );
}
