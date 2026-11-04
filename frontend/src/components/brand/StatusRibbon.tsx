import React from 'react';

interface StatusRibbonProps {
  text: string;
  isOpen?: boolean;
  onBlue?: boolean;
  className?: string;
}

export const StatusRibbon: React.FC<StatusRibbonProps> = ({
  text,
  isOpen = true,
  onBlue = false,
  className = '',
}) => {
  let colorClasses = 'bg-primary text-white';
  if (onBlue) {
    colorClasses = 'bg-white text-ink';
  } else if (!isOpen) {
    colorClasses = 'bg-tint-200 text-ink';
  }

  return (
    <div
      role="status"
      className={`inline-block font-sans font-bold text-sm md:text-base text-center shadow-sm ${colorClasses} ${className}`}
      style={{
        clipPath: 'polygon(0 0, 100% 0, calc(100% - 14px) 50%, 100% 100%, 0 100%, 14px 50%)',
        padding: '12px 36px',
      }}
    >
      <span>{text}</span>
    </div>
  );
};
