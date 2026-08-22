import { systemApi } from "../axiosInstance";
import type { Product } from "@/features/products/types/productTypes";

export const productApi = {
  getProducts: async () => {
    const response = await systemApi.get<unknown>("/products");
    const data = response.data;

    // Safely extract the array whether it's nested or raw
    if (Array.isArray(data)) {
      return data as Product[];
    }
    if (data && Array.isArray((data as any).items)) {
      return (data as any).items as Product[];
    }
    if (data && Array.isArray((data as any).data)) {
      return (data as any).data as Product[];
    }
    if (data && Array.isArray((data as any).products)) {
      return (data as any).products as Product[];
    }

    console.warn("Unexpected response shape from /products:", data);
    return [];
  },
};
