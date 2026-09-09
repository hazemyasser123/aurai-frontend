import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { UpdateOutreachPayload } from "@/features/batches/types/batchTypes";

export const useUpdateOutreachDraft = (batchId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, payload }: { conversationId: string; payload: UpdateOutreachPayload }) =>
      batchApi.updateOutreachDraft(conversationId, payload),
    onSuccess: (_, vars) => {
      // Editing a draft only changes that conversation and its batch's outreach list —
      // nothing else under the batches tree needs a refetch.
      if (batchId) {
        queryClient.invalidateQueries({ queryKey: batchKeys.outreach(batchId) });
      }
      queryClient.invalidateQueries({ queryKey: ["outreach", vars.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
