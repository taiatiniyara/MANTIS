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

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Infringement {
  id: string;
  vehicle_id: string;
  type: {
    code: string;
    name: string;
  };
}

interface DeleteInfringementDialogProps {
  infringement: Infringement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteInfringementDialog({
  infringement,
  open,
  onOpenChange,
}: DeleteInfringementDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  

  async function handleDelete() {
    setLoading(true);

    const { error } = await supabase
      .from("infringements")
      .delete()
      .eq("id", infringement.id);

    if (error) {
      toast.error("Failed to delete infringement");
      console.error(error);
    } else {
      toast.success("Infringement deleted successfully");
      onOpenChange(false);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Infringement</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this infringement record?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Warning</p>
            <p className="text-sm text-muted-foreground">
              Infringement for vehicle &quot;{infringement.vehicle_id}&quot; ({infringement.type.code} - {infringement.type.name}) will be permanently deleted.
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
            {loading ? "Deleting..." : "Delete Infringement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
