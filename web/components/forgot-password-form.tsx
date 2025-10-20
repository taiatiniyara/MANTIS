"use client";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      
      setSuccess(true);
      
      toast({
        title: "Reset Email Sent!",
        description: `Password reset instructions have been sent to ${email}`,
        className: "bg-green-50 border-green-200",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      
      toast({
        title: "Failed to Send Reset Email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 p-4">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                Reset Email Sent!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Check your inbox at <strong>{email}</strong>
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  If an account exists with this email, you will receive password reset instructions within a few minutes.
                </p>
                <p>
                  Don&apos;t see it? Check your spam folder or request a new link.
                </p>
              </div>
            </div>
          </div>

          <Link href="/auth/login">
            <Button variant="outline" className="w-full h-11" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Work Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@agency.gov.fj"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the email you use to sign in
                </p>
              </div>
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full h-11" disabled={isLoading} size="lg">
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Remember your password?
              </span>
            </div>
          </div>

          <Link href="/auth/login" className="mt-6 block">
            <Button variant="outline" className="w-full h-11" type="button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
