"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the map component (client-side only)
const PolygonEditor = dynamic(
  () => import("@/components/maps/polygon-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

interface Coordinate {
  lat: number;
  lng: number;
}

interface RouteData {
  id: string;
  name: string;
  description?: string | null;
  coverage_area?: Coordinate[] | null;
}

interface EditRoutePolygonDialogProps {
  route: RouteData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoutePolygonDialog({
  route,
  open,
  onOpenChange,
}: EditRoutePolygonDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [polygon, setPolygon] = useState<Coordinate[]>(
    route.coverage_area || []
  );

  // Reset polygon only when dialog opens with a new route
  useEffect(() => {
    if (open) {
      console.log("Dialog opened with route coverage_area:", route.coverage_area);
      setPolygon(route.coverage_area || []);
    }
  }, [open, route.id]); // Only reset when dialog opens or route ID changes

  // Track polygon state changes
  useEffect(() => {
    console.log("Polygon state updated to:", polygon);
  }, [polygon]);

  const handleSave = async () => {
    console.log("=== SAVE BUTTON CLICKED ===");
    console.log("Current polygon state:", polygon);
    console.log("Polygon length:", polygon.length);
    
    if (polygon.length < 3) {
      console.log("Validation failed: less than 3 points");
      toast({
        title: "Invalid polygon",
        description: "A polygon must have at least 3 points",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting to save to database...");
      console.log("Route ID:", route.id);
      console.log("Polygon to save:", JSON.stringify(polygon));
      
      const { data, error } = await supabase
        .from("routes")
        .update({
          coverage_area: polygon,
        })
        .eq("id", route.id)
        .select();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Successfully saved polygon. Response data:", data);

      toast({
        title: "Success",
        description: "Route coverage area updated successfully",
      });

      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating route polygon:", error);
      toast({
        title: "Error",
        description: "Failed to update route coverage area",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Route Coverage Area</DialogTitle>
          <DialogDescription>
            Draw or modify the polygon defining the coverage area for{" "}
            <strong>{route.name}</strong>. Click on the map to add points, drag
            points to move them, or click on a point to remove it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <PolygonEditor
            initialPolygon={polygon}
            onChange={setPolygon}
            height={400}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Coverage Area"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
