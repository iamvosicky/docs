"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for audit logs - will be replaced with API data
const logs = [
  {
    id: "1",
    timestamp: "2025-05-05 10:00:00",
    actor: "admin@example.com",
    action: "Template Created",
    object: "Smlouva o dílo"
  },
  {
    id: "2",
    timestamp: "2025-05-05 10:01:00",
    actor: "admin@example.com",
    action: "Template Created",
    object: "Dohoda o provedení práce"
  },
  {
    id: "3",
    timestamp: "2025-05-05 10:02:00",
    actor: "admin@example.com",
    action: "Template Created",
    object: "Kupní smlouva"
  }
];

export function AuditLog() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Object</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.timestamp}</TableCell>
              <TableCell>{log.actor}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.object}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
