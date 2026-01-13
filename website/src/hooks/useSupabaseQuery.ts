import { supabase } from "@/lib/supabase/client";
import type { tables } from "@/lib/supabase/schema";
import { useQuery } from "@tanstack/react-query";


interface useSupabaseQueryProps<T> {
    queryKey: string[];
    tableName: keyof typeof tables
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
}

export function useSupabaseQuery<T>({
    queryKey, tableName, columns, filter, limit, orderBy, enabled
}: useSupabaseQueryProps<T>) {
    const filterHasValue = (() => {
        if (!filter) return true;

        const value = filter.value;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        return value !== null && value !== undefined;
    })();

    const { data, error, isLoading } = useQuery({
        queryKey,
        enabled: enabled ?? filterHasValue,
        queryFn: async () => {
            let query = supabase.from(tableName).select(columns ? columns.join(", ") : "*");

            if (filter && filterHasValue) {
                query = query.eq(filter.column as string, filter.value);
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
        }
    });

    return { data, error, isLoading };
}