import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import type { UpdateOutreachPayload } from "@/features/batches/types/batchTypes";

export const useUpdateOutreachDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, payload }: { conversationId: string; payload: UpdateOutreachPayload }) =>
      batchApi.updateOutreachDraft(conversationId, payload),
    onSuccess: (_, vars) => {
      // Invalidate outreach lists; conversationId's batch unknown so invalidate all outreach
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["outreach", vars.conversationId] });
    },
  });
};
