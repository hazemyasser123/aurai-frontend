import React from 'react';
import { Button } from '@/shared/components/ui';
import { FiPlus } from 'react-icons/fi';

interface Props {
  onRegister: () => void;
}

export const ProductsHeader: React.FC<Props> = ({ onRegister }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Products & Services</h2>
        <p className="font-sans font-medium text-sm text-fg-body">Register and manage company products, trigger AI intelligence and Ideal Customer Profiles.</p>
      </div>
      <Button variant="primary" className="w-full sm:w-auto h-10 px-5 whitespace-nowrap shrink-0" onClick={onRegister}>
        <FiPlus className="w-4 h-4" />
        Register Product
      </Button>
    </div>
  );
};
