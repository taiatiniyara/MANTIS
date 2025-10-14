import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { checkSystemStatus, createFirstAdmin } from "@/lib/api/system";

export const Route = createFileRoute("/system-init")({
  component: SystemInitPage,
});

function SystemInitPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [status, setStatus] = useState<{
    hasUsers: boolean;
    userCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check system status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusData = await checkSystemStatus();
      setStatus(statusData);

      // If system already has users, redirect to login
      if (statusData.hasUsers) {
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 2000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check system status"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setInitializing(true);
      setError(null);

      // Create the first admin user with predefined credentials
      await createFirstAdmin({
        email: "taiatiniyara@gmail.com",
        password: "Jesus777#",
        displayName: "Taia Tiniyara",
      });

      setSuccess(true);

      // Redirect to dashboard after successful initialization
      setTimeout(() => {
        navigate({ to: "/" });
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize system. Please try again."
      );
      setInitializing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            MANTIS System
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            System Initialization
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Checking system status...
            </p>
          </div>
        )}

        {!loading && status && status.hasUsers && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                System Already Initialized
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Found {status.userCount} user{status.userCount !== 1 ? "s" : ""}{" "}
                in the system.
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Redirecting to login...
              </p>
            </div>
          </div>
        )}

        {!loading && status && !status.hasUsers && !success && (
          <div className="space-y-6">
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                    No Users Found
                  </h3>
                  <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                    The system has no users. Initialize the system by creating
                    the first administrator account.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                First Administrator Account
              </h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>Taia Tiniyara</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>taiatiniyara@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Role:</span>
                  <span>Central Administrator</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <Button
              onClick={handleInitialize}
              disabled={initializing}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              {initializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing System...
                </>
              ) : (
                "Initialize System"
              )}
            </Button>
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                System Initialized Successfully!
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Administrator account created successfully.
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
