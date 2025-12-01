import React, { useState } from 'react';
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
    renderExpandedRow?: (item: T) => React.ReactNode;
    renderMobileCard?: (item: T) => React.ReactNode;
}

export function ResponsiveTable<T>({ data, columns, onRowClick, renderExpandedRow, renderMobileCard }: ResponsiveTableProps<T>) {
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
            {/* Desktop Table View - Full Horizontal & Vertical Scroll Support */}
            <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--surface-1)] shadow-sm">
                {/* Scroll wrapper with both horizontal and vertical scrolling */}
                <div className="overflow-auto max-h-[70vh] scrollbar-thin">
                    <table className="w-full border-collapse text-sm text-left min-w-[1200px]">
                        <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] font-bold sticky top-0 z-20 shadow-sm">
                            <tr className="divide-x divide-[var(--md-sys-color-outline-variant)]/10">
                                {columns.map((col, i) => (
                                    <th
                                        key={i}
                                        onClick={() => handleSort(col.accessorKey)}
                                        className={cn(
                                            "px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[var(--md-sys-color-primary)] transition-colors select-none m3-label-large",
                                            i === 0 && "sticky left-0 z-20 bg-[var(--surface-2)] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {col.header}
                                            {sortKey === col.accessorKey ? (
                                                <span className="text-[var(--md-sys-color-primary)]">
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
                        <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/10">
                            {sortedData.map((item, rowIdx) => (
                                <React.Fragment key={rowIdx}>
                                    <tr
                                        onClick={() => onRowClick?.(item)}
                                        className={cn(
                                            "group transition-all duration-200",
                                            "hover:bg-[var(--surface-2)]",
                                            rowIdx % 2 === 0 ? "bg-[var(--surface-1)]" : "bg-[var(--surface-1)]/50",
                                            onRowClick && "cursor-pointer"
                                        )}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td
                                                key={colIdx}
                                                className={cn(
                                                    "px-6 py-4 whitespace-nowrap m3-body-medium",
                                                    col.className,
                                                    colIdx === 0 && "sticky left-0 z-10 bg-[var(--surface-1)] group-hover:bg-[var(--surface-2)] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] font-medium text-[var(--text-main)]"
                                                )}
                                            >
                                                {renderCellValue(col, item)}
                                            </td>
                                        ))}
                                    </tr>
                                    {renderExpandedRow && renderExpandedRow(item)}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View (Material 3) */}
            <div className="md:hidden space-y-3 w-full pb-20">
                {sortedData.map((item, idx) => (
                    <React.Fragment key={idx}>
                        {renderMobileCard ? (
                            renderMobileCard(item)
                        ) : (
                            <div
                                onClick={() => onRowClick?.(item)}
                                className="md3-card active:scale-[0.98] transition-transform"
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
                                <div className="h-px bg-[var(--md-sys-color-outline-variant)]/20 my-3" />

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    {columns.slice(2).map((col, colIdx) => (
                                        <div key={colIdx} className="flex flex-col">
                                            <span className="m3-label-small text-[var(--text-muted)] uppercase tracking-wide mb-0.5">
                                                {col.mobileLabel || col.header}
                                            </span>
                                            <span className={cn("m3-body-medium font-medium", col.className)}>
                                                {renderCellValue(col, item)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {onRowClick && (
                                    <div className="mt-4 flex justify-end">
                                        <span className="m3-label-large text-[var(--md-sys-color-primary)] flex items-center gap-1">
                                            View Details <ChevronRight size={16} />
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </>
    );
}
