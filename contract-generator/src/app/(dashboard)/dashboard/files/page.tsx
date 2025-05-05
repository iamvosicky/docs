import { GeneratedFilesTable } from "@/components/dashboard/generated-files-table";

export default function FilesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generated Files</h1>
        <p className="text-muted-foreground">
          View and manage generated document files.
        </p>
      </div>
      
      <GeneratedFilesTable />
    </div>
  );
}
