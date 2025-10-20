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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      
      console.log("Login successful:", authData);
      // Show success toast immediately
      toast({
        title: "Login Successful!",
        description: "Welcome back. Redirecting to your dashboard...",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });
      
      // Try to get user profile to determine redirect, but don't fail if it's not available
      let redirectPath = "/protected"; // Default redirect
      
      try {
        console.log(authData.user.id);
        const { data: userData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        console.log("User profile data:", userData);
        
        if (!profileError && userData) {
          console.log("User role:", userData.role, authData.user);
          // Determine redirect based on role if profile is available
          redirectPath = userData.role === "super_admin" ? "/admin" : "/protected";
        }
      } catch (profileError) {
        // Profile fetch failed, but that's okay - use default redirect
        console.warn("Could not fetch user profile, using default redirect:", profileError);
      }
      
      // Redirect after a short delay so user sees the toast
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh(); // Refresh to ensure session is updated
      }, 500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="officer@police.gov.fj"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="ml-auto text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </div>
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <Button type="submit" className="w-full h-11" disabled={isLoading} size="lg">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            New to MANTIS?
          </span>
        </div>
      </div>

      <Link href="/auth/sign-up">
        <Button variant="outline" className="w-full h-11" type="button">
          Create Staff Account
        </Button>
      </Link>
    </div>
  );
}
