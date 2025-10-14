import { useQuery } from "@tanstack/react-query";
import { checkSystemStatus } from "@/lib/api/system";

/**
 * Hook to check if the system has been initialized (has users)
 */
export function useSystemStatus() {
  return useQuery({
    queryKey: ["system-status"],
    queryFn: checkSystemStatus,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 3,
  });
}
