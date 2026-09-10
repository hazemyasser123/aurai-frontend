import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import type { ProductAnalysis } from "@/features/batches/types/batchTypes";

export const useDraftOutreach = (batchId: string, productAnalysis?: ProductAnalysis) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactIds: string[]) =>
      batchApi.draftBatchOutreach(batchId, {
        contact_ids: contactIds,
        ...(productAnalysis ? { product_analysis: productAnalysis } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches", batchId, "outreach"] });
    },
  });
};
