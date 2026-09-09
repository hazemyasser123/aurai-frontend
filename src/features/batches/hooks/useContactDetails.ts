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
    // Changes through explicit actions (enrich) which invalidate it —
    // no refetch on remount within the stale window or on window focus
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
};
