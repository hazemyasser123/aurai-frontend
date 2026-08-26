import React from 'react';
import { Button } from '@/shared/components/ui';
import { FiPlus, FiBox } from 'react-icons/fi';

interface Props {
  onRegister: () => void;
}

export const ProductsEmptyState: React.FC<Props> = ({ onRegister }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 sm:py-16 max-w-[672px] mx-auto text-center px-4">
      <div className="w-24 h-24 sm:w-36 sm:h-36 bg-bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
        <FiBox className="w-16 h-16 sm:w-24 sm:h-24 text-primary" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">No Products Found</h3>
        <p className="font-sans font-normal text-sm sm:text-base text-fg-body">Try refining your search, or register a brand-new product to begin.</p>
      </div>
      <Button variant="outline" onClick={onRegister} className="w-full sm:w-auto h-11 px-6">
        <FiPlus className="w-6 h-6" />
        Register First Product
      </Button>
    </div>
  );
};
