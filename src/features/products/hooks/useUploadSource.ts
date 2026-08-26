import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";

export const useUploadSource = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => productApi.uploadSource(productId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", productId, "sources"] }),
  });
};
