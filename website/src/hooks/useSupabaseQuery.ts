import { supabase } from "@/lib/supabase/client";
import type { tables } from "@/lib/supabase/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

interface useSupabaseQueryProps<T> {
  queryKey: string[];
  tableName: keyof typeof tables;
  columns?: (keyof T)[];
  filter?: {
    column: keyof T;
    value: T[keyof T] | T[keyof T][];
  };
  limit?: number;
  orderBy?: {
    column: keyof T;
    ascending: boolean;
  }[];
  enabled?: boolean;
  realtime?: boolean;
}

export function useSupabaseQuery<T>({
  queryKey,
  tableName,
  columns,
  filter,
  limit,
  orderBy,
  enabled,
  realtime,
}: useSupabaseQueryProps<T>) {
  const queryClient = useQueryClient();
  const queryKeySignature = useMemo(() => queryKey.join("::"), [queryKey]);
  const internalQueryKey = useMemo(
    () => ["supabase", String(tableName), ...queryKey] as const,
    [tableName, queryKeySignature],
  );
  const filterHasValue = (() => {
    if (!filter) return true;

    const value = filter.value;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return value !== null && value !== undefined;
  })();

  const isQueryEnabled = enabled ?? filterHasValue;
  const shouldSubscribeRealtime = useMemo(() => {
    if (!isQueryEnabled) return false;
    if (typeof realtime === "boolean") return realtime;
    return tableName === "infringements";
  }, [isQueryEnabled, realtime, tableName]);

  const { data, error, isLoading } = useQuery({
    queryKey: internalQueryKey,
    enabled: isQueryEnabled,
    queryFn: async () => {
      let query = supabase
        .from(tableName)
        .select(columns ? columns.join(", ") : "*");

      if (filter && filterHasValue) {
        if (Array.isArray(filter.value)) {
          query = query.in(filter.column as string, filter.value as any[]);
        } else {
          query = query.eq(filter.column as string, filter.value);
        }
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (orderBy) {
        orderBy.forEach(({ column, ascending }) => {
          query = query.order(column as string, { ascending });
        });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      return data as T[];
    },
  });

  useEffect(() => {
    if (!shouldSubscribeRealtime) return;

    const channelName = `realtime:${String(tableName)}:${queryKeySignature}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: String(tableName) },
        () => {
          queryClient.invalidateQueries({ queryKey: internalQueryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    internalQueryKey,
    queryClient,
    queryKeySignature,
    shouldSubscribeRealtime,
    tableName,
  ]);

  return { data, error, isLoading };
}
