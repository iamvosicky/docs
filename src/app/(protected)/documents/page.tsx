'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';

interface Document {
  id: string;
  name: string;
  templateName: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
}

export default function DocumentsPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // In a real implementation, this would fetch documents from an API
    const fetchDocuments = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        const mockDocuments: Document[] = [
          {
            id: 'doc1',
            name: 'Employment Contract - John Doe',
            templateName: 'Employment Contract',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'completed'
          },
          {
            id: 'doc2',
            name: 'NDA - Acme Corp',
            templateName: 'Non-Disclosure Agreement',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            status: 'completed'
          },
          {
            id: 'doc3',
            name: 'Service Agreement - XYZ Ltd',
            templateName: 'Service Agreement',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            status: 'processing'
          }
        ];

        setDocuments(mockDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <Button asChild>
          <Link href="/generate">Generate New Document</Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't generated any documents yet.
              </p>
              <Button asChild>
                <Link href="/generate">Generate Your First Document</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map(document => (
            <Card key={document.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{document.name}</CardTitle>
                    <CardDescription>{document.templateName}</CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    document.status === 'completed' ? 'bg-green-100 text-green-800' :
                    document.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(document.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/documents/${document.id}`}>View</Link>
                  </Button>
                  {document.status === 'completed' && (
                    <Button variant="outline" size="sm">Download</Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
