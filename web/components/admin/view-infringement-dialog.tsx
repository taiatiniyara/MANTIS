"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Infringement {
  id: string;
  vehicle_id: string;
  notes: string | null;
  issued_at: string;
  officer: {
    position: string | null;
  } | null;
  agency: {
    name: string;
  } | null;
  team: {
    name: string;
  } | null;
  route: {
    name: string;
  } | null;
  type: {
    code: string;
    name: string;
    fine_amount: number | null;
    demerit_points: number | null;
    gl_code: string;
    category: {
      name: string;
    };
  };
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

interface ViewInfringementDialogProps {
  infringement: Infringement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewInfringementDialog({
  infringement,
  open,
  onOpenChange,
}: ViewInfringementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Infringement Details</DialogTitle>
          <DialogDescription>
            Vehicle: {infringement.vehicle_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Infringement Type */}
          <div>
            <h4 className="text-sm font-medium mb-3">Infringement Type</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">{infringement.type.code}</Badge>
                <span className="font-medium">{infringement.type.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Category: {infringement.type.category.name}</span>
                {infringement.type.fine_amount && (
                  <span>Fine: ${infringement.type.fine_amount.toFixed(2)}</span>
                )}
                {infringement.type.demerit_points && (
                  <span>Points: {infringement.type.demerit_points}</span>
                )}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">GL Code: </span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {infringement.type.gl_code}
                </code>
              </div>
            </div>
          </div>

          <Separator />

          {/* Officer & Team Info */}
          <div className="grid grid-cols-2 gap-4">
            {infringement.officer && (
              <div>
                <h4 className="text-sm font-medium mb-2">Officer</h4>
                <p className="text-sm">{infringement.officer.position || "Officer"}</p>
              </div>
            )}
            {infringement.agency && (
              <div>
                <h4 className="text-sm font-medium mb-2">Agency</h4>
                <p className="text-sm">{infringement.agency.name}</p>
              </div>
            )}
            {infringement.team && (
              <div>
                <h4 className="text-sm font-medium mb-2">Team</h4>
                <p className="text-sm">{infringement.team.name}</p>
              </div>
            )}
            {infringement.route && (
              <div>
                <h4 className="text-sm font-medium mb-2">Route</h4>
                <p className="text-sm">{infringement.route.name}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Location & Time */}
          <div className="grid grid-cols-2 gap-4">
            {(infringement.address || (infringement.latitude && infringement.longitude)) && (
              <div>
                <h4 className="text-sm font-medium mb-2">Location</h4>
                <p className="text-sm">
                  {infringement.address || (
                    <span className="text-muted-foreground">
                      {infringement.latitude?.toFixed(6)}, {infringement.longitude?.toFixed(6)}
                    </span>
                  )}
                </p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium mb-2">Issued</h4>
              <p className="text-sm">
                {new Date(infringement.issued_at).toLocaleDateString()}
                {" at "}
                {new Date(infringement.issued_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {infringement.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {infringement.notes}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
