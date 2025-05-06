import { TemplateTable } from "@/components/dashboard/template-table";
import { Button } from "@/components/ui/button";

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Templates</h1>
          <p className="text-muted-foreground text-lg">
            Manage document templates for the contract generation platform.
          </p>
        </div>
        <Button size="lg" className="shadow-sm">
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload New Template
        </Button>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <TemplateTable />
      </div>
    </div>
  );
}
