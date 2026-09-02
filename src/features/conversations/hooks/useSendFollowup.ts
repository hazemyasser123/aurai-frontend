import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useSendFollowup = (conversationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => batchApi.sendFollowup(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach", "thread", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
