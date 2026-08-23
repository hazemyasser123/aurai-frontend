import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useSendOutreach = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => batchApi.sendOutreach(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
};
