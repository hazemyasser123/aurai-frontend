import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { batchKeys } from "@/shared/queries/batches/batchQueries";

export const useBatches = () => {
  return useQuery({
    queryKey: batchKeys.all,
    queryFn: batchApi.getBatches,
  });
};
