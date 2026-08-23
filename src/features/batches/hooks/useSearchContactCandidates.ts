import { useMutation } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import type { SearchContactCandidatesPayload } from "@/features/batches/types/batchTypes";

export const useSearchContactCandidates = (accountId: string) => {
  return useMutation({
    mutationFn: (payload: SearchContactCandidatesPayload) =>
      batchApi.searchContactCandidates(accountId, payload),
  });
};
