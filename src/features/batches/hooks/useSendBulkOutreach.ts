import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { SendBulkOutreachPayload } from "@/features/batches/types/batchTypes";

export const useSendBulkOutreach = (batchId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendBulkOutreachPayload) =>
      batchApi.sendBulkOutreach(payload),
    onSuccess: () => {
      // Sending changes the batch status (detail), its outreach list and the cards —
      // nothing else under the batches tree needs a refetch.
      if (batchId) {
        queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
        queryClient.invalidateQueries({ queryKey: batchKeys.outreach(batchId) });
      }
      queryClient.invalidateQueries({ queryKey: batchKeys.lists });
      queryClient.invalidateQueries({ queryKey: ["outreach"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
