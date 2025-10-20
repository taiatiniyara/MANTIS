"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";


interface NotificationPreferencesProps {
  userId: string;
  userRole: string;
  type: "email" | "in-app" | "digest";
}

export function NotificationPreferences({
  userId,
  userRole,
  type,
}: NotificationPreferencesProps) {
  const [loading, setLoading] = useState(false);

  // Email notifications settings
  const [emailSettings, setEmailSettings] = useState({
    newInfringement: true,
    dailySummary: false,
    weeklySummary: true,
    systemAlerts: true,
    teamUpdates: true,
  });

  // In-app notifications settings
  const [inAppSettings, setInAppSettings] = useState({
    newInfringement: true,
    assignments: true,
    teamActivity: true,
    systemAlerts: true,
  });

  // Digest settings
  const [digestSettings, setDigestSettings] = useState({
    enabled: true,
    frequency: "daily" as "daily" | "weekly" | "monthly",
    time: "09:00",
    includeCharts: true,
    includeTopViolations: true,
    includeOfficerPerformance: userRole !== "officer",
  });

  async function handleSave() {
    setLoading(true);

    try {
      

      // In a real implementation, you would save these to a database
      // For now, we'll just show a success message
      const settings = {
        type,
        userId,
        email: emailSettings,
        inApp: inAppSettings,
        digest: digestSettings,
      };

      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Notification preferences saved successfully");
      console.log("Saved settings:", settings);
    } catch (error) {
      toast.error("Failed to save preferences");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (type === "email") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>New Infringement Recorded</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when a new infringement is recorded
            </p>
          </div>
          <Switch
            checked={emailSettings.newInfringement}
            onCheckedChange={(checked) =>
              setEmailSettings({ ...emailSettings, newInfringement: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Daily Summary</Label>
            <p className="text-sm text-muted-foreground">
              Receive a daily summary of infringements
            </p>
          </div>
          <Switch
            checked={emailSettings.dailySummary}
            onCheckedChange={(checked) =>
              setEmailSettings({ ...emailSettings, dailySummary: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Weekly Summary</Label>
            <p className="text-sm text-muted-foreground">
              Receive a weekly summary report
            </p>
          </div>
          <Switch
            checked={emailSettings.weeklySummary}
            onCheckedChange={(checked) =>
              setEmailSettings({ ...emailSettings, weeklySummary: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>System Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Important system notifications and updates
            </p>
          </div>
          <Switch
            checked={emailSettings.systemAlerts}
            onCheckedChange={(checked) =>
              setEmailSettings({ ...emailSettings, systemAlerts: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Team Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about team changes and updates
            </p>
          </div>
          <Switch
            checked={emailSettings.teamUpdates}
            onCheckedChange={(checked) =>
              setEmailSettings({ ...emailSettings, teamUpdates: checked })
            }
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
          {loading ? "Saving..." : "Save Email Preferences"}
        </Button>
      </div>
    );
  }

  if (type === "in-app") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>New Infringements</Label>
            <p className="text-sm text-muted-foreground">
              Toast notifications for new infringements
            </p>
          </div>
          <Switch
            checked={inAppSettings.newInfringement}
            onCheckedChange={(checked) =>
              setInAppSettings({ ...inAppSettings, newInfringement: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Assignments</Label>
            <p className="text-sm text-muted-foreground">
              When you're assigned to a team or route
            </p>
          </div>
          <Switch
            checked={inAppSettings.assignments}
            onCheckedChange={(checked) =>
              setInAppSettings({ ...inAppSettings, assignments: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Team Activity</Label>
            <p className="text-sm text-muted-foreground">
              Updates from your team members
            </p>
          </div>
          <Switch
            checked={inAppSettings.teamActivity}
            onCheckedChange={(checked) =>
              setInAppSettings({ ...inAppSettings, teamActivity: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>System Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Critical system notifications
            </p>
          </div>
          <Switch
            checked={inAppSettings.systemAlerts}
            onCheckedChange={(checked) =>
              setInAppSettings({ ...inAppSettings, systemAlerts: checked })
            }
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
          {loading ? "Saving..." : "Save In-App Preferences"}
        </Button>
      </div>
    );
  }

  if (type === "digest") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Digest Emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive periodic summary reports
            </p>
          </div>
          <Switch
            checked={digestSettings.enabled}
            onCheckedChange={(checked) =>
              setDigestSettings({ ...digestSettings, enabled: checked })
            }
          />
        </div>

        {digestSettings.enabled && (
          <>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={digestSettings.frequency}
                onValueChange={(value: "daily" | "weekly" | "monthly") =>
                  setDigestSettings({ ...digestSettings, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Delivery Time</Label>
              <Select
                value={digestSettings.time}
                onValueChange={(value) =>
                  setDigestSettings({ ...digestSettings, time: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">6:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Charts</Label>
                <p className="text-sm text-muted-foreground">
                  Add visual charts to digest emails
                </p>
              </div>
              <Switch
                checked={digestSettings.includeCharts}
                onCheckedChange={(checked) =>
                  setDigestSettings({ ...digestSettings, includeCharts: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Top Violations</Label>
                <p className="text-sm text-muted-foreground">
                  Include top violation types
                </p>
              </div>
              <Switch
                checked={digestSettings.includeTopViolations}
                onCheckedChange={(checked) =>
                  setDigestSettings({ ...digestSettings, includeTopViolations: checked })
                }
              />
            </div>

            {userRole !== "officer" && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Officer Performance</Label>
                  <p className="text-sm text-muted-foreground">
                    Include officer performance metrics
                  </p>
                </div>
                <Switch
                  checked={digestSettings.includeOfficerPerformance}
                  onCheckedChange={(checked) =>
                    setDigestSettings({
                      ...digestSettings,
                      includeOfficerPerformance: checked,
                    })
                  }
                />
              </div>
            )}
          </>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
          {loading ? "Saving..." : "Save Digest Preferences"}
        </Button>
      </div>
    );
  }

  return null;
}
