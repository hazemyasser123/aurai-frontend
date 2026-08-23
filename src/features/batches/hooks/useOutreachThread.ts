import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useOutreachThread = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["outreach", "thread", conversationId],
    queryFn: () => batchApi.getOutreachThread(conversationId!),
    enabled: !!conversationId,
  });
};
