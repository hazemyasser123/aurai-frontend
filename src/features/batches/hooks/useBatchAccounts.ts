import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";
import type { Account } from "@/features/batches/types/batchTypes";

// Accounts hidden across the whole accounts/contacts flow: Ignored.
// A null status is part of the normal flow (e.g. freshly found accounts) — those stay visible.
const isHidden = (status?: string | null) => (status || '').toLowerCase() === 'ignored';

/** Active (non-Ignored) accounts, listed alphabetically — Ignored accounts are excluded across the whole flow */
export const useBatchAccounts = (
  batchId: string,
  options?: Pick<UseQueryOptions<Account[]>, 'refetchInterval'>
) => {
  return useQuery({
    queryKey: batchKeys.accounts(batchId),
    queryFn: () => batchApi.getBatchAccounts(batchId),
    enabled: !!batchId,
    select: (accounts) => accounts
      .filter((a) => !isHidden(a.status))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    refetchInterval: options?.refetchInterval,
    // Flow data changes through explicit actions, which invalidate it —
    // no refetch on remount within the stale window or on window focus
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

/** Ids of Ignored accounts — shares the accounts cache (same key, derived select), no extra request.
 *  Used to exclude their contacts from contact lists and drafts. */
export const useIgnoredAccountIds = (batchId: string) => {
  return useQuery({
    queryKey: batchKeys.accounts(batchId),
    queryFn: () => batchApi.getBatchAccounts(batchId),
    enabled: !!batchId,
    select: (accounts) => accounts.filter((a) => isHidden(a.status)).map((a) => a.id),
  });
};
