"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

import { Database } from "@/lib/database.types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

type Agency = Database["public"]["Tables"]["agencies"]["Row"];

interface DeleteAgencyDialogProps {
  agency: Agency;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAgencyDialog({
  agency,
  open,
  onOpenChange,
}: DeleteAgencyDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setIsLoading(true);

    try {
      
      
      // Check if agency has associated users
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agency.id);

      if (usersCount && usersCount > 0) {
        setError(
          `Cannot delete this agency. It has ${usersCount} associated user(s). Please reassign or remove the users first.`
        );
        return;
      }

      // Check if agency has associated infringements
      const { count: infringementsCount } = await supabase
        .from("infringements")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agency.id);

      if (infringementsCount && infringementsCount > 0) {
        setError(
          `Cannot delete this agency. It has ${infringementsCount} associated infringement record(s).`
        );
        return;
      }

      // Delete the agency
      const { error: deleteError } = await supabase
        .from("agencies")
        .delete()
        .eq("id", agency.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      // Success! Close dialog and refresh
      toast({
        title: "Agency deleted",
        description: `${agency.name} has been permanently deleted.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Agency</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this agency? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You are about to permanently delete <strong>{agency.name}</strong>.
            This will remove all associated data.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Agency"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
