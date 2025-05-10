'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'sonner';

interface DocumentGeneratorProps {
  templateId: string;
  templateName: string;
  formData: Record<string, string>;
}

export function DocumentGenerator({ templateId, templateName, formData }: DocumentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<{ pdf?: string; docx?: string } | null>(null);

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setDownloadLinks(null);

    try {
      // Call the API to generate the document
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templates: [templateId],
          formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const data = await response.json();

      if (data.success && data.links && data.links[templateId]) {
        setDownloadLinks(data.links[templateId]);
        toast.success('Document generated successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Document</CardTitle>
        <CardDescription>
          Generate a document based on the template "{templateName}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        {downloadLinks ? (
          <div className="space-y-4">
            <p className="text-green-600 dark:text-green-400">
              Document generated successfully!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {downloadLinks.pdf && (
                <Button asChild variant="outline">
                  <a href={downloadLinks.pdf} target="_blank" rel="noopener noreferrer">
                    Download PDF
                  </a>
                </Button>
              )}
              {downloadLinks.docx && (
                <Button asChild variant="outline">
                  <a href={downloadLinks.docx} target="_blank" rel="noopener noreferrer">
                    Download DOCX
                  </a>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p>
            Click the button below to generate your document based on the provided information.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateDocument} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating...
            </>
          ) : (
            'Generate Document'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
