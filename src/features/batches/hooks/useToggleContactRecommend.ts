import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import type { Contact } from "@/features/batches/types/batchTypes";

export const useToggleContactRecommend = (
  accountId: string,
  batchId?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      isRecommended,
    }: {
      contactId: string;
      isRecommended: boolean;
    }) => batchApi.toggleContactRecommend(contactId, isRecommended),
    onMutate: async ({ contactId, isRecommended }) => {
      // Cancel outgoing refetches so optimistic update is not overwritten
      if (batchId) {
        await queryClient.cancelQueries({ queryKey: ["batches", "detail", batchId, "all-contacts"] });
        await queryClient.cancelQueries({ queryKey: ["account", accountId, batchId, "contacts"] });
      }

      const batchKey = batchId ? (["batches", "detail", batchId, "all-contacts"] as const) : null;
      const accountKey = batchId ? (["account", accountId, batchId, "contacts"] as const) : null;

      const previousBatch = batchKey ? queryClient.getQueryData<Contact[]>(batchKey) : undefined;
      const previousAccount = accountKey ? queryClient.getQueryData<Contact[]>(accountKey) : undefined;

      const updater = (list?: Contact[]) =>
        list ? list.map((c) => (c.id === contactId ? { ...c, is_recommended: isRecommended } : c)) : list;

      if (batchKey && previousBatch) {
        queryClient.setQueryData<Contact[]>(batchKey, updater(previousBatch));
      }
      if (accountKey && previousAccount) {
        queryClient.setQueryData<Contact[]>(accountKey, updater(previousAccount));
      }

      return { previousBatch, previousAccount, batchKey, accountKey };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.batchKey && context?.previousBatch) {
        queryClient.setQueryData(context.batchKey, context.previousBatch);
      }
      if (context?.accountKey && context?.previousAccount) {
        queryClient.setQueryData(context.accountKey, context.previousAccount);
      }
    },
    onSettled: () => {
      // Sync with server in background without showing loading — keep immediate move, just revalidate silently
      if (batchId) {
        queryClient.invalidateQueries({ queryKey: ["batches", "detail", batchId, "all-contacts"], refetchType: "active" });
        queryClient.invalidateQueries({ queryKey: ["account", accountId, batchId, "contacts"], refetchType: "active" });
      }
    },
  });
};
