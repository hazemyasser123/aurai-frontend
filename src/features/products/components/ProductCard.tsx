import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSliders, FiArrowRight } from 'react-icons/fi';
import { Button } from '@/shared/components/ui';
import type { Product } from '@/features/products/types/productTypes';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const navigate = useNavigate();

  const handleWorkspace = () => {
    const lower = (product.status || '').toLowerCase();
    if (lower === 'draft') {
      navigate(`/products/${product.id}/sources`);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  const getBadge = () => {
    const lower = (product.status || '').toLowerCase();
    let bg = 'bg-bg-muted text-fg-body';
    let label = product.status || 'Draft';
    if (lower === 'ready') {
      bg = 'bg-success-bg text-success';
      label = 'Ready';
    } else if (lower === 'draft') {
      bg = 'bg-warning-bg text-warning';
      label = 'Draft';
    } else if (lower === 'processing') {
      bg = 'bg-warning-bg text-warning';
      label = 'Processing';
    } else if (lower === 'failed') {
      bg = 'bg-danger-bg text-danger';
      label = 'Failed';
    }
    return { bg, label };
  };

  const badge = getBadge();
  const registered = product.created_at ? new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 16, 2026';

  return (
    <div className="box-border flex flex-col items-start p-4 sm:p-6 gap-4 sm:gap-6 w-full bg-bg-sidebar border border-border rounded-xl hover:shadow-card transition-shadow duration-150 ease-out">
      {/* Heading */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row justify-between items-center w-full gap-3">
          <div className="flex flex-row items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 bg-white border border-border rounded-md flex items-center justify-center shrink-0">
              <FiSliders className="w-8 h-8 text-fg-body" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <span className="font-sans font-semibold text-base leading-6 tracking-tight text-fg truncate">
                {product.name || 'Product Name'}
              </span>
              <span className="font-sans font-medium text-sm leading-5 tracking-tight text-fg-body truncate">
                {product.type || 'Product'}
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full font-sans font-medium text-xs leading-4 whitespace-nowrap shrink-0 ${badge.bg}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col w-full min-h-[60px]">
        <p className="font-sans font-medium text-sm leading-5 tracking-tight text-[#62748E] line-clamp-3">
          {product.description || 'Lorem ipsum dolor sit amet consectetur. Nulla vehicula amet eget enim urna pretium viverra.'}
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-border shrink-0" />

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <span className="font-sans font-normal text-xs leading-4 tracking-tight text-fg-body flex-1 text-left">
          Registered: {registered}
        </span>
        <Button variant="primary" className="w-full sm:w-auto min-w-[160px] h-10 px-4 gap-3 shrink-0" onClick={handleWorkspace}>
          Workspace
          <FiArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
