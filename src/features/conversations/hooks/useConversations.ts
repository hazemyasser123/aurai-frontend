import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => batchApi.listConversations(),
  });
};
