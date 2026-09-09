import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";

export const useSendOutreach = (batchId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => batchApi.sendOutreach(conversationId),
    onSuccess: () => {
      // Sending changes the conversation's status, its batch's outreach list and
      // the batch status — scope the refetches instead of sweeping ["batches"].
      if (batchId) {
        queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
        queryClient.invalidateQueries({ queryKey: batchKeys.outreach(batchId) });
        queryClient.invalidateQueries({ queryKey: batchKeys.lists });
      }
      queryClient.invalidateQueries({ queryKey: ["outreach"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
