/**
 * Stepper — penanda langkah formulir bertahap.
 * Sesuai DESIGN.md bagian 8.4 dan Padindi UI Design System board.
 *
 * - Selesai: lingkaran 32 px Biru Padindi, centang putih.
 * - Sekarang: lingkaran 40 px Biru Padindi dengan bintang Kuning Bintang di dalamnya, label tebal.
 * - Belum: lingkaran 32 px putih, garis 2 px Garis Isian (#7A88AC), nomor di dalam.
 */
import React from 'react';
import { Check } from 'lucide-react';
import { StarIcon } from '@/components/brand/StarIcon';

export interface StepItem {
  number: number;
  label: string;
}

export interface StepperProps {
  currentStep: number;
  totalSteps?: number;
  steps?: StepItem[];
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  totalSteps = 5,
  steps,
  className = '',
}) => {
  const stepList: StepItem[] =
    steps ||
    Array.from({ length: totalSteps }, (_, i) => ({
      number: i + 1,
      label: `Langkah ${i + 1}`,
    }));

  return (
    <nav
      aria-label="Progress formulir"
      className={`w-full max-w-form mx-auto my-6 ${className}`}
    >
      {/* Mobile view: ringkasan langkah */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <span className="font-sans font-bold text-sm text-ink">
          Langkah {currentStep} dari {stepList.length}
        </span>
        <span className="font-sans text-xs text-muted">
          {stepList[currentStep - 1]?.label}
        </span>
      </div>

      {/* Desktop view: lingkaran langkah dan garis penghubung */}
      <ol className="hidden md:flex items-center justify-between w-full relative">
        {stepList.map((step, idx) => {
          const isDone = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isPending = step.number > currentStep;

          return (
            <li
              key={step.number}
              className="flex-1 flex flex-col items-center relative"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Garis penghubung ke kiri (kecuali langkah pertama) */}
              {idx > 0 && (
                <div
                  aria-hidden="true"
                  className={`
                    absolute top-5 -left-1/2 right-1/2 h-0.5 -translate-y-1/2
                    ${isDone || isCurrent ? 'bg-primary' : 'bg-line'}
                  `}
                />
              )}

              {/* Node lingkaran */}
              <div className="relative z-10 flex items-center justify-center">
                {isDone && (
                  <div
                    role="img"
                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"
                    aria-label={`Langkah ${step.number}: ${step.label} (selesai)`}
                  >
                    <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                  </div>
                )}

                {isCurrent && (
                  <div
                    role="img"
                    className="w-10 h-10 rounded-full bg-primary text-star flex items-center justify-center ring-4 ring-tint-100"
                    aria-label={`Langkah ${step.number}: ${step.label} (saat ini)`}
                  >
                    <StarIcon size={20} className="text-star" />
                  </div>
                )}

                {isPending && (
                  <div
                    role="img"
                    className="w-8 h-8 rounded-full bg-white border-2 border-line-input text-muted font-sans text-sm flex items-center justify-center"
                    aria-label={`Langkah ${step.number}: ${step.label}`}
                  >
                    {step.number}
                  </div>
                )}
              </div>

              {/* Label langkah di bawah lingkaran */}
              <span
                className={`
                  mt-2 font-sans text-xs text-center
                  ${isCurrent ? 'font-bold text-ink' : 'text-muted'}
                `}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
