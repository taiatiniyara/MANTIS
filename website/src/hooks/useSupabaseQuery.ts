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
}

export function useSupabaseQuery<T>({
    queryKey, tableName, columns, filter, limit, orderBy
}: useSupabaseQueryProps<T>) {
    const { data, error, isLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            let query = supabase.from(tableName).select(columns ? columns.join(", ") : "*");

            if (filter && filter.value !== null && filter.value !== undefined && filter.value !== '') {
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