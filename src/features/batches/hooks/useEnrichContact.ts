import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";
import { contactKeys } from "@/features/batches/hooks/useContactDetails";
import toast from "react-hot-toast";

/** Enrich a single contact — POST /contacts/{id}/enrich, then refetch its details */
export const useEnrichContact = (contactId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => batchApi.enrichContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(contactId) });
      toast.success('Contact data enriched');
    },
  });
};
