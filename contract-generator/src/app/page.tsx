"use client";

import { TemplateCatalog } from "@/components/template-catalog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-center sm:text-left">Contract Templates</h1>
            <p className="text-muted-foreground text-center sm:text-left text-lg">
              Select a template to generate a customized legal document
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end">
            <Button asChild size="lg" className="shadow-sm">
              <Link href="/multi-document">
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
                Multi-Document Generator
              </Link>
            </Button>
          </div>
        </div>
        <TemplateCatalog />
      </div>
    </div>
  );
}
