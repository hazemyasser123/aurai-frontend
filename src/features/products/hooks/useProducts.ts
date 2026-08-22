import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";
import { productKeys } from "@/shared/queries/products/productQueries";

export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: productApi.getProducts,
  });
};
