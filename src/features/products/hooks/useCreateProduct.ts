import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";
import { productKeys } from "@/shared/queries/products/productQueries";
import type { CreateProductPayload } from "@/features/products/types/productTypes";

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productApi.createProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
