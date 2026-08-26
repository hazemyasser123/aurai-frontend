import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";
import type { ProductIcp } from "@/features/products/types/productTypes";

export const useUpdateProductIcp = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProductIcp>) => productApi.updateProductIcp(productId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", productId, "icp"] }),
  });
};
