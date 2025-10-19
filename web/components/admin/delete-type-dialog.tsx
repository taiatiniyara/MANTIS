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

interface InfringementType {
  id: string;
  code: string;
  name: string;
}

interface DeleteTypeDialogProps {
  type: InfringementType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTypeDialog({
  type,
  open,
  onOpenChange,
}: DeleteTypeDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setLoading(true);

    // Check if type is used in infringements
    const { count: infringementCount } = await supabase
      .from("infringements")
      .select("*", { count: "exact", head: true })
      .eq("type_id", type.id);

    if (infringementCount && infringementCount > 0) {
      toast.error(
        `Cannot delete type with ${infringementCount} infringement(s). Remove the infringements first.`
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("infringement_types")
      .delete()
      .eq("id", type.id);

    if (error) {
      toast.error("Failed to delete infringement type");
      console.error(error);
    } else {
      toast.success("Infringement type deleted successfully");
      onOpenChange(false);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Infringement Type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this type?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Warning</p>
            <p className="text-sm text-muted-foreground">
              Infringement type &quot;{type.code} - {type.name}&quot; will be permanently deleted.
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
            {loading ? "Deleting..." : "Delete Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
