"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { LoadingSpinner } from "@/components/ui/loading";

interface SignInProps {
  returnUrl?: string;
}

export function SignIn({ returnUrl = '/' }: SignInProps) {
  const [email, setEmail] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const success = await login(email);

    if (success) {
      toast.success("Login successful!");
      router.push(returnUrl);
    } else {
      toast.error("Failed to sign in. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your email to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Signing in...</span>
              </span>
            ) : (
              "Send Magic Link"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
