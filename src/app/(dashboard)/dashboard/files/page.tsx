import { GeneratedFilesTable } from "@/components/dashboard/generated-files-table";

export default function FilesPage() {
  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Generated Files</h1>
        <p className="text-muted-foreground text-lg">
          View and manage generated document files.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <GeneratedFilesTable />
      </div>
    </div>
  );
}
