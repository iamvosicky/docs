"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Users, Briefcase, ShoppingCart, Lock } from "lucide-react";
import Link from "next/link";
import { useCases } from "./use-case-shortcuts";
import { useAuth } from "@/components/auth/auth-provider";

export function HomeQuickButtons() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {useCases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((useCase) => (
            <Card
              key={useCase.id}
              className="cursor-pointer hover:shadow-md transition-shadow duration-300 border-primary/20 hover:border-primary"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {useCase.icon}
                  <CardTitle className="text-lg">{useCase.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{useCase.description}</CardDescription>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {useCase.templateIds.length} {
                      useCase.templateIds.length === 1 ? 'dokument' :
                      useCase.templateIds.length >= 2 && useCase.templateIds.length <= 4 ? 'dokumenty' : 'dokumentů'
                    }
                  </span>
                </div>
                {isAuthenticated ? (
                  <Button
                    asChild
                    className="w-full mt-4"
                    variant="default"
                  >
                    <Link href={`/generate?templates=${useCase.templateIds.join(',')}`}>
                      Vytvořit dokumenty
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full mt-4"
                    variant="default"
                  >
                    <Link href={`/login?returnUrl=/generate?templates=${useCase.templateIds.join(',')}`}>
                      <Lock className="h-4 w-4 mr-2" />
                      Přihlásit se pro vytvoření
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Žádné rychlé volby nejsou k dispozici.</p>
        </div>
      )}
    </div>
  );
}
