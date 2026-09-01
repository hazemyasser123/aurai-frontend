import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { WorkspaceHeader } from '@/features/products/components/workspace/WorkspaceHeader';
import { WorkspaceTabs, type WorkspaceTabKey } from '@/features/products/components/workspace/WorkspaceTabs';
import { ProductIntelligencePanel } from '@/features/products/components/workspace/ProductIntelligencePanel';
import { IcpPanel } from '@/features/products/components/workspace/IcpPanel';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useProductAnalysis } from '@/features/products/hooks/useProductAnalysis';
import { useUpdateProductAnalysis } from '@/features/products/hooks/useUpdateProductAnalysis';
import { useProductIcp } from '@/features/products/hooks/useProductIcp';
import { useUpdateProductIcp } from '@/features/products/hooks/useUpdateProductIcp';
import type { ProductAnalysis, ProductIcp } from '@/features/products/types/productTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

const pollingMessages = [
  'Working on your data…',
  'Analyzing your product’s unique value…',
  'Crafting your Ideal Customer Profile…',
  'Helping you find the right audience…',
  'Building your outreach intelligence…',
  'Almost ready — finalizing insights…',
];

const ProductWorkspacePage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const product = products?.find((p) => p.id === productId);

  const {
    data: analysis,
    isLoading: loadingAnalysis,
    error: analysisError,
    refetch: refetchAnalysis,
  } = useProductAnalysis(productId || '');
  const { data: icp, isLoading: loadingIcp, error: icpError, refetch: refetchIcp } = useProductIcp(productId || '');
  const updateAnalysis = useUpdateProductAnalysis(productId || '');
  const updateIcp = useUpdateProductIcp(productId || '');

  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>('intelligence');
  const [analysisDraft, setAnalysisDraft] = useState<ProductAnalysis>({});
  const [icpDraft, setIcpDraft] = useState<ProductIcp>({});
  const [pollingMsgIdx, setPollingMsgIdx] = useState(0);

  useEffect(() => {
    if (analysis) setAnalysisDraft(analysis);
  }, [analysis]);
  useEffect(() => {
    if (icp) setIcpDraft(icp);
  }, [icp]);

  const is404 = (err: unknown) => {
    const e = err as { response?: { status?: number }; status?: number };
    return e?.response?.status === 404 || e?.status === 404;
  };
  const isPolling = (is404(analysisError) || is404(icpError)) && !loadingAnalysis && !loadingIcp;

  // Poll every 4s after POST 202 while GETs return 404
  useEffect(() => {
    if (!isPolling || !productId) return;
    const id = setInterval(() => {
      refetchAnalysis();
      refetchIcp();
    }, 4000);
    return () => clearInterval(id);
  }, [isPolling, productId, refetchAnalysis, refetchIcp]);

  // Rotate encouraging messages
  useEffect(() => {
    if (!isPolling) return;
    const id = setInterval(() => setPollingMsgIdx((i) => (i + 1) % pollingMessages.length), 2500);
    return () => clearInterval(id);
  }, [isPolling]);

  const handleAnalysisChange = (field: keyof ProductAnalysis, value: string | string[]) => {
    setAnalysisDraft((prev) => ({ ...prev, [field]: value }));
  };
  const handleIcpChange = (field: keyof ProductIcp, value: string | string[] | number | null) => {
    setIcpDraft((prev) => ({ ...prev, [field]: value as never }));
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'intelligence') {
        await updateAnalysis.mutateAsync(analysisDraft);
        toast.success('Product intelligence saved');
      } else {
        await updateIcp.mutateAsync(icpDraft);
        toast.success('ICP saved');
      }
      navigate('/products');
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

  const isLoading = loadingAnalysis || loadingIcp;

  if (isPolling) {
    return (
      <div className="w-full pb-8 sm:pb-12 max-w-[1120px] mx-auto flex flex-col gap-6">
        <WorkspaceHeader
          productName={product?.name || 'Aurai Sales'}
          description={product?.description || 'An AI tool would help you to find the match you are looking for'}
          onExit={() => navigate('/products')}
          onSave={handleSave}
          isSaving={updateAnalysis.isPending || updateIcp.isPending}
        />
        <div className="w-full max-w-[1120px] mx-auto bg-bg-sidebar border border-border rounded-xl shadow-sm p-8 sm:p-12 flex flex-col items-center justify-center gap-6 min-h-[520px] text-center">
          <div className="w-16 h-16 rounded-full border-4 border-border border-t-primary animate-spin" aria-label="loading" />
          <div className="flex flex-col gap-2 max-w-[560px]">
            <h3 className="font-sans font-bold text-lg sm:text-xl tracking-tight text-fg">{pollingMessages[pollingMsgIdx]}</h3>
            <p className="font-sans font-normal text-sm text-fg-body">
              Our AI is generating your product intelligence and ICP. This usually takes ~20 seconds. We’ll refresh automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-8 sm:pb-12 max-w-[1120px] mx-auto flex flex-col gap-6">
      <WorkspaceHeader
        productName={product?.name || 'Aurai Sales'}
        description={product?.description || 'An AI tool would help you to find the match you are looking for'}
        onExit={() => navigate('/products')}
        onSave={handleSave}
        isSaving={updateAnalysis.isPending || updateIcp.isPending}
      />

      <WorkspaceTabs active={activeTab} onChange={setActiveTab} />

      <div className="w-full min-h-[400px]">
        {isLoading ? (
          <div className="w-full bg-bg-sidebar border border-border rounded-xl p-6 flex flex-col gap-4 animate-pulse">
            <div className="h-6 bg-bg-muted rounded w-1/3" />
            <div className="h-24 bg-bg-muted rounded" />
            <div className="h-24 bg-bg-muted rounded" />
          </div>
        ) : activeTab === 'intelligence' ? (
          <ProductIntelligencePanel data={analysisDraft} onChange={handleAnalysisChange} />
        ) : (
          <IcpPanel data={icpDraft} onChange={handleIcpChange} productId={productId} />
        )}
      </div>
    </div>
  );
};

export default WithNavbar(ProductWorkspacePage);
