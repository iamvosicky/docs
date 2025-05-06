"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for templates - will be replaced with API data
const templates = [
  {
    id: "smlouva-o-dilo",
    name: "Smlouva o dílo",
    description: "B2B Smlouva o dílo (vzor)",
    tags: ["business", "contract"]
  },
  {
    id: "dohoda-o-provedeni-prace",
    name: "Dohoda o provedení práce",
    description: "DPP (zaměstnanec ≤300 hod/rok)",
    tags: ["employment", "contract"]
  },
  {
    id: "kupni-smlouva",
    name: "Kupní smlouva",
    description: "Standardní kupní smlouva na movitou věc",
    tags: ["purchase", "contract"]
  }
];

export function TemplateCatalog() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{template.name}</CardTitle>
            <CardDescription className="text-sm">{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pt-2">
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button asChild className="w-full">
              <Link href={`/template/${template.id}`}>
                Use Template
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
