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

type User = Database["public"]["Tables"]["users"]["Row"];

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setIsLoading(true);

    try {
      

      // Check if user has associated infringements
      const { count: infringementsCount } = await supabase
        .from("infringements")
        .select("*", { count: "exact", head: true })
        .eq("officer_id", user.id);

      if (infringementsCount && infringementsCount > 0) {
        setError(
          `Cannot delete this user. They have ${infringementsCount} associated infringement record(s).`
        );
        return;
      }

      // Delete the user from auth (this should be done via admin API)
      // For now, just delete from users table
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      toast({
        title: "User deleted",
        description: `User has been permanently removed.`,
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
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You are about to permanently delete{" "}
            <strong>{user.position || "this user"}</strong>. This will remove their access to
            the system.
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
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
