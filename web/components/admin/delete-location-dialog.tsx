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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle } from "lucide-react";

interface Location {
  id: string;
  name: string;
  type: string;
}

interface DeleteLocationDialogProps {
  location: Location;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLocationDialog({
  location,
  open,
  onOpenChange,
}: DeleteLocationDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const supabase = createClient();

      // Check if location has child locations
      const { data: children } = await supabase
        .from("locations")
        .select("id")
        .eq("parent_id", location.id)
        .limit(1);

      if (children && children.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This location has child locations. Please delete or reassign them first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if location has assigned users
      const { data: users } = await supabase
        .from("users")
        .select("id")
        .eq("location_id", location.id)
        .limit(1);

      if (users && users.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This location has assigned users. Please reassign them first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if location has assigned routes
      const { data: routes } = await supabase
        .from("routes")
        .select("id")
        .eq("location_id", location.id)
        .limit(1);

      if (routes && routes.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This location has assigned routes. Please reassign them first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Delete location
      const { error } = await supabase
        .from("locations")
        .delete()
        .eq("id", location.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location deleted successfully",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting location:", error);
      toast({
        title: "Error",
        description: "Failed to delete location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Location
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this location?
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action cannot be undone.
          </AlertDescription>
        </Alert>

        <div className="rounded-lg border p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>{location.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <span className="capitalize">{location.type}</span>
            </div>
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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
