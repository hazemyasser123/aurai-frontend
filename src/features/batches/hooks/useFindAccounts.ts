import { useMutation } from "@tanstack/react-query";
import { simulateApi } from "@/shared/utils/simulateApi";
import dummyAccounts from "@/features/batches/data/accountsData.json";
import type { Batch } from "@/features/batches/types/batchTypes";

export const useFindAccounts = (batchId: string) => {
  return useMutation({
    // The payload isn't strictly needed for dummy data, but we accept it to maintain the hook signature
    mutationFn: async (payload: Partial<Batch>) => {
      // Simulate the API returning the accounts array
      const accounts = await simulateApi(dummyAccounts);

      // Merge the payload with the new accounts array to simulate the updated batch
      return { ...payload, accounts } as Batch;
    },
  });
};
