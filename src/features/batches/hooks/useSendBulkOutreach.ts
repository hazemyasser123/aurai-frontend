import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import type { SendBulkOutreachPayload } from "@/features/batches/types/batchTypes";

export const useSendBulkOutreach = (batchId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendBulkOutreachPayload) =>
      batchApi.sendBulkOutreach(payload),
    onSuccess: () => {
      if (batchId) {
        queryClient.invalidateQueries({ queryKey: ["batches", batchId, "outreach"] });
      }
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
};
