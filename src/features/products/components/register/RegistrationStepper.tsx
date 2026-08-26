import React from 'react';
import { FiCheck } from 'react-icons/fi';

interface Step {
  number: number;
  title: string;
  subtitle: string;
}

interface Props {
  currentStep?: number; // 1-indexed
}

const steps: Step[] = [
  { number: 1, title: 'Identity', subtitle: 'Product details' },
  { number: 2, title: 'Sources', subtitle: 'Files & Paste text' },
  { number: 3, title: 'Trigger AI', subtitle: 'Analyze & generate' },
];

export const RegistrationStepper: React.FC<Props> = ({ currentStep = 1 }) => {
  return (
    <div className="w-full max-w-[874px] mx-auto flex flex-row justify-between items-center gap-2 sm:gap-4 lg:gap-8 px-2 sm:px-4 overflow-x-auto">
      {steps.map((s) => {
        const isActive = s.number === currentStep;
        const isCompleted = s.number < currentStep;
        return (
          <div key={s.number} className="flex items-center gap-3 sm:gap-4 shrink-0 flex-1 sm:flex-initial justify-center sm:justify-start">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-sans font-semibold text-xs leading-4 transition-colors duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : isCompleted
                    ? 'bg-bg-sidebar border border-primary text-primary'
                    : 'bg-bg-sidebar border border-border text-fg-strong'
              }`}
            >
              {isCompleted ? <FiCheck className="w-5 h-5" strokeWidth={2.5} /> : s.number}
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span
                className={`font-sans font-semibold text-sm sm:text-lg leading-6 tracking-tight whitespace-nowrap ${
                  isActive ? 'text-fg' : 'text-fg'
                }`}
              >
                {s.title}
              </span>
              <span className="font-sans font-semibold text-[10px] sm:text-xs leading-4 tracking-tight text-fg-body whitespace-nowrap">
                {s.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
