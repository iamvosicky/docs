'use client';

import { useState } from 'react';
import { useAuth } from '../../../components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function GenerateDocumentPage() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [documentName, setDocumentName] = useState('');

  // Mock templates data - in a real app, this would come from an API
  const templates = [
    { id: 'template1', name: 'Employment Contract' },
    { id: 'template2', name: 'Non-Disclosure Agreement' },
    { id: 'template3', name: 'Service Agreement' },
  ];

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateId) {
      toast.error('Please select a template');
      return;
    }
    
    if (!documentName) {
      toast.error('Please enter a document name');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an API to generate the document
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Document generated successfully!');
      
      // In a real implementation, this would redirect to the generated document
      // router.push(`/documents/${generatedDocumentId}`);
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Generate Document</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Document Generation</CardTitle>
          <CardDescription>
            Select a template and provide information to generate your document.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleGenerateDocument}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select 
                value={templateId} 
                onValueChange={setTemplateId}
                disabled={isGenerating}
              >
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentName">Document Name</Label>
              <Input
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter a name for your document"
                disabled={isGenerating}
              />
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                You are logged in as <span className="font-medium">{user?.email || 'Unknown User'}</span>.
                The generated document will be associated with your account.
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating Document...' : 'Generate Document'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
