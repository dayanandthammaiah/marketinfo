import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
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

    return (
        <div className="space-y-4">
            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block">
                {/* Wrapper with max width and horizontal scroll */}
                <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    {/* Inner container for sticky positioning context */}
                    <div className="min-w-full inline-block align-middle">
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sticky top-0 z-20">
                                    <tr>
                                        {columns.map((col, i) => (
                                            <th
                                                key={i}
                                                scope="col"
                                                className={cn(
                                                    "px-4 py-3.5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors select-none border-b-2 border-gray-300 dark:border-gray-600",
                                                    col.className,
                                                    i === 0 && "sticky left-0 z-30 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                                                )}
                                                onClick={() => handleSort(col.accessorKey)}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span>{col.header}</span>
                                                    {sortKey === col.accessorKey ? (
                                                        sortDir === 'asc' ? <ArrowUp size={12} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={12} className="text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ArrowUpDown size={12} className="opacity-30" />
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
                                            className="hover:bg-blue-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                                        >
                                            {columns.map((col, colIdx) => (
                                                <td
                                                    key={colIdx}
                                                    className={cn(
                                                        "px-4 py-3.5 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
                                                        col.className,
                                                        colIdx === 0 && "sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-gray-700/50 font-semibold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                                                    )}
                                                >
                                                    {col.cell ? col.cell(item) : (item[col.accessorKey] as React.ReactNode)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Scroll hint for wide tables */}
                {columns.length > 5 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                        ← Scroll horizontally to view all columns →
                    </div>
                )}
            </div>

            {/* Mobile Card View (Hidden on Desktop) */}
            <div className="md:hidden space-y-3">
                {sortedData.map((item, i) => (
                    <div
                        key={i}
                        onClick={() => onRowClick?.(item)}
                        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 active:scale-[0.98] transition-transform hover:shadow-md"
                    >
                        <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                {/* First column is usually Name/Symbol */}
                                <div className="font-bold text-base text-gray-900 dark:text-gray-100">
                                    {columns[0].cell ? columns[0].cell(item) : (item[columns[0].accessorKey] as React.ReactNode)}
                                </div>
                            </div>
                            <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                        </div>

                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                            {columns.slice(1).map((col, j) => (
                                <div key={j} className="flex flex-col min-w-0">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-0.5">{col.mobileLabel || col.header}</span>
                                    <span className={cn("font-medium truncate", col.className)}>
                                        {col.cell ? col.cell(item) : (item[col.accessorKey] as React.ReactNode)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
