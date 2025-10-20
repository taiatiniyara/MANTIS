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

import { AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface RouteData {
  id: string;
  name: string;
}

interface DeleteRouteDialogProps {
  route: RouteData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRouteDialog({
  route,
  open,
  onOpenChange,
}: DeleteRouteDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      

      // Check if route has assigned teams
      const { data: teamRoutes } = await supabase
        .from("team_routes")
        .select("team_id")
        .eq("route_id", route.id)
        .limit(1);

      if (teamRoutes && teamRoutes.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This route is assigned to teams. Please unassign it first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Delete route
      const { error } = await supabase
        .from("routes")
        .delete()
        .eq("id", route.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route deleted successfully",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting route:", error);
      toast({
        title: "Error",
        description: "Failed to delete route. Please try again.",
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
            Delete Route
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this route?
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
              <span className="font-medium">Route Name:</span>
              <span>{route.name}</span>
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
            {loading ? "Deleting..." : "Delete Route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
