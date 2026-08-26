import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/shared/queries/products/productApi";

const is404 = (error: unknown) => {
  const e = error as { response?: { status?: number } };
  return e?.response?.status === 404;
};

export const useProductAnalysis = (productId: string, opts?: { refetchInterval?: number | false }) => {
  return useQuery({
    queryKey: ["products", productId, "analysis"],
    queryFn: () => productApi.getProductAnalysis(productId),
    enabled: !!productId,
    retry: (count, error) => (is404(error) ? false : count < 2),
    refetchInterval: opts?.refetchInterval,
  });
};
