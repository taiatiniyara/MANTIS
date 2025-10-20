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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      const errorMsg = "Passwords do not match";
      setError(errorMsg);
      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      const errorMsg = "Password must be at least 6 characters long";
      setError(errorMsg);
      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully changed. Redirecting...",
        className: "bg-green-50 border-green-200",
      });
      
      setTimeout(() => {
        router.push("/protected");
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      
      toast({
        title: "Failed to Update Password",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save new password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
