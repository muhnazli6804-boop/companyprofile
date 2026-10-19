import React from 'react';

export const DocumentUploader: React.FC<{ label: string }> = ({ label }) => (
  <div className="border-2 border-dashed border-primary p-6 rounded-control text-center bg-tint-100">
    <p className="font-bold">{label}</p>
    <p className="text-xs text-muted">PDF, JPG, atau PNG. Maksimal 2 MB.</p>
  </div>
);
