import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { FindAccountsPayload } from "@/features/batches/types/batchTypes";

export const useFindAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FindAccountsPayload) => batchApi.findAccounts(payload),
    onSuccess: async (_data, variables) => {
      // detail cache is updated by the transition (fast-path/poll) — no detail invalidation
      // needed here. Fetch the accounts NOW (see below) so the next view shows them instantly.
      if (variables.id) {
        // The find-accounts response doesn't include the accounts themselves —
        // fetch them NOW, while the loading overlay is still up, so the Explore
        // Accounts view shows them the instant it mounts (no empty flash).
        // A failure here is non-fatal: the view's mount refetch retries.
        try {
          await queryClient.fetchQuery({
            queryKey: batchKeys.accounts(variables.id),
            queryFn: () => batchApi.getBatchAccounts(variables.id as string),
          });
        } catch {
          /* fall back to the mount-time refetch */
        }
      }
      queryClient.invalidateQueries({ queryKey: batchKeys.lists });
    },
  });
};
