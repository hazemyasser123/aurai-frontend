import { useQuery } from "@tanstack/react-query";
import { batchApi } from "@/shared/queries/batches/batchApi";

export const contactKeys = {
  detail: (contactId: string) => ["contacts", "detail", contactId] as const,
};

export const useContactDetails = (contactId: string) => {
  return useQuery({
    queryKey: contactKeys.detail(contactId),
    queryFn: () => batchApi.getContact(contactId),
    enabled: !!contactId,
  });
};
