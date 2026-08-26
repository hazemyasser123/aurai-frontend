import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { RegistrationStepper } from '@/features/products/components/register/RegistrationStepper';
import { UploadSourceCard } from '@/features/products/components/sources/UploadSourceCard';
import { PasteTextCard } from '@/features/products/components/sources/PasteTextCard';
import { KnowledgeBaseList } from '@/features/products/components/sources/KnowledgeBaseList';
import { Button } from '@/shared/components/ui';
import { useProductSources } from '@/features/products/hooks/useProductSources';
import { useUploadSource } from '@/features/products/hooks/useUploadSource';
import { useAddTextSource } from '@/features/products/hooks/useAddTextSource';
import { useDeleteSource } from '@/features/products/hooks/useDeleteSource';
import type { ProductSource } from '@/features/products/types/productTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

type PendingSource = {
  tempId: string;
  kind: 'file' | 'text';
  file?: File;
  content?: string;
};

const ProductSourcesPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: sources, isLoading: loadingSources } = useProductSources(productId || '');
  const upload = useUploadSource(productId || '');
  const addText = useAddTextSource(productId || '');
  const del = useDeleteSource(productId || '');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingSource[]>([]);
  const [isAttaching, setIsAttaching] = useState(false);

  // Deferred gathering: don't call API immediately, collect in pending
  const handleFiles = (files: File[]) => {
    if (!files.length || !productId) return;
    const file = files[0];
    const tempId = `temp-file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPending((prev) => [...prev, { tempId, kind: 'file', file }]);
    toast.success(`"${file.name}" added to knowledge base (pending)`);
  };

  const handleAttachText = async (content: string) => {
    if (!content.trim() || !productId) return;
    const tempId = `temp-text-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPending((prev) => [...prev, { tempId, kind: 'text', content: content.trim() }]);
    toast.success('Text added to knowledge base (pending)');
  };

  const handleDelete = async (id: string) => {
    // If pending temp id, just remove locally
    if (id.startsWith('temp-')) {
      setPending((prev) => prev.filter((p) => p.tempId !== id));
      toast.success('Source removed');
      return;
    }
    // otherwise delete from server
    setDeletingId(id);
    try {
      await del.mutateAsync(id);
      toast.success('Source removed');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  // Merge server sources + pending for display
  const displaySources: ProductSource[] = useMemo(() => {
    const server = sources || [];
    const pendingAsSources: ProductSource[] = pending.map((p) => ({
      id: p.tempId,
      product_id: productId || '',
      source_type: p.kind === 'file' ? 'File' : 'Text',
      file_name: p.kind === 'file' ? p.file?.name || null : null,
      content: p.kind === 'text' ? p.content || null : null,
      mime_type: p.kind === 'file' ? p.file?.type || null : 'text/plain',
      created_at: new Date().toISOString(),
    }));
    return [...server, ...pendingAsSources];
  }, [sources, pending, productId]);

  const handleNext = async () => {
    if (!productId) return;
    if (pending.length === 0) {
      // Skippable — no sources required (user may proceed with empty knowledge base)
      navigate(`/products/${productId}/trigger`);
      return;
    }
    setIsAttaching(true);
    try {
      for (const p of pending) {
        if (p.kind === 'file' && p.file) {
          await upload.mutateAsync(p.file);
        } else if (p.kind === 'text' && p.content) {
          await addText.mutateAsync(p.content);
        }
      }
      toast.success(`${pending.length} source(s) attached`);
      setPending([]);
      navigate(`/products/${productId}/trigger`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsAttaching(false);
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

      <RegistrationStepper currentStep={2} />

      <div className="w-full max-w-[874px] mx-auto bg-bg-sidebar border border-border rounded-xl shadow-sm p-4 sm:p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UploadSourceCard onFiles={handleFiles} isLoading={false} />
          <PasteTextCard onAttach={handleAttachText} isLoading={false} />
        </div>

        {loadingSources ? (
          <div className="h-14 bg-bg-input border border-border rounded-lg animate-pulse" />
        ) : (
          <KnowledgeBaseList sources={displaySources} onDelete={handleDelete} isDeletingId={deletingId} />
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <Button variant="outline" className="w-full sm:w-auto h-11" onClick={() => navigate('/products/register')}>
            Back: Identity
          </Button>
          <Button
            variant="primary"
            className="w-full sm:w-auto min-w-[151px] h-11"
            onClick={handleNext}
            isLoading={isAttaching}
            disabled={isAttaching}
          >
            Next: Engage AI Agent
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WithNavbar(ProductSourcesPage);
