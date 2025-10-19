"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface DeleteCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setLoading(true);

    // Check if category has infringement types
    const { count: typesCount } = await supabase
      .from("infringement_types")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id);

    if (typesCount && typesCount > 0) {
      toast.error(
        `Cannot delete category with ${typesCount} infringement type(s). Remove the types first.`
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("infringement_categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      toast.error("Failed to delete category");
      console.error(error);
    } else {
      toast.success("Category deleted successfully");
      onOpenChange(false);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this category?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Warning</p>
            <p className="text-sm text-muted-foreground">
              Category &quot;{category.name}&quot; will be permanently deleted.
              This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
