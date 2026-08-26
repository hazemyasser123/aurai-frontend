import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";

export const useAddTextSource = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => productApi.addTextSource(productId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", productId, "sources"] }),
  });
};
