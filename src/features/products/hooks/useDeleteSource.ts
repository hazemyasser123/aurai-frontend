import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";

export const useDeleteSource = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => productApi.deleteSource(productId, sourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", productId, "sources"] }),
  });
};
