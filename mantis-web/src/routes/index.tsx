import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Download, Filter, MapPin, Search } from "lucide-react";

import { fetchDashboardData } from "@/lib/api/dashboard";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
} from "@/lib/formatters";
import { ProtectedRoute } from "@/components/protected-route";
import { SystemInitDialog } from "@/components/system-init-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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

const statusTone: Record<string, string> = {
  issued: "bg-orange-100 text-orange-700",
  paid: "bg-emerald-100 text-emerald-700",
  voided: "bg-slate-200 text-slate-600",
  disputed: "bg-amber-100 text-amber-700",
};

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute
      requiredRoles={["officer", "agency_admin", "central_admin"]}
    >
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-red-600">
            Failed to load dashboard
          </p>
          <p className="text-sm text-slate-600">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Outstanding Fines",
      value: formatCurrency(data.summary.outstandingTotal),
      delta: `${formatNumber(data.summary.outstandingCount)} infringements`,
      tone: "text-orange-600",
    },
    {
      label: "Payments Collected",
      value: formatCurrency(data.summary.paymentsTotal),
      delta: `${formatNumber(data.summary.paymentsCount)} this month`,
      tone: "text-emerald-600",
    },
    {
      label: "Disputes Open",
      value: data.summary.openDisputes,
      delta: "Pending reviews",
      tone: "text-amber-600",
    },
    {
      label: "Active Agencies",
      value: data.summary.activeAgencies,
      delta: "Multi-agency coordination",
      tone: "text-slate-600",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            Multi-Agency Dashboard
          </span>
          <h1 className="text-4xl font-semibold text-slate-950">
            MANTIS Oversight
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            Unified view of infringements, payments, and disputes across Police,
            LTA, and council partners. Data streams from Supabase update every 5
            minutes with offline submissions reconciled on sync.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SystemInitDialog />
          <Button variant="outline" className="gap-2">
            <Filter className="size-4" />
            Advanced filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button className="gap-2">
            <ArrowUpRight className="size-4" />
            New infringement
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="gap-4">
            <CardHeader className="gap-3">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <span className="text-3xl font-semibold text-slate-950">
                {card.value}
              </span>
              <span className={`text-sm font-medium ${card.tone}`}>
                {card.delta}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="gap-0">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl">
              Outstanding infringements
            </CardTitle>
            <CardDescription>
              Cross-agency roster of records still awaiting payment or
              resolution. Filter live from Supabase with RLS applied per user
              role.
            </CardDescription>
            <CardAction className="flex gap-2">
              <Input placeholder="Search registration or ID" className="w-60" />
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All agencies</SelectItem>
                  <SelectItem value="police">Fiji Police</SelectItem>
                  <SelectItem value="lta">Land Transport Authority</SelectItem>
                  <SelectItem value="council">Suva City Council</SelectItem>
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Vehicle</th>
                    <th className="px-6 py-3">Offence</th>
                    <th className="px-6 py-3">Agency</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {data.outstanding.map((record, index) => (
                    <tr
                      key={record.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {record.id}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{record.reg}</td>
                      <td className="px-6 py-4 text-slate-700">
                        <span className="flex items-center gap-2">
                          <MapPin className="size-4 text-slate-400" />
                          {record.offence}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {record.agency}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {formatCurrency(record.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`status-pill ${statusTone[record.status]}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDateTime(record.issuedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border justify-between">
            <span className="text-sm text-slate-500">
              Showing latest 50 records. Additional results available via
              advanced filters.
            </span>
            <Button variant="outline" className="gap-2">
              <Search className="size-4" />
              Full search
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent activity</CardTitle>
              <CardDescription>Audit trail snapshot (last 24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-4">
                {data.recentActivity.map((item) => (
                  <li key={item.id} className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </span>
                    <span className="text-sm text-slate-600">
                      {item.detail}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      {formatDateTime(item.timestamp)}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reconciliation tasks</CardTitle>
              <CardDescription>
                Quick wins to close the weekly gap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-4 text-sm">
                {data.reconciliationTasks.map((task) => (
                  <li
                    key={task.label}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-800">
                        {task.label} ({task.count})
                      </span>
                      <span className="text-xs uppercase tracking-wide text-slate-400">
                        Owner: {task.owner}
                      </span>
                    </div>
                    <span className="status-pill bg-slate-100 text-slate-600">
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="gap-0">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl">Agency performance</CardTitle>
            <CardDescription>
              Comparative glance at issued vs paid counts to highlight where
              follow-up or tariff tweaks may be required.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-6 py-3">Agency</th>
                    <th className="px-6 py-3 text-right">Issued</th>
                    <th className="px-6 py-3 text-right">Paid</th>
                    <th className="px-6 py-3 text-right">Disputes</th>
                    <th className="px-6 py-3 text-right">Collection rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.agencyPerformance.map((agency, index) => (
                    <tr
                      key={agency.agency}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {agency.agency}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        {formatNumber(agency.issued)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        {formatNumber(agency.paid)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        {formatNumber(agency.disputes)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {formatPercent(agency.collectionRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border">
            <span className="text-sm text-slate-500">
              Heatmaps and exports available via the reports module.
            </span>
          </CardFooter>
        </Card>

        <Card className="gap-0">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl">Citizen experience</CardTitle>
            <CardDescription>
              Snapshot of portal usage to ensure visibility and payment flows
              remain smooth across channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Portal logins (24h)
              </span>
              <span className="text-xl font-semibold text-slate-900">
                {formatNumber(data.citizenExperience.portalLogins24h)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Payment success rate
              </span>
              <span className="text-xl font-semibold text-emerald-600">
                {formatPercent(data.citizenExperience.paymentSuccessRate)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Open disputes</span>
              <span className="text-xl font-semibold text-amber-600">
                {formatNumber(data.citizenExperience.openDisputes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Overdue disputes</span>
              <span className="text-xl font-semibold text-slate-900">
                {formatNumber(data.citizenExperience.overdueDisputes)}
              </span>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border">
            <Button variant="link" className="gap-2 px-0">
              Explore citizen journey
              <ArrowUpRight className="size-4" />
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
