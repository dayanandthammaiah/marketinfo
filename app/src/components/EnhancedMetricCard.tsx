import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface EnhancedMetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'blue' | 'green' | 'red' | 'amber' | 'purple';
    subtitle?: string;
}

export function EnhancedMetricCard({ 
    label, 
    value, 
    change, 
    icon: Icon, 
    trend = 'neutral',
    color = 'blue',
    subtitle
}: EnhancedMetricCardProps) {
    const colorClasses = {
        blue: {
            gradient: 'from-blue-500 to-cyan-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-600 dark:text-blue-400'
        },
        green: {
            gradient: 'from-emerald-500 to-green-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            text: 'text-emerald-600 dark:text-emerald-400'
        },
        red: {
            gradient: 'from-rose-500 to-red-600',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
            border: 'border-rose-200 dark:border-rose-800',
            text: 'text-rose-600 dark:text-rose-400'
        },
        amber: {
            gradient: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800',
            text: 'text-amber-600 dark:text-amber-400'
        },
        purple: {
            gradient: 'from-purple-500 to-violet-600',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            border: 'border-purple-200 dark:border-purple-800',
            text: 'text-purple-600 dark:text-purple-400'
        }
    };

    const classes = colorClasses[color];

    const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
    const trendColor = trend === 'up' 
        ? 'text-emerald-600 dark:text-emerald-400' 
        : trend === 'down' 
        ? 'text-rose-600 dark:text-rose-400' 
        : 'text-gray-600 dark:text-gray-400';

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 backdrop-blur-sm",
            classes.bg,
            classes.border
        )}>
            {/* Animated gradient background */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                classes.gradient
            )} />
            
            {/* Icon with gradient background */}
            <div className="relative flex items-start justify-between mb-4">
                <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                    classes.gradient
                )}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                
                {change !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm",
                        trendColor,
                        "bg-white/50 dark:bg-gray-900/50"
                    )}>
                        <span className="text-lg">{trendIcon}</span>
                        <span>{change > 0 ? '+' : ''}{change.toFixed(2)}%</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="relative">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {label}
                </h3>
                <p className={cn(
                    "text-4xl font-black mb-1 bg-gradient-to-br bg-clip-text text-transparent",
                    classes.gradient
                )}>
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Decorative element */}
            <div className={cn(
                "absolute -bottom-2 -right-2 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity",
                classes.bg
            )} />
        </div>
    );
}
