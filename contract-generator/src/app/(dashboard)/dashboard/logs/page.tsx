import { AuditLog } from "@/components/dashboard/audit-log";

export default function LogsPage() {
  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Audit Logs</h1>
        <p className="text-muted-foreground text-lg">
          View system audit logs for compliance and security.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <AuditLog />
      </div>
    </div>
  );
}
