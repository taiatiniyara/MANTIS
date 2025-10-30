"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";

interface Infringement {
  id: string;
  vehicle_id: string;
  issued_at: string;
  agency_id: string | null;
  type: {
    id: string;
    code: string;
    name: string;
    fine_amount: number | null;
    gl_code: string;
    category: {
      id: string;
      name: string;
    };
  } | null;
}

interface FinanceReportsTableProps {
  infringements: Infringement[];
  userRole: string;
}

interface GLCodeAggregate {
  gl_code: string;
  type_names: Set<string>;
  count: number;
  total_amount: number;
  categories: Set<string>;
}

export function FinanceReportsTable({
  infringements,
  userRole,
}: FinanceReportsTableProps) {
  const [sortBy, setSortBy] = useState<"gl_code" | "count" | "amount">("amount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Aggregate by GL Code
  const glCodeData = useMemo(() => {
    const map = new Map<string, GLCodeAggregate>();

    infringements.forEach((inf) => {
      if (inf.type && inf.type.gl_code) {
        const glCode = inf.type.gl_code;

        if (!map.has(glCode)) {
          map.set(glCode, {
            gl_code: glCode,
            type_names: new Set(),
            count: 0,
            total_amount: 0,
            categories: new Set(),
          });
        }

        const entry = map.get(glCode)!;
        entry.type_names.add(inf.type.name);
        entry.count++;
        entry.total_amount += inf.type.fine_amount || 0;
        if (inf.type.category) {
          entry.categories.add(inf.type.category.name);
        }
      }
    });

    // Convert to array and sort
    let dataArray = Array.from(map.values());

    dataArray.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "gl_code") {
        comparison = a.gl_code.localeCompare(b.gl_code);
      } else if (sortBy === "count") {
        comparison = a.count - b.count;
      } else if (sortBy === "amount") {
        comparison = a.total_amount - b.total_amount;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return dataArray;
  }, [infringements, sortBy, sortOrder]);

  const totalAmount = glCodeData.reduce((sum, item) => sum + item.total_amount, 0);
  const totalCount = glCodeData.reduce((sum, item) => sum + item.count, 0);

  function handleSort(column: "gl_code" | "count" | "amount") {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  }

  function handleExport() {
    // Prepare CSV data
    const headers = ["GL Code", "Category", "Type Names", "Count", "Total Amount"];
    const rows = glCodeData.map((item) => [
      item.gl_code,
      Array.from(item.categories).join("; "),
      Array.from(item.type_names).join("; "),
      item.count.toString(),
      item.total_amount.toFixed(2),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
      "", // Empty row
      `"Total",,,${totalCount},${totalAmount.toFixed(2)}`,
    ].join("\n");

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `finance-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (glCodeData.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No financial data</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No infringements with GL codes found for the selected period
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {glCodeData.length} GL code{glCodeData.length === 1 ? "" : "s"} • {totalCount}{" "}
          infringement{totalCount === 1 ? "" : "s"}
        </p>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <ScrollableTable maxHeight="calc(100vh - 20rem)">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort("gl_code")}
                  className="flex items-center gap-1 font-medium hover:text-foreground"
                >
                  GL Code
                  {sortBy === "gl_code" && (
                    <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Infringement Types</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("count")}
                  className="flex items-center gap-1 font-medium hover:text-foreground ml-auto"
                >
                  Count
                  {sortBy === "count" && (
                    <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center gap-1 font-medium hover:text-foreground ml-auto"
                >
                  Total Amount
                  {sortBy === "amount" && (
                    <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {glCodeData.map((item) => (
              <TableRow key={item.gl_code}>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {item.gl_code}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(item.categories).map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {Array.from(item.type_names).join(", ")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{item.count}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${item.total_amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-medium">
                Total
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{totalCount}</Badge>
              </TableCell>
              <TableCell className="text-right font-bold">
                ${totalAmount.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollableTable>
    </div>
  );
}
