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
      toast.error("Zadejte prosím svou e-mailovou adresu.");
      return;
    }

    setIsEmailLoading(true);
    try {
      const success = await login(email);

      if (success) {
        toast.success("Přihlášení proběhlo úspěšně!");
        router.push(returnUrl);
      } else {
        toast.error("Přihlášení se nezdařilo. Zkuste to prosím znovu.");
      }
    } catch (error) {
      toast.error("Nastala chyba. Zkuste to prosím znovu.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      toast.error("Přihlášení přes Google se nezdařilo. Zkuste to prosím znovu.");
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      await loginWithApple();
    } catch (error) {
      toast.error("Přihlášení přes Apple se nezdařilo. Zkuste to prosím znovu.");
      setIsAppleLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Přihlásit se</CardTitle>
        <CardDescription>
          Vyberte způsob přihlášení
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
                nebo
              </span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleSignIn}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vas@email.cz"
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
                    <span className="ml-2">Přihlašování…</span>
                  </span>
                ) : (
                  "Přihlásit se e-mailem"
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground mt-2">
          Přihlášením souhlasíte s{" "}
          <a href="#" className="text-primary underline underline-offset-4 hover:text-primary/90">
            podmínkami užívání
          </a>{" "}
          a{" "}
          <a href="#" className="text-primary underline underline-offset-4 hover:text-primary/90">
            zásadami ochrany osobních údajů
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
