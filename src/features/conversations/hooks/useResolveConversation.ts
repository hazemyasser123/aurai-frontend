import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useResolveConversation = (conversationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => batchApi.resolveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach", "thread", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
