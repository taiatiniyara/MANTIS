"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText } from "lucide-react";
import { EditTypeDialog } from "./edit-type-dialog";
import { DeleteTypeDialog } from "./delete-type-dialog";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface InfringementType {
  id: string;
  category_id: string;
  code: string;
  name: string;
  description: string | null;
  fine_amount: number | null;
  demerit_points: number | null;
  gl_code: string;
  created_at: string;
  category: Category;
}

interface TypesTableProps {
  types: InfringementType[];
  categories: Category[];
}

export function TypesTable({ types, categories }: TypesTableProps) {
  const [editingType, setEditingType] = useState<InfringementType | null>(null);
  const [deletingType, setDeletingType] = useState<InfringementType | null>(
    null
  );

  if (types.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No infringement types found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating a new type
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Fine</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead>GL Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-mono font-medium">
                  {type.code}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{type.name}</p>
                    {type.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {type.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{type.category.name}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {type.fine_amount ? (
                    <span className="font-medium">
                      ${type.fine_amount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {type.demerit_points ? (
                    <Badge variant="secondary">{type.demerit_points}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {type.gl_code}
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingType(type)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingType(type)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingType && (
        <EditTypeDialog
          type={editingType}
          categories={categories}
          open={!!editingType}
          onOpenChange={(open: boolean) => !open && setEditingType(null)}
        />
      )}

      {deletingType && (
        <DeleteTypeDialog
          type={deletingType}
          open={!!deletingType}
          onOpenChange={(open: boolean) => !open && setDeletingType(null)}
        />
      )}
    </>
  );
}
