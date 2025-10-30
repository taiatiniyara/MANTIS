"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScrollableTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxHeight?: string;
  stickyHeader?: boolean;
}

export function ScrollableTable({ 
  className, 
  children, 
  maxHeight = "calc(100vh - 16rem)", // Default: viewport height minus header/footer space
  stickyHeader = true,
  ...props 
}: ScrollableTableProps) {
  return (
    <div 
      className={cn("rounded-lg border bg-background overflow-hidden", className)} 
      {...props}
    >
      <ScrollArea 
        className="w-full" 
        style={{ height: maxHeight }}
      >
        <div className={cn(
          "min-w-full",
          stickyHeader && "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-background [&_thead]:border-b"
        )}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}