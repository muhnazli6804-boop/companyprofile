import React from 'react';

export const DatePicker = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input type="date" ref={ref} {...props} />
);
DatePicker.displayName = 'DatePicker';
