import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type {
  FetchMoreAccountsPayload,
  Account,
} from "@/features/batches/types/batchTypes";

/** From a fetched list, keep only accounts that aren't already in the batch (by id or domain) */
export const filterNewAccounts = (fetched: Account[], existing: Account[] | undefined): Account[] => {
  if (!existing) return fetched;
  const existingIds = new Set(existing.map((a) => a.id));
  const existingDomains = new Set(existing.map((a) => (a.domain || '').toLowerCase()));
  return fetched.filter(
    (a) => !existingIds.has(a.id) && !existingDomains.has((a.domain || '').toLowerCase())
  );
};

export const useFetchMoreAccounts = (batchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FetchMoreAccountsPayload) =>
      batchApi.fetchMoreAccounts(batchId, payload),
    onSuccess: (newAccounts) => {
      // Append only genuinely-new accounts, then reconcile with the server so the
      // list in the view updates instantly (no reload needed)
      queryClient.setQueryData<Account[]>(
        batchKeys.accounts(batchId),
        (oldData) => [...(oldData || []), ...filterNewAccounts(newAccounts, oldData)]
      );
      queryClient.invalidateQueries({ queryKey: batchKeys.accounts(batchId) });
    },
  });
};
