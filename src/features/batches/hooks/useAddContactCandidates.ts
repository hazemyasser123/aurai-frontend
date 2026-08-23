import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import type { AddContactCandidatesPayload } from "@/features/batches/types/batchTypes";

export const useAddContactCandidates = (
  accountId: string,
  batchId?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddContactCandidatesPayload) =>
      batchApi.addContactCandidates(accountId, payload),
    onSuccess: () => {
      if (batchId) {
        queryClient.invalidateQueries({
          queryKey: ["account", accountId, batchId, "contacts"],
        });
        queryClient.invalidateQueries({
          queryKey: ["batches", "detail", batchId, "all-contacts"],
        });
        queryClient.invalidateQueries({
          queryKey: ["batches", "detail", batchId, "accounts"],
        });
      }
    },
  });
};
