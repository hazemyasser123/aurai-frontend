import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "./usersApi";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/features/auth/types/authTypes";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersApi.listUsers,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.createUser(payload),
    // Create is not optimistic (id is server-generated) — ensure UI updates as soon as the list refetches
    onSuccess: async (created) => {
      // Optimistically append so UI updates instantly before refetch resolves
      queryClient.setQueryData<User[]>(["users"], (prev) => (prev ? [...prev, created as User] : [created as User]));
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      usersApi.updateUser(userId, payload),
    onMutate: async ({ userId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const prev = queryClient.getQueryData<User[]>(["users"]);
      if (prev) {
        queryClient.setQueryData<User[]>(["users"], prev.map((u) => (u.id === userId ? { ...u, ...payload } as User : u)));
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["users"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const prev = queryClient.getQueryData<User[]>(["users"]);
      if (prev) {
        queryClient.setQueryData<User[]>(["users"], prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u)));
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["users"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};