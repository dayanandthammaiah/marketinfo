import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface Column<T> {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    mobileLabel?: string; // Label for mobile card view
}

interface ResponsiveTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
}

export function ResponsiveTable<T>({ data, columns, onRowClick }: ResponsiveTableProps<T>) {
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: keyof T) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortDir === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
    });

    const renderCellValue = (col: Column<T>, item: T) => {
        if (col.cell) {
            return col.cell(item);
        }
        const value = item[col.accessorKey];
        return value !== null && value !== undefined ? String(value) : 'N/A';
    };

    return (
        <>
            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block">
                <div className="w-full overflow-x-auto overflow-y-visible rounded-xl border border-white/10 shadow-lg glass scrollbar-thin"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'thin'
                    }}>
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-surface-2/50 backdrop-blur-md sticky top-0 z-10">
                            <tr>
                                {columns.map((col, i) => (
                                    <th
                                        key={i}
                                        scope="col"
                                        onClick={() => handleSort(col.accessorKey)}
                                        className={cn(
                                            "px-4 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider cursor-pointer hover:text-primary-500 transition-colors select-none",
                                            i === 0 && "sticky left-0 z-20 bg-surface-2/95 backdrop-blur-md shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.header}
                                            {sortKey === col.accessorKey ? (
                                                <span className="text-primary-500">
                                                    {sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                                </span>
                                            ) : (
                                                <ArrowUpDown size={14} className="opacity-30 hover:opacity-100 transition-opacity" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-surface/50">
                            {sortedData.map((item, rowIdx) => (
                                <motion.tr
                                    key={rowIdx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: rowIdx * 0.05, duration: 0.3 }}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        "transition-all duration-200 hover:bg-primary-50/50 dark:hover:bg-primary-900/20",
                                        onRowClick && "cursor-pointer",
                                        rowIdx % 2 === 0 ? "bg-transparent" : "bg-surface-2/30"
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={cn(
                                                "px-4 py-4 text-sm whitespace-nowrap",
                                                col.className,
                                                colIdx === 0 && "sticky left-0 z-10 font-bold bg-surface/95 backdrop-blur-sm shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]"
                                            )}
                                        >
                                            {renderCellValue(col, item)}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-2 px-4 py-3 rounded-xl text-center text-xs font-medium text-muted border border-white/10 bg-surface-2/50">
                    <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                        Swipe or scroll horizontally to view all columns
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </span>
                </div>
            </div>

            {/* Mobile Card View (Visible on Mobile Only) */}
            <div className="md:hidden space-y-4 pb-4">
                <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white px-5 py-3 rounded-2xl text-sm font-bold text-center shadow-lg shadow-primary-500/20">
                    {sortedData.length} Results • Tap card for details
                </div>
                <AnimatePresence>
                    {sortedData.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => onRowClick?.(item)}
                            className={cn(
                                "glass rounded-2xl p-5 space-y-3 relative overflow-hidden",
                                "active:scale-[0.98] transition-transform duration-200",
                                onRowClick && "cursor-pointer"
                            )}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500 to-secondary-500 opacity-80" />
                            {columns.map((col, colIdx) => (
                                <div key={colIdx} className="flex justify-between items-start gap-4 py-1.5 border-b border-white/5 last:border-0">
                                    <span className="text-xs font-bold text-muted uppercase tracking-wide min-w-[110px] flex-shrink-0">
                                        {col.mobileLabel || col.header}
                                    </span>
                                    <span className={cn("text-sm text-right font-semibold break-words", col.className)}>
                                        {renderCellValue(col, item)}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}
