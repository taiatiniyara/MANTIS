import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Filter, Map, Pin, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/docs/search-and-filters")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        <Link to="/docs" className="font-medium text-primary hover:underline">
          Back to docs
        </Link>
      </div>

      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Find work fast</p>
        <h1 className="text-3xl font-semibold">Search, filters, and saved views</h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Combine search, filters, and maps to zero in on the cases that matter. Save views you reuse every day.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-foreground/5 px-3 py-1">Roles: Everyone</span>
          <span className="rounded-full bg-foreground/5 px-3 py-1">Works on web and mobile</span>
        </div>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" aria-hidden />
              Search bar basics
            </CardTitle>
            <CardDescription>Good for quick lookups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <StepItem text="Search by case title, ID, or address." />
            <StepItem text={'Use quotes for exact phrases, e.g., "vehicle red".'} />
            <StepItem text="Combine with filters for precise results." />
          </CardContent>
        </Card>
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" aria-hidden />
              Filters
            </CardTitle>
            <CardDescription>Slice results by status, owner, or time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <StepItem text="Status: Open, In Progress, Waiting, Closed." />
            <StepItem text="Ownership: Me, My team, Unassigned." />
            <StepItem text="Time: Last 24h, 7d, 30d, or custom range." />
            <StepItem text="Apply multiple filters together for accuracy." />
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="border border-border/80 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" aria-hidden />
              Saved views
            </CardTitle>
            <CardDescription>Pin the views you check daily.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <StepItem text="Combine search + filters, then click Save view." />
            <StepItem text="Name it clearly (e.g., 'My team - overdue')." />
            <StepItem text="Pin it to your home so it is one click away." />
            <StepItem text="Edit or delete saved views from the same menu." />
          </CardContent>
        </Card>
        <Card className="border border-border/80 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" aria-hidden />
              Maps
            </CardTitle>
            <CardDescription>Great for field teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <StepItem text="Toggle map view to see nearby cases." />
            <StepItem text="Use location filters to focus on a district or radius." />
            <StepItem text="Drop a pin to confirm coordinates before assigning." />
          </CardContent>
        </Card>
      </section>

      <section id="maps" className="mt-10 rounded-xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Map tips</h2>
            <p className="text-sm text-muted-foreground">Use layers to validate evidence and avoid duplicates.</p>
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              <li>- Turn on recent activity to spot nearby cases.</li>
              <li>- Check address accuracy before dispatching a team.</li>
              <li>- Use satellite when street names are unclear.</li>
            </ul>
          </div>
          <Pin className="h-10 w-10 text-primary" aria-hidden />
        </div>
      </section>

      <section className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Next up</h2>
          <p className="text-sm text-muted-foreground">Working on the move? Learn the mobile and offline flow.</p>
        </div>
        <Button asChild>
          <Link to="/docs/mobile">Go to mobile guide</Link>
        </Button>
      </section>
    </div>
  );
}

function StepItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-primary">•</span>
      <span>{text}</span>
    </div>
  );
}
