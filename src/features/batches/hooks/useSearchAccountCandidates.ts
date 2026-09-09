import { useMutation } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import type { SearchAccountCandidatesPayload, AccountCandidate } from "@/features/batches/types/batchTypes";

export const useSearchAccountCandidates = (batchId: string) => {
  return useMutation({
    mutationFn: (payload: SearchAccountCandidatesPayload): Promise<AccountCandidate[]> =>
      batchApi.searchAccountCandidates(batchId, payload),
  });
};
