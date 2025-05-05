import { TemplateTable } from "@/components/dashboard/template-table";
import { Button } from "@/components/ui/button";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Manage document templates for the contract generation platform.
          </p>
        </div>
        <Button>Upload New Template</Button>
      </div>
      
      <TemplateTable />
    </div>
  );
}
