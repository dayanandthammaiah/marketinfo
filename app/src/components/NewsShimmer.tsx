import { motion } from 'framer-motion';

/**
 * Shimmer loading component for news cards
 * Provides a skeleton screen that matches the actual news card layout
 */
export function NewsShimmer() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
                <NewsCardSkeleton key={index} delay={index * 0.05} />
            ))}
        </div>
    );
}

interface NewsCardSkeletonProps {
    delay?: number;
}

function NewsCardSkeleton({ delay = 0 }: NewsCardSkeletonProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="overflow-hidden rounded-2xl bg-[var(--surface-1)] elevation-1"
        >
            {/* Image Skeleton */}
            <div className="relative w-full aspect-video bg-[var(--md-sys-color-surface-variant)] shimmer" />

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                {/* Category Chip Skeleton */}
                <div className="w-24 h-7 rounded-lg bg-[var(--md-sys-color-surface-variant)] shimmer" />

                {/* Headline Skeletons */}
                <div className="space-y-2">
                    <div className="h-5 w-full rounded bg-[var(--md-sys-color-surface-variant)] shimmer" />
                    <div className="h-5 w-4/5 rounded bg-[var(--md-sys-color-surface-variant)] shimmer" />
                </div>

                {/* Metadata Row Skeleton */}
                <div className="flex items-center gap-2 pt-2">
                    <div className="h-4 w-20 rounded bg-[var(--md-sys-color-surface-variant)] shimmer" />
                    <div className="h-1 w-1 rounded-full bg-[var(--md-sys-color-outline-variant)]" />
                    <div className="h-4 w-16 rounded bg-[var(--md-sys-color-surface-variant)] shimmer" />
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Inline shimmer for smaller loading states
 */
export function InlineShimmer({ className = '', height = '1rem', width = '100%' }: {
    className?: string;
    height?: string;
    width?: string;
}) {
    return (
        <div
            className={`shimmer rounded ${className}`}
            style={{
                height,
                width,
                backgroundColor: 'var(--md-sys-color-surface-variant)',
            }}
        />
    );
}

/**
 * Table row shimmer for loading table data
 */
export function TableRowShimmer({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-[var(--md-sys-color-outline-variant)]">
            {[...Array(columns)].map((_, index) => (
                <td key={index} className="px-4 py-3">
                    <InlineShimmer height="1.25rem" width={index === 0 ? '60%' : '80%'} />
                </td>
            ))}
        </tr>
    );
}

/**
 * Table shimmer for loading entire tables
 */
export function TableShimmer({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="overflow-hidden rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--surface-0)]">
            <table className="w-full">
                <thead className="bg-[var(--surface-1)]">
                    <tr className="border-b border-[var(--md-sys-color-outline-variant)]">
                        {[...Array(columns)].map((_, index) => (
                            <th key={index} className="px-4 py-3 text-left">
                                <InlineShimmer height="1rem" width="70%" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(rows)].map((_, index) => (
                        <TableRowShimmer key={index} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Card shimmer for generic card loading states
 */
export function CardShimmer() {
    return (
        <div className="rounded-2xl bg-[var(--surface-1)] p-6 space-y-4 elevation-1">
            <div className="flex items-center justify-between">
                <InlineShimmer height="1.5rem" width="40%" />
                <InlineShimmer height="2rem" width="5rem" />
            </div>
            <div className="space-y-2">
                <InlineShimmer height="1rem" width="100%" />
                <InlineShimmer height="1rem" width="90%" />
                <InlineShimmer height="1rem" width="75%" />
            </div>
        </div>
    );
}
