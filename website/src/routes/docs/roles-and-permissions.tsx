import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/docs/roles-and-permissions")({
  component: RouteComponent,
});

const roles: Array<{
  name: string;
  summary: string;
  capabilities: string[];
}> = [
  {
    name: "Super Admin",
    summary: "Full control of the platform for your organization.",
    capabilities: [
      "Manage all agencies, users, and roles",
      "Configure integrations and security policies",
      "View and export all data",
    ],
  },
  {
    name: "Agency Admin",
    summary: "Runs an agency's setup, access, and reporting.",
    capabilities: [
      "Invite and remove users, assign roles",
      "Create teams, locations, and templates",
      "Review escalations and approve exports",
    ],
  },
  {
    name: "Team Leader",
    summary: "Leads a specific team's day-to-day work.",
    capabilities: [
      "Assign or reassign cases within their team",
      "Approve submissions and close cases",
      "View team dashboards and run reports",
    ],
  },
  {
    name: "Officer",
    summary: "Captures, updates, and completes assigned work.",
    capabilities: [
      "Create and edit their own cases",
      "Upload evidence and add comments",
      "Collaborate via mentions and follow updates",
    ],
  },
];

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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Access</p>
        <h1 className="text-3xl font-semibold">Roles and permissions</h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Know what each role can do so you can route requests, approve faster, and keep access tidy.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-foreground/5 px-3 py-1">Admins & leads</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Updated when roles change</span>
        </div>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.name} className="border border-border/80 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                {role.name}
              </CardTitle>
              <CardDescription>{role.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-foreground">
                {role.capabilities.map((item) => (
                  <li key={item} className="flex gap-2">
                    <KeyRound className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="invites" className="mt-12 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Inviting and updating users</h2>
          <p className="text-sm text-muted-foreground">
            Agency Admins handle invites; Super Admins can do this across agencies. Use role-appropriate invites to keep access clean.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border border-border/80">
            <CardHeader>
              <CardTitle>Send an invite</CardTitle>
              <CardDescription>For new teammates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <StepItem text="Open the People or Users page." />
              <StepItem text="Select Invite, enter the work email, and choose the correct role." />
              <StepItem text="Add team/location if known so cases route correctly." />
              <StepItem text="Send. The recipient will finish profile and password." />
            </CardContent>
          </Card>
          <Card className="border border-border/80">
            <CardHeader>
              <CardTitle>Change a role or deactivate</CardTitle>
              <CardDescription>For transfers, departures, or promotions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <StepItem text="Find the user and open their profile." />
              <StepItem text="Update the role. If reducing access, remove unneeded team ownerships." />
              <StepItem text="If the user is leaving, deactivate instead of deleting to keep history." />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-border/80 bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Who can approve exports?</h2>
            <p className="text-sm text-muted-foreground">
              By default, Super Admins and Agency Admins can export. Team Leaders can export their team's data if enabled by policy.
            </p>
          </div>
          <Users className="h-10 w-10 text-primary" aria-hidden />
        </div>
      </section>
    </div>
  );
}

function StepItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <KeyRound className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
      <span>{text}</span>
    </div>
  );
}
