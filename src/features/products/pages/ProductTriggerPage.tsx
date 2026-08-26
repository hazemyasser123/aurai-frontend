import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { RegistrationStepper } from '@/features/products/components/register/RegistrationStepper';
import { TriggerEmptyState } from '@/features/products/components/trigger/TriggerEmptyState';
import { useAnalyzeProduct } from '@/features/products/hooks/useAnalyzeProduct';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const ProductTriggerPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const analyze = useAnalyzeProduct(productId || '');

  const handleEngage = async () => {
    if (!productId) return;
    try {
      await analyze.mutateAsync();
      toast.success('AI analysis started — generating intelligence ( ~20s )');
      navigate(`/products/${productId}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (!productId) {
    return (
      <div className="w-full max-w-[1120px] mx-auto py-12 text-center">
        <p className="font-sans text-sm text-danger">Missing product ID</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-8 sm:pb-12 max-w-[1120px] mx-auto flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Register Product Knowledge</h2>
        <p className="font-sans font-medium text-sm text-fg-body">Configure your product parameters and feed files or text sources to build the product intelligence engine.</p>
      </div>

      <RegistrationStepper currentStep={3} />

      <TriggerEmptyState onEngage={handleEngage} onBack={() => navigate(`/products/${productId}/sources`)} isLoading={analyze.isPending} />
    </div>
  );
};

export default WithNavbar(ProductTriggerPage);
