import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Filter, Plus, Search } from "lucide-react";

import { ProtectedRoute } from "@/components/protected-route";
import { CreateInfringementDialog } from "@/components/create-infringement-dialog";
import { InfringementDetailDialog } from "@/components/infringement-detail-dialog";
import { InfringementsTable } from "@/components/infringements-table";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getInfringements,
  type Infringement,
  type InfringementStatus,
} from "@/lib/api/infringements";

export const Route = createFileRoute("/infringements")({
  component: InfringementsPage,
});

function InfringementsPage() {
  return (
    <ProtectedRoute
      requiredRoles={["officer", "agency_admin", "central_admin"]}
    >
      <InfringementsContent />
    </ProtectedRoute>
  );
}

function InfringementsContent() {
  const { canCreateInfringement, agencyName, agencyId } = usePermissions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInfringement, setSelectedInfringement] =
    useState<Infringement | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InfringementStatus | "all">(
    "all"
  );

  // Fetch infringements
  const { data, isLoading } = useQuery({
    queryKey: [
      "infringements",
      {
        agency_id: agencyId,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm,
      },
    ],
    queryFn: () =>
      getInfringements({
        agency_id: agencyId || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
      }),
  });

  const handleViewDetails = (infringement: Infringement) => {
    setSelectedInfringement(infringement);
    setIsDetailDialogOpen(true);
  };

  return (
    <>
      <CreateInfringementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <InfringementDetailDialog
        infringement={selectedInfringement}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Infringements
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {agencyName
                ? `Viewing ${agencyName} infringements`
                : "All infringements across agencies"}
            </p>
          </div>
          {canCreateInfringement && (
            <Button
              className="gap-2 bg-orange-500 hover:bg-orange-600"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="size-4" />
              Record Infringement
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by reg, ID, or driver..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as InfringementStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="voided">Voided</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  <SelectItem value="police">Fiji Police</SelectItem>
                  <SelectItem value="lta">LTA</SelectItem>
                  <SelectItem value="council">Suva City Council</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="size-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Infringement Records</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading..."
                : `${data?.total || 0} infringements found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : data?.infringements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <Search className="size-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-900 dark:text-slate-50">
                  No infringements found
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {canCreateInfringement
                    ? "Start by recording your first infringement"
                    : "No infringements match your filters"}
                </p>
                {canCreateInfringement && (
                  <Button
                    className="mt-4 gap-2 bg-orange-500 hover:bg-orange-600"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="size-4" />
                    Record Infringement
                  </Button>
                )}
              </div>
            ) : (
              <InfringementsTable
                infringements={data?.infringements || []}
                onViewDetails={handleViewDetails}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
