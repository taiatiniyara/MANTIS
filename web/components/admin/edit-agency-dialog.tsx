"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { useToast } from "@/hooks/use-toast";

type Agency = Database["public"]["Tables"]["agencies"]["Row"];

interface EditAgencyDialogProps {
  agency: Agency;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAgencyDialog({
  agency,
  open,
  onOpenChange,
}: EditAgencyDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(agency.name);
  const [error, setError] = useState<string | null>(null);

  // Reset form when agency changes
  useEffect(() => {
    setName(agency.name);
    setError(null);
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("agencies")
        .update({ name: name.trim() })
        .eq("id", agency.id);

      if (updateError) {
        if (updateError.code === "23505") {
          setError("An agency with this name already exists.");
        } else {
          setError(updateError.message);
        }
        return;
      }

      // Success! Close dialog and refresh
      toast({
        title: "Agency updated",
        description: `${name} has been updated successfully.`,
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
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Agency</DialogTitle>
            <DialogDescription>
              Update the agency name. Changes will be reflected immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Agency Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Fiji Police Force"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
