import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Button, Card } from '@/shared/components/ui';
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

const ProductAnalyzePlaceholderPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-[874px] mx-auto flex flex-col gap-6 py-8">
      <Card variant="elevated" className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center">
          <FiCheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="font-sans font-bold text-xl text-fg">Sources Attached</h2>
        <p className="font-sans text-sm text-fg-body max-w-md">
          Your knowledge base has been updated. The AI analysis step is not yet implemented — this is a placeholder for the next page (Trigger AI / Analyze & generate).
        </p>
        <p className="font-sans text-xs text-fg-muted">Product ID: {productId}</p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={() => navigate(`/products/${productId}/sources`)}>
            <FiArrowLeft className="w-4 h-4" />
            Back to Sources
          </Button>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Go to Products
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WithNavbar(ProductAnalyzePlaceholderPage);
