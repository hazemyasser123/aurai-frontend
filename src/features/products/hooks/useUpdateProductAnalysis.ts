import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";
import type { ProductAnalysis } from "@/features/products/types/productTypes";

export const useUpdateProductAnalysis = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProductAnalysis>) => productApi.updateProductAnalysis(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", productId, "analysis"] });
      // Keep the batch-flow intelligence cache (fetched once per product) in sync
      qc.invalidateQueries({ queryKey: ["product", productId, "intelligence"] });
    },
  });
};
