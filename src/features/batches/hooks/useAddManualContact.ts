import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import type { AddManualContactPayload } from "@/features/batches/types/batchTypes";

export const useAddManualContact = (accountId: string, batchId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddManualContactPayload) =>
      batchApi.addManualContact(accountId, payload),
    onSuccess: () => {
      if (batchId) {
        queryClient.invalidateQueries({
          queryKey: ["account", accountId, batchId, "contacts"],
        });
      }
    },
  });
};
