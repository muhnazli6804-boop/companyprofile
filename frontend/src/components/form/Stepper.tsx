import React from 'react';

export const Stepper: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-between mb-8" aria-label="Progress formulir">
    <span>Langkah {currentStep} dari {totalSteps}</span>
  </div>
);
