"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AgenciesSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.push(`/admin/agencies?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    startTransition(() => {
      router.push(`/admin/agencies?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agencies..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 pr-9"
          disabled={isPending}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {search && (
        <div className="text-sm text-muted-foreground">
          {isPending ? "Searching..." : ""}
        </div>
      )}
    </div>
  );
}
