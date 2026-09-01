import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { Button } from '@/shared/components/ui';
import type { Product } from '@/features/products/types/productTypes';

const SliderVerticalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
    <path d="M7 6H17C17.62 6 18.17 6.02 18.66 6.09C21.29 6.38 22 7.62 22 11V13C22 16.38 21.29 17.62 18.66 17.91C18.17 17.98 17.62 18 17 18H7C6.38 18 5.83 17.98 5.34 17.91C2.71 17.62 2 16.38 2 13V11C2 7.62 2.71 6.38 5.34 6.09C5.83 6.02 6.38 6 7 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 17.9999C17.62 17.9999 18.17 17.9799 18.66 17.9099C18.67 18.0499 18.67 18.1799 18.67 18.3299V18.6699C18.67 21.3299 18 21.9999 15.33 21.9999H8.66999C5.99999 21.9999 5.32999 21.3299 5.32999 18.6699V18.3299C5.32999 18.1799 5.32999 18.0499 5.33999 17.9099C5.82999 17.9799 6.37999 17.9999 6.99999 17.9999H17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.66999 2H15.33C18 2 18.67 2.67 18.67 5.33V5.67C18.67 5.82 18.67 5.95 18.66 6.09C18.17 6.02 17.62 6 17 6H6.99999C6.37999 6 5.82999 6.02 5.33999 6.09C5.32999 5.95 5.32999 5.82 5.32999 5.67V5.33C5.32999 2.67 5.99999 2 8.66999 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
            <div className="w-12 h-12 bg-white border border-border rounded-md flex items-center justify-center shrink-0 overflow-hidden">
              {(() => {
                const iconSrc = (product as Product & { icon_url?: string; logo_url?: string; image_url?: string; icon?: string })?.icon_url
                  || (product as unknown as { logo_url?: string })?.logo_url
                  || (product as unknown as { image_url?: string })?.image_url
                  || (product as unknown as { icon?: string })?.icon;
                return iconSrc ? (
                  <img src={iconSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  <SliderVerticalIcon className="w-8 h-8 text-primary" />
                );
              })()}
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
