import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

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
    onSuccess: () => {
      if (batchId) {
        queryClient.invalidateQueries({
          queryKey: ["account", accountId, batchId, "contacts"],
        });
      }
    },
  });
};
