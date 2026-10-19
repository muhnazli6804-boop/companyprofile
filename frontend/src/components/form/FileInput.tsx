import React from 'react';

export const FileInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input type="file" ref={ref} {...props} />
);
FileInput.displayName = 'FileInput';
