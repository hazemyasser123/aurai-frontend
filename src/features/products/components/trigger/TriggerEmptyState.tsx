import React from 'react';
import { Button } from '@/shared/components/ui';
import { SiFastapi } from 'react-icons/si';

interface Props {
  onEngage: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const TriggerEmptyState: React.FC<Props> = ({ onEngage, onBack, isLoading }) => {
  return (
    <div className="w-full max-w-[874px] mx-auto bg-bg-sidebar rounded-xl flex flex-col items-center justify-center gap-6 py-10 sm:py-12 px-4 sm:px-6 text-center">
      <div className="w-28 h-28 sm:w-36 sm:h-36 bg-bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
        <SiFastapi className="w-16 h-16 sm:w-24 sm:h-24 text-primary" />
      </div>
      <div className="flex flex-col gap-2 max-w-[566px] w-full">
        <h3 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Ready to build intelligence</h3>
        <p className="font-sans font-normal text-sm sm:text-base leading-6 text-fg-body">
          All supporting documentation is locked in. Click below to start the AI analysis engine. It generates unique selling points, ROI structures, and targeted Ideal Customer Profiles (ICPs) under ~20 seconds.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
        <Button variant="primary" onClick={onEngage} isLoading={isLoading} disabled={isLoading} className="w-full sm:w-[180px] h-11 px-6">
          Engage AI Sales Agent
        </Button>
        <button
          onClick={onBack}
          className="font-sans font-semibold text-xs tracking-tight text-primary hover:text-primary-dark hover:underline transition-colors"
        >
          Go back to sources
        </button>
      </div>
    </div>
  );
};
