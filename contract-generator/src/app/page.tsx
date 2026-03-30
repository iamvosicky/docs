"use client";

import { TemplateCatalog } from "@/components/template-catalog";
import { HomeQuickButtons } from "@/components/home-quick-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { FileText, Shield, Zap, ArrowRight, Lock } from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-6">
              <Zap className="h-3.5 w-3.5" />
              Rychlé a jednoduché
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Právní dokumenty{" "}
              <span className="text-primary">bez komplikací</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
              Generujte profesionální právní dokumenty rychle a přesně. Smlouvy, plné moci, stanovy a další — vše na jednom místě.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="shadow-sm">
                <Link href={isAuthenticated ? "/generate" : "/login?returnUrl=/generate"}>
                  <FileText className="mr-2 h-5 w-5" />
                  Generovat dokument
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">
                    Přihlásit se
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features row */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Rychlé generování</h3>
                <p className="text-sm text-muted-foreground">Dokumenty připravené během sekund</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Právně přesné</h3>
                <p className="text-sm text-muted-foreground">Šablony vytvořené právními experty</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">PDF &amp; DOCX</h3>
                <p className="text-sm text-muted-foreground">Stahujte ve formátu dle potřeby</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">

          {/* Authentication Notice */}
          {!isAuthenticated && (
            <Card className="mb-10 border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-blue-900 dark:text-blue-100">Přihlášení je vyžadováno</CardTitle>
                </div>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Pro generování dokumentů je nutné se přihlásit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Abyste mohli generovat a spravovat dokumenty, je nutné se přihlásit nebo vytvořit účet.
                  Přihlášení vám umožní:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Generovat právní dokumenty</li>
                  <li>Ukládat a spravovat vaše dokumenty</li>
                  <li>Přistupovat k vašim dokumentům odkudkoliv</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/login">Přihlásit se</Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Shortcuts Section */}
          <section className="mb-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Rychlé volby</h2>
                <p className="text-muted-foreground mt-1">
                  Vyberte použití a přejděte přímo na generování dokumentů
                </p>
              </div>
            </div>
            <HomeQuickButtons />
          </section>

          {/* Documents Section */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Jednotlivé dokumenty</h2>
                <p className="text-muted-foreground mt-1">
                  Vyberte konkrétní dokument pro vygenerování
                </p>
              </div>
            </div>
            <TemplateCatalog />
          </section>
        </div>
      </div>
    </div>
  );
}
