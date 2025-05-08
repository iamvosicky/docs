"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadDocumentsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentTags, setDocumentTags] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Prosím vyberte soubor k nahrání");
      return;
    }

    if (!documentName.trim()) {
      toast.error("Prosím zadejte název dokumentu");
      return;
    }

    setIsUploading(true);

    try {
      // In a real implementation, this would be an API call to upload the file
      // For this demo, we'll simulate a successful upload after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add the file to the list of uploaded files
      setUploadedFiles(prev => [...prev, documentName]);
      
      // Reset the form
      setSelectedFile(null);
      setDocumentName("");
      setDocumentDescription("");
      setDocumentTags("");
      
      // Show success message
      toast.success("Dokument byl úspěšně nahrán");
      
      // Reset the file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Chyba při nahrávání souboru. Zkuste to prosím znovu.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Nahrát dokumenty</h1>
        <p className="text-muted-foreground text-lg">
          Nahrajte nové dokumenty a šablony do systému.
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Nahrát dokument</TabsTrigger>
          <TabsTrigger value="history">Historie nahrávání</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <form onSubmit={handleUpload}>
              <CardHeader>
                <CardTitle>Nahrát nový dokument</CardTitle>
                <CardDescription>
                  Nahrajte nový dokument nebo šablonu do systému. Podporované formáty jsou DOCX, PDF a HTML.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Soubor dokumentu</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".docx,.pdf,.html"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Vybraný soubor: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="document-name">Název dokumentu</Label>
                  <Input
                    id="document-name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Např. Smlouva o dílo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="document-description">Popis dokumentu</Label>
                  <Textarea
                    id="document-description"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="Stručný popis dokumentu..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="document-tags">Tagy (oddělené čárkou)</Label>
                  <Input
                    id="document-tags"
                    value={documentTags}
                    onChange={(e) => setDocumentTags(e.target.value)}
                    placeholder="Např. smlouva, obchod, b2b"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Nahrávání...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Nahrát dokument
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historie nahrávání</CardTitle>
              <CardDescription>
                Seznam nedávno nahraných dokumentů.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {uploadedFiles.length > 0 ? (
                <div className="space-y-4">
                  {uploadedFiles.map((fileName, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-md">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          Nahráno {new Date().toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Žádné nahrané dokumenty</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Zatím jste nenahráli žádné dokumenty. Přejděte na záložku "Nahrát dokument" pro nahrání nového dokumentu.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
