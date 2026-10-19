import React from 'react';

export const EmptyState: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <div className="text-center py-12">
    <h3 className="text-lg font-bold text-ink">{title}</h3>
    {description && <p className="text-muted text-sm mt-1">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
