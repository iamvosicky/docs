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
import { Separator } from "@/components/ui/separator";
import { GoogleButton, AppleButton } from "@/components/auth/social-buttons";

interface SignInProps {
  returnUrl?: string;
}

export function SignIn({ returnUrl = '/' }: SignInProps) {
  const [email, setEmail] = useState("");
  const { login, loginWithGoogle, loginWithApple, isLoading } = useAuth();
  const router = useRouter();
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsEmailLoading(true);
    try {
      const success = await login(email);

      if (success) {
        toast.success("Login successful!");
        router.push(returnUrl);
      } else {
        toast.error("Failed to sign in. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // The auth provider will handle the redirect
    } catch (error) {
      toast.error("Google sign in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      await loginWithApple();
      // The auth provider will handle the redirect
    } catch (error) {
      toast.error("Apple sign in failed. Please try again.");
      setIsAppleLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Choose your preferred sign in method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Social Login Buttons */}
          <div className="grid gap-3">
            <GoogleButton
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              disabled={isLoading}
            />

            <AppleButton
              onClick={handleAppleSignIn}
              isLoading={isAppleLoading}
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleSignIn}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isEmailLoading}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isEmailLoading}
              >
                {isEmailLoading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Signing in...</span>
                  </span>
                ) : (
                  "Sign in with Email"
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground mt-2">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary underline underline-offset-4 hover:text-primary/90">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary underline underline-offset-4 hover:text-primary/90">
            Privacy Policy
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
