import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils';

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
                <div className="w-full overflow-x-auto overflow-y-visible rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'thin'
                    }}>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 sticky top-0 z-10">
                            <tr>
                                {columns.map((col, i) => (
                                    <th
                                        key={i}
                                        scope="col"
                                        onClick={() => handleSort(col.accessorKey)}
                                        className={cn(
                                            "px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-all select-none",
                                            i === 0 && "sticky left-0 z-20 bg-gradient-to-r from-indigo-600 to-purple-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.header}
                                            {sortKey === col.accessorKey ? (
                                                sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            ) : (
                                                <ArrowUpDown size={14} className="opacity-50" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {sortedData.map((item, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        "transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md",
                                        onRowClick && "cursor-pointer",
                                        rowIdx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={cn(
                                                "px-4 py-4 text-sm whitespace-nowrap",
                                                col.className,
                                                colIdx === 0 && "sticky left-0 z-10 font-bold bg-inherit shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)]"
                                            )}
                                        >
                                            {renderCellValue(col, item)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg text-center text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
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
            <div className="md:hidden space-y-3 pb-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-semibold text-center shadow-lg">
                    {sortedData.length} Results • Tap card for details
                </div>
                {sortedData.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => onRowClick?.(item)}
                        className={cn(
                            "bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border-2 border-gray-100 dark:border-gray-700 space-y-3",
                            "hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200",
                            onRowClick && "cursor-pointer active:scale-[0.98]"
                        )}
                    >
                        {columns.map((col, colIdx) => (
                            <div key={colIdx} className="flex justify-between items-start gap-4 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide min-w-[110px] flex-shrink-0">
                                    {col.mobileLabel || col.header}
                                </span>
                                <span className={cn("text-sm text-right font-semibold break-words", col.className)}>
                                    {renderCellValue(col, item)}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}
