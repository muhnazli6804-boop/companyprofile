import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className = '', ...props }) => (
  <div className="overflow-x-auto">
    <table className={"w-full text-left border-collapse " + className} {...props}>
      {children}
    </table>
  </div>
);
