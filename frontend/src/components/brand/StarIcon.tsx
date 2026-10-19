import React from 'react';

interface StarIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

// TODO: see DESIGN.md section 6.4 (poligon bintang lima sudut)
export const StarIcon: React.FC<StarIconProps> = ({ size = 24, className = 'text-star', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <polygon points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6" />
  </svg>
);
