import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Column<T> {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
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
        <div className="overflow-x-auto border rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                scope="col"
                                className={cn(
                                    "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                                    col.className,
                                    i === 0 && "sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                                )}
                                onClick={() => handleSort(col.accessorKey)}
                            >
                                <div className="flex items-center gap-1">
                                    {col.header}
                                    {sortKey === col.accessorKey ? (
                                        sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                    ) : (
                                        <ArrowUpDown size={14} className="opacity-30" />
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
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        >
                            {columns.map((col, colIdx) => (
                                <td
                                    key={colIdx}
                                    className={cn(
                                        "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
                                        col.className,
                                        colIdx === 0 && "sticky left-0 z-10 bg-white dark:bg-gray-800 font-medium shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
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
    );
}
