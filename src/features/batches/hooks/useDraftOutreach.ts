import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useDraftOutreach = (batchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactIds: string[]) =>
      batchApi.draftBatchOutreach(batchId, { contact_ids: contactIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches", batchId, "outreach"] });
    },
  });
};
