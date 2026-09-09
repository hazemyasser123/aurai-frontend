import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { FindBatchContactsPayload } from "@/features/batches/types/batchTypes";

export const useFindBatchContacts = (batchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: FindBatchContactsPayload) => batchApi.findBatchContacts(batchId, payload),
    onSuccess: () => {
      // Contacts search changes the batch status (detail), its contacts and the cards —
      // scope the refetches instead of sweeping every ["batches"] query.
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists });
      queryClient.invalidateQueries({ queryKey: ["outreach"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
