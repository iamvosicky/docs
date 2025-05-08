"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Users, Briefcase, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCases } from "./use-case-shortcuts";

export function HomeQuickButtons() {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Rychlé volby</h2>
      <p className="text-muted-foreground mb-6">
        Vyberte použití a přejděte přímo na generování dokumentů
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {useCases.map((useCase) => (
          <Card
            key={useCase.id}
            className="cursor-pointer hover:shadow-md transition-shadow duration-300"
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
              <Button 
                asChild 
                className="w-full mt-4"
                variant="outline"
              >
                <Link href={`/multi-document/form?templates=${useCase.templateIds.join(',')}`}>
                  Vytvořit dokumenty
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
