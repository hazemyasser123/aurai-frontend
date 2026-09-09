import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";

export const useAnalyzeProduct = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => productApi.analyzeProduct(productId),
    onSuccess: () => {
      // Regenerated analysis — refresh the batch-flow intelligence cache too
      qc.invalidateQueries({ queryKey: ["product", productId, "intelligence"] });
    },
  });
};
