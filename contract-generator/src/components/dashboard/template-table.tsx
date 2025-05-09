"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for templates - will be replaced with API data
const templates = [
  {
    id: "smlouva-o-dilo",
    name: "Smlouva o dílo",
    version: "1.0",
    created: "2025-05-01",
    status: "Active"
  },
  {
    id: "dohoda-o-provedeni-prace",
    name: "Dohoda o provedení práce",
    version: "1.0",
    created: "2025-05-01",
    status: "Active"
  },
  {
    id: "kupni-smlouva",
    name: "Kupní smlouva",
    version: "1.0",
    created: "2025-05-01",
    status: "Active"
  }
];

export function TemplateTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length > 0 ? (
            templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.version}</TableCell>
                <TableCell>{template.created}</TableCell>
                <TableCell>{template.status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Žádné šablony nejsou k dispozici.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
