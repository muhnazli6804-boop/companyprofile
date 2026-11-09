import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface AdminStatCardProps {
  icon: React.ElementType | React.ReactNode;
  label?: string;
  title?: string;
  value: number | string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  href?: string;
  variant?: 'primary' | 'navy' | 'leaf' | 'warning' | 'danger' | 'default';
}

const variantStyles = {
  primary: {
    iconBg: 'bg-primary/10 text-primary',
    borderHover: 'hover:border-primary/40',
  },
  navy: {
    iconBg: 'bg-navy/10 text-navy',
    borderHover: 'hover:border-navy/40',
  },
  leaf: {
    iconBg: 'bg-leaf/10 text-leaf',
    borderHover: 'hover:border-leaf/40',
  },
  warning: {
    iconBg: 'bg-warning/10 text-warning',
    borderHover: 'hover:border-warning/40',
  },
  danger: {
    iconBg: 'bg-danger/10 text-danger',
    borderHover: 'hover:border-danger/40',
  },
  default: {
    iconBg: 'bg-tint-100 text-ink',
    borderHover: 'hover:border-primary/30',
  },
};

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  icon,
  label,
  title,
  value,
  subtitle,
  trend,
  trendUp,
  href,
  variant = 'default',
}) => {
  const styles = variantStyles[variant] || variantStyles.default;
  const displayLabel = label || title || '';

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  const content = (
    <div
      className={`
        bg-white border border-line rounded-panel p-5 shadow-xs transition-all duration-200
        ${styles.borderHover}
        ${href ? 'hover:shadow-sm cursor-pointer' : ''}
      `}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <span className="font-sans font-medium text-xs text-muted leading-tight block truncate">
            {displayLabel}
          </span>
          {subtitle && (
            <span className="text-[11px] text-muted/80 block mt-0.5 truncate">
              {subtitle}
            </span>
          )}
        </div>
        <div className={`w-9 h-9 rounded-control flex items-center justify-center shrink-0 ${styles.iconBg}`}>
          {renderIcon()}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display font-bold text-2xl text-ink">
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </span>

        {trend && (
          <div
            className={`flex items-center gap-0.5 font-sans text-xs font-semibold ${
              trendUp ? 'text-leaf' : 'text-danger'
            }`}
          >
            {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-panel">
        {content}
      </Link>
    );
  }

  return content;
};
