"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function MultiDocumentPage() {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const router = useRouter();

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates((prev: string[]) =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleContinue = () => {
    if (selectedTemplates.length === 0) {
      return;
    }

    // Create a comma-separated list of template IDs
    const templateIds = selectedTemplates.join(',');
    router.push(`/multi-document/form?templates=${templateIds}`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline flex items-center mb-4">
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
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </a>
          <h1 className="text-4xl font-bold mb-3">Multi-Document Generator</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Select multiple document templates to generate at once with a single form.
          </p>
        </div>

        <div className="bg-card p-8 rounded-lg border shadow-sm mb-8">
          <h2 className="text-2xl font-semibold mb-6">Select Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`flex flex-col hover:shadow-md transition-shadow duration-300 ${
                  selectedTemplates.includes(template.id) ? 'border-primary ring-1 ring-primary' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </div>
                    <Checkbox
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={() => handleTemplateToggle(template.id)}
                      className="h-5 w-5"
                    />
                  </div>
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
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} selected
          </p>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={selectedTemplates.length === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
