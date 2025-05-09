"use client";

import { TemplateCatalog } from "@/components/template-catalog";
import { HomeQuickButtons } from "@/components/home-quick-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "../components/auth/auth-provider";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-center sm:text-left">Právní dokumenty</h1>
            <p className="text-muted-foreground text-center sm:text-left text-lg">
              Vygenerujte vlastní právní dokumenty snadno a rychle
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end">
            <Button asChild size="lg" className="shadow-sm">
              <Link href={isAuthenticated ? "/generate" : "/login?returnUrl=/generate"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1" />
                  <path d="M15 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" />
                  <rect width="8" height="8" x="8" y="3" rx="1" />
                  <path d="M8 21v-4" />
                  <path d="M16 21v-4" />
                  <path d="M12 21v-4" />
                </svg>
                Generovat dokument
              </Link>
            </Button>
          </div>
        </div>

        {/* Authentication Notice */}
        {!isAuthenticated && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle>Přihlášení je vyžadováno</CardTitle>
              <CardDescription>
                Pro generování dokumentů je nutné se přihlásit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Abyste mohli generovat a spravovat dokumenty, je nutné se přihlásit nebo vytvořit účet.
                Přihlášení vám umožní:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>Generovat právní dokumenty</li>
                <li>Ukládat a spravovat vaše dokumenty</li>
                <li>Přistupovat k vašim dokumentům odkudkoliv</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/login">Přihlásit se</Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Shortcuts Section */}
        <section className="mb-12">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-3xl font-bold">Rychlé volby</h2>
            <p className="text-muted-foreground text-lg">
              Vyberte použití a přejděte přímo na generování dokumentů
            </p>
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <HomeQuickButtons />
          </div>
        </section>

        {/* Documents Section */}
        <section>
          <div className="border-b pb-4 mb-6">
            <h2 className="text-3xl font-bold">Jednotlivé dokumenty</h2>
            <p className="text-muted-foreground text-lg">
              Vyberte konkrétní dokument pro vygenerování
            </p>
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <TemplateCatalog />
          </div>
        </section>
      </div>
    </div>
  );
}
