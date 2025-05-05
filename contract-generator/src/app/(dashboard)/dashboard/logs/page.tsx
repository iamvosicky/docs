import { AuditLog } from "@/components/dashboard/audit-log";

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          View system audit logs for compliance and security.
        </p>
      </div>
      
      <AuditLog />
    </div>
  );
}
