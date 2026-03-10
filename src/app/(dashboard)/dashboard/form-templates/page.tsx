"use client";

import { useState } from "react";
import { useFormTemplateStore } from "@/lib/form-template-store";
import { useCompanyProfileStore } from "@/lib/company-profile-store";
import { FormTemplate } from "@/types/form-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { FileText, Pencil, Trash2, Star, Clock } from "lucide-react";

export default function FormTemplatesPage() {
  const { templates, updateTemplate, deleteTemplate, setDefaultTemplate } = useFormTemplateStore();
  const { getProfileById } = useCompanyProfileStore();
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSetDefault = (template: FormTemplate) => {
    setDefaultTemplate(template.id);
    toast.success(`Šablona "${template.name}" byla nastavena jako výchozí`);
  };

  const handleDeleteTemplate = () => {
    if (!editingTemplate) return;
    
    deleteTemplate(editingTemplate.id);
    setIsDeleteDialogOpen(false);
    toast.success("Šablona byla úspěšně smazána");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getDocumentTemplateNames = (documentTemplateIds: string[]) => {
    const templateNames: Record<string, string> = {
      'smlouva-o-dilo': 'Smlouva o dílo',
      'dohoda-o-provedeni-prace': 'Dohoda o provedení práce',
      'kupni-smlouva': 'Kupní smlouva'
    };

    return documentTemplateIds.map(id => templateNames[id] || id);
  };

  const getCompanyProfileNames = (template: FormTemplate) => {
    const profileNames: string[] = [];
    
    if (template.companyProfiles.buyer) {
      const profile = getProfileById(template.companyProfiles.buyer);
      if (profile) profileNames.push(`Kupující: ${profile.name}`);
    }
    
    if (template.companyProfiles.seller) {
      const profile = getProfileById(template.companyProfiles.seller);
      if (profile) profileNames.push(`Prodávající: ${profile.name}`);
    }
    
    if (template.companyProfiles.employer) {
      const profile = getProfileById(template.companyProfiles.employer);
      if (profile) profileNames.push(`Zaměstnavatel: ${profile.name}`);
    }
    
    if (template.companyProfiles.employee) {
      const profile = getProfileById(template.companyProfiles.employee);
      if (profile) profileNames.push(`Pracovník: ${profile.name}`);
    }
    
    return profileNames;
  };

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Šablony formulářů</h1>
        <p className="text-muted-foreground text-lg">
          Spravujte uložené šablony formulářů pro rychlé vytváření dokumentů
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.length > 0 ? (
          templates.map(template => (
            <Card key={template.id} className={`shadow-sm hover:shadow-md transition-shadow ${template.isDefault ? 'border-primary' : ''}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
                {template.isDefault && (
                  <Badge variant="outline" className="ml-2">
                    <Star className="h-3 w-3 mr-1" />
                    Výchozí
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Pro dokumenty:</div>
                    <div className="flex flex-wrap gap-2">
                      {getDocumentTemplateNames(template.documentTemplateIds).map((name, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {getCompanyProfileNames(template).length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Použité profily:</div>
                      <div className="flex flex-wrap gap-2">
                        {getCompanyProfileNames(template).map((name, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {Object.keys(template.values).length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Předvyplněné hodnoty:</div>
                      <div className="text-sm text-muted-foreground">
                        {Object.keys(template.values).length} polí
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Vytvořeno: {formatDate(template.createdAt)}
                </div>
                <div className="flex space-x-2">
                  {!template.isDefault && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetDefault(template)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Nastavit jako výchozí
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingTemplate(template);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Smazat
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">Nemáte žádné uložené šablony formulářů</p>
            <p className="text-sm text-muted-foreground mb-6">
              Šablony formulářů můžete vytvořit při vyplňování dokumentů kliknutím na tlačítko "Uložit jako šablonu"
            </p>
            <Button asChild>
              <a href="/multi-document">Vytvořit nový dokument</a>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Template Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Smazat šablonu</DialogTitle>
            <DialogDescription>
              Opravdu chcete smazat tuto šablonu? Tato akce je nevratná.
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="py-4">
              <p className="font-medium">{editingTemplate.name}</p>
              <p className="text-sm text-muted-foreground">{editingTemplate.description}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Zrušit</Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>Smazat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
