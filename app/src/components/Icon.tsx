import React from 'react';

interface IconProps {
  name: string; // material icon name, e.g., "search"
  variant?: 'rounded' | 'outlined';
  size?: number; // px
  className?: string;
  title?: string;
}

export function Icon({ name, variant = 'rounded', size = 20, className = '', title }: IconProps) {
  const fontClass = variant === 'outlined' ? 'material-symbols-outlined' : 'material-symbols-rounded';
  const style: React.CSSProperties = { fontSize: `${size}px`, lineHeight: 1 };
  return (
    <span className={`${fontClass} ${className}`} style={style} aria-hidden title={title}>
      {name}
    </span>
  );
}
