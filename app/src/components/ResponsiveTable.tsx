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
            <div className="hidden lg:block w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-10">
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    scope="col"
                                    onClick={() => handleSort(col.accessorKey)}
                                    className={cn(
                                        "px-4 py-3.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none border-b-2 border-gray-300 dark:border-gray-600",
                                        i === 0 && "sticky left-0 z-20 bg-gray-50 dark:bg-gray-900"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.header}
                                        {sortKey === col.accessorKey ? (
                                            sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        ) : (
                                            <ArrowUpDown size={14} className="opacity-40" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedData.map((item, rowIdx) => (
                            <tr
                                key={rowIdx}
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    "transition-colors hover:bg-blue-50 dark:hover:bg-gray-700",
                                    onRowClick && "cursor-pointer",
                                    rowIdx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"
                                )}
                            >
                                {columns.map((col, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className={cn(
                                            "px-4 py-3.5 text-sm whitespace-nowrap",
                                            col.className,
                                            colIdx === 0 && "sticky left-0 z-10 font-medium bg-inherit"
                                        )}
                                    >
                                        {renderCellValue(col, item)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                    ← Scroll horizontally to view all columns →
                </div>
            </div>

            {/* Mobile Card View (Visible on Mobile Only) */}
            <div className="lg:hidden space-y-4">
                {sortedData.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => onRowClick?.(item)}
                        className={cn(
                            "bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 space-y-2",
                            onRowClick && "cursor-pointer active:scale-[0.98] transition-transform"
                        )}
                    >
                        {columns.map((col, colIdx) => (
                            <div key={colIdx} className="flex justify-between items-start gap-3 py-1">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide min-w-[100px]">
                                    {col.mobileLabel || col.header}
                                </span>
                                <span className={cn("text-sm text-right font-medium", col.className)}>
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
