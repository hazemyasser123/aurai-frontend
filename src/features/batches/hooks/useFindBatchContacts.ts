import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import type { FindBatchContactsPayload } from "@/features/batches/types/batchTypes";

export const useFindBatchContacts = (batchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: FindBatchContactsPayload) => batchApi.findBatchContacts(batchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches", "detail", batchId, "all-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["batches", batchId, "contacts"] });
      // also generic
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
};
