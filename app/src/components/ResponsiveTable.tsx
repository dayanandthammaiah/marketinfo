import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Column<T> {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    mobileLabel?: string;
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
            {/* Desktop Table View - Full Horizontal Scroll Support */}
            <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                {/* Horizontal scroll wrapper with mobile optimization */}
                <div className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
                    <table className="w-full border-collapse text-sm text-left min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0 z-20">
                            <tr>
                                {columns.map((col, i) => (
                                    <th
                                        key={i}
                                        onClick={() => handleSort(col.accessorKey)}
                                        className={cn(
                                            "px-6 py-4 whitespace-nowrap cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors select-none",
                                            i === 0 && "sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {col.header}
                                            {sortKey === col.accessorKey ? (
                                                <span className="text-primary-600 dark:text-primary-400">
                                                    {sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                                </span>
                                            ) : (
                                                <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {sortedData.map((item, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        "group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                        onRowClick && "cursor-pointer"
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={cn(
                                                "px-6 py-4 whitespace-nowrap",
                                                col.className,
                                                colIdx === 0 && "sticky left-0 z-10 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] font-medium text-gray-900 dark:text-white"
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
            </div>

            {/* Mobile Card View (Groww Style) - Full width with scroll */}
            <div className="md:hidden space-y-3 w-full">
                {sortedData.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => onRowClick?.(item)}
                        className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm active:scale-[0.99] transition-transform"
                    >
                        {/* Header Row: Name & Price */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                {renderCellValue(columns[0], item)}
                            </div>
                            <div className="text-right">
                                {renderCellValue(columns[1], item)}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-3" />

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-y-3 gap-x-2">
                            {columns.slice(2).map((col, colIdx) => (
                                <div key={colIdx} className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                                        {col.mobileLabel || col.header}
                                    </span>
                                    <span className={cn("text-sm font-medium", col.className)}>
                                        {renderCellValue(col, item)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {onRowClick && (
                            <div className="mt-3 flex justify-end">
                                <span className="text-xs font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1">
                                    View Details <ChevronRight size={14} />
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}
