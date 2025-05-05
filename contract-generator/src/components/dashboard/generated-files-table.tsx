"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for files - will be replaced with API data
const files = [
  // Empty for now - will be populated when files are generated
];

export function GeneratedFilesTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File ID</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Formats</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.length > 0 ? (
            files.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.id}</TableCell>
                <TableCell>{file.template}</TableCell>
                <TableCell>{file.user}</TableCell>
                <TableCell>{file.created}</TableCell>
                <TableCell>{file.formats}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No files have been generated yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
