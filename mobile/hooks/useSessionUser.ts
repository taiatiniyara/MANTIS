import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/database';
import { queryKeys } from '@/lib/queryKeys';
import { UserWithRelations } from '@/lib/types';

export function useSessionUser(enabled: boolean = true) {
  return useQuery<UserWithRelations | null>({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const { data, error } = await getCurrentUser();
      if (error) {
        throw new Error(error.message || 'Failed to load user');
      }
      return (data as UserWithRelations) ?? null;
    },
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}
