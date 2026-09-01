import { systemApi } from "../axiosInstance";
import type { Product, CreateProductPayload, ProductAnalysis, ProductIcp } from "@/features/products/types/productTypes";

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

  getProduct: async (id: string) => {
    const response = await systemApi.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (payload: CreateProductPayload) => {
    // Normalize registration types: map display strings to API base types if needed
    const typeMap: Record<string, string> = {
      'Product (Software, Physical, Goods)': 'Product',
      'Service (Consulting, Implementation, Outsourcing)': 'Service',
      'Solution (Bundled Package, Integrated Platform)': 'Solution',
    };
    const normalizedPayload = {
      ...payload,
      type: typeMap[payload.type] ?? payload.type,
    };
    const response = await systemApi.post<Product>("/products", normalizedPayload);
    return response.data;
  },

  updateProduct: async (id: string, payload: Partial<CreateProductPayload>) => {
    const response = await systemApi.patch<Product>(`/products/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    await systemApi.delete(`/products/${id}`);
  },

  // Knowledge Sources (step 2) — Figma Register Product 2
  getSources: async (productId: string) => {
    const response = await systemApi.get<import('@/features/products/types/productTypes').ProductSource[]>(`/products/${productId}/sources`);
    return response.data;
  },

  addTextSource: async (productId: string, content: string) => {
    const response = await systemApi.post<import('@/features/products/types/productTypes').ProductSource>(`/products/${productId}/sources/text`, { content });
    return response.data;
  },

  uploadSource: async (productId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const response = await systemApi.post<import('@/features/products/types/productTypes').ProductSource>(`/products/${productId}/sources/upload`, fd);
    return response.data;
  },

  deleteSource: async (productId: string, sourceId: string) => {
    await systemApi.delete(`/products/${productId}/sources/${sourceId}`);
  },

  analyzeProduct: async (productId: string) => {
    const response = await systemApi.post(`/products/${productId}/analysis`);
    return response.data;
  },

  getProductAnalysis: async (productId: string) => {
    const response = await systemApi.get<ProductAnalysis>(`/products/${productId}/analysis`);
    return response.data;
  },

  updateProductAnalysis: async (productId: string, payload: Partial<ProductAnalysis>) => {
    const response = await systemApi.patch<ProductAnalysis>(`/products/${productId}/analysis`, payload);
    return response.data;
  },

  getProductIcp: async (productId: string) => {
    const response = await systemApi.get<ProductIcp>(`/products/${productId}/icp`);
    return response.data;
  },

  updateProductIcp: async (productId: string, payload: Partial<ProductIcp>) => {
    const response = await systemApi.patch<ProductIcp>(`/products/${productId}/icp`, payload);
    return response.data;
  },

  chatIcp: async (productId: string, payload: { message: string; current_icp: unknown }) => {
    // Primary: product-scoped chat; fallback to batch endpoint if backend only implements batches
    try {
      const response = await systemApi.post<{
        reply: string;
        changed_fields: string[];
        proposed_icp: Record<string, unknown>;
      }>(`/products/${productId}/icp/chat`, payload);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 404 || axiosErr.response?.status === 405) {
        const fallback = await systemApi.post<{
          reply: string;
          changed_fields: string[];
          proposed_icp: Record<string, unknown>;
        }>(`/batches/${productId}/icp/chat`, payload);
        return fallback.data;
      }
      throw err;
    }
  },
};
