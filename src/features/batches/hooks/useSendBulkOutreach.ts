import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useSendBulkOutreach = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationIds: string[]) =>
      batchApi.sendBulkOutreach({ conversation_ids: conversationIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
};
