import { supabase } from "@/lib/supabase/client";
import type { tables } from "@/lib/supabase/schema";
import { useQuery } from "@tanstack/react-query";


interface useSupabaseQueryProps<T> {
    queryKey: string[];
    tableName: keyof typeof tables
    columns?: (keyof T)[];
    filters?: {
        column: keyof T;
        operator: "=" | "!=" | "<" | "<=" | ">" | ">=" | "like" | "ilike" | "in" | "is" | "fts" | "plfts" | "phfts";
        value: T[keyof T] | T[keyof T][];
    }[];
    limit?: number;
    orderBy?: {
        column: keyof T;
        ascending: boolean;
    }[];
}

export function useSupabaseQuery<T>({
    queryKey, tableName, columns, filters, limit, orderBy
}: useSupabaseQueryProps<T>) {
    const { data, error, isLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            let query = supabase.from(tableName).select(columns ? columns.join(", ") : "*");

            if (filters) {
                filters.forEach(({ column, operator, value }) => {
                    query = query.filter(column as string, operator, value);
                });
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