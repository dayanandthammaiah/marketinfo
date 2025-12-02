import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { listItem } from '../utils/animations';

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
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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
            <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--surface-0)] elevation-1 hover:elevation-2 transition-all duration-300">
                {/* Scroll wrapper with both horizontal and vertical scrolling */}
                <div className="overflow-auto max-h-[70vh] scrollbar-thin">
                    <table className="w-full border-collapse text-sm text-left min-w-[1200px]">
                        <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] font-bold sticky top-0 z-20 backdrop-blur-sm">
                            <tr className="divide-x divide-[var(--md-sys-color-outline-variant)]/10 border-b-2 border-[var(--md-sys-color-outline-variant)]/20">
                                {columns.map((col, i) => (
                                    <th
                                        key={i}
                                        onClick={() => handleSort(col.accessorKey)}
                                        className={cn(
                                            "px-6 py-4 whitespace-nowrap cursor-pointer transition-all select-none m3-label-large",
                                            "hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--surface-3)]",
                                            "active:scale-[0.98]",
                                            i === 0 && "sticky left-0 z-20 bg-[var(--surface-2)] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{col.header}</span>
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{
                                                    opacity: sortKey === col.accessorKey ? 1 : 0.3,
                                                    scale: sortKey === col.accessorKey ? 1 : 0.8,
                                                }}
                                                transition={{ duration: 0.2 }}
                                                className={cn(
                                                    sortKey === col.accessorKey && "text-[var(--md-sys-color-primary)]"
                                                )}
                                            >
                                                {sortKey === col.accessorKey ? (
                                                    sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                                ) : (
                                                    <ArrowUpDown size={14} />
                                                )}
                                            </motion.span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/10">
                            {sortedData.map((item, rowIdx) => (
                                <React.Fragment key={rowIdx}>
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: Math.min(rowIdx * 0.03, 0.5),
                                            ease: [0.2, 0.0, 0, 1.0],
                                        }}
                                        onMouseEnter={() => setHoveredRow(rowIdx)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        onClick={() => onRowClick?.(item)}
                                        className={cn(
                                            "group transition-all duration-200",
                                            "hover:bg-[var(--surface-2)]",
                                            rowIdx % 2 === 0 ? "bg-[var(--surface-0)]" : "bg-[var(--surface-1)]/30",
                                            onRowClick && "cursor-pointer active:scale-[0.99]"
                                        )}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td
                                                key={colIdx}
                                                className={cn(
                                                    "px-6 py-4 whitespace-nowrap m3-body-medium transition-all duration-200",
                                                    col.className,
                                                    colIdx === 0 && "sticky left-0 z-10 bg-inherit shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] font-semibold text-[var(--text-main)]",
                                                    hoveredRow === rowIdx && colIdx === 0 && "bg-[var(--surface-2)]"
                                                )}
                                            >
                                                {renderCellValue(col, item)}
                                            </td>
                                        ))}
                                    </motion.tr>
                                    {renderExpandedRow && renderExpandedRow(item)}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View (Material 3) */}
            <div className="md:hidden space-y-3 w-full pb-20">
                <AnimatePresence mode="wait">
                    {sortedData.map((item, idx) => (
                        <motion.div
                            key={idx}
                            variants={listItem}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{
                                duration: 0.3,
                                delay: Math.min(idx * 0.05, 0.5),
                            }}
                        >
                            {renderMobileCard ? (
                                renderMobileCard(item)
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onRowClick?.(item)}
                                    className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] p-4 elevation-1 hover:elevation-2 transition-all duration-300 border border-[var(--md-sys-color-outline-variant)]/10"
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
                                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--md-sys-color-outline-variant)]/30 to-transparent my-3" />

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                        {columns.slice(2).map((col, colIdx) => (
                                            <div key={colIdx} className="flex flex-col">
                                                <span className="m3-label-small text-[var(--text-muted)] uppercase tracking-wide mb-1">
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
                                            <motion.span
                                                className="m3-label-large text-[var(--md-sys-color-primary)] flex items-center gap-1 font-semibold"
                                                whileHover={{ x: 4 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                View Details <ChevronRight size={16} />
                                            </motion.span>
                                        </div>
                                    )}

                                    {/* Subtle gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--md-sys-color-primary)]/0 to-[var(--md-sys-color-primary)]/0 hover:from-[var(--md-sys-color-primary)]/5 hover:to-transparent transition-all duration-300 pointer-events-none rounded-2xl" />
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}
