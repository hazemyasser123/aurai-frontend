export const batchKeys = {
  all: ["batches"] as const,
  create: ["batches", "create"] as const,
  detail: (id: string) => ["batches", "detail", id] as const,
  accounts: (id: string) => ["batches", "detail", id, "accounts"] as const,
};
