import React from 'react';

// TODO: see DESIGN.md section 8.6 & 14.3
export const StatusRibbon: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <div className={className}>
    <span>{text}</span>
  </div>
);
