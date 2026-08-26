import { useMutation } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";

export const useAnalyzeProduct = (productId: string) => {
  return useMutation({
    mutationFn: () => productApi.analyzeProduct(productId),
  });
};
