import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";

export const useProductSources = (productId: string) => {
  return useQuery({
    queryKey: ["products", productId, "sources"],
    queryFn: () => productApi.getSources(productId),
    enabled: !!productId,
  });
};
