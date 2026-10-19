import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={"animate-pulse bg-tint-100 rounded-control " + className} />
);
