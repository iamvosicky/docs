"use client";

import { useState } from 'react';
import { useFormTemplateStore } from '@/lib/form-template-store';
import { useCompanyProfileStore } from '@/lib/company-profile-store';
import { FormTemplate } from '@/types/form-template';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Star, Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface FormTemplateSelectorProps {
  documentTemplateIds: string[];
  onSelect: (template: FormTemplate) => void;
}

export function FormTemplateSelector({ documentTemplateIds, onSelect }: FormTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const { getTemplatesForDocuments } = useFormTemplateStore();
  const { getProfileById } = useCompanyProfileStore();

  const formTemplates = getTemplatesForDocuments(documentTemplateIds);

  const handleSelect = (template: FormTemplate) => {
    try {
      onSelect(template);
      setOpen(false);
      toast.success(`Šablona "${template.name}" byla použita`);
    } catch (error) {
      console.error("Error selecting template:", error);
      toast.error("Chyba při výběru šablony. Zkuste to prosím znovu.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="mb-6 w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          Použít předvyplněnou šablonu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vyberte předvyplněnou šablonu</DialogTitle>
          <DialogDescription>
            Vyberte šablonu pro předvyplnění formuláře včetně firemních profilů a dalších údajů.
          </DialogDescription>
        </DialogHeader>

        {formTemplates.length > 0 ? (
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {formTemplates.map(template => (
              <div
                key={template.id}
                className={`flex flex-col p-4 rounded-md border cursor-pointer hover:bg-muted transition-colors ${template.isDefault ? 'border-primary' : ''}`}
                onClick={() => handleSelect(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <div className="font-medium text-lg">{template.name}</div>
                      <div className="text-sm text-muted-foreground">{template.description}</div>
                    </div>
                  </div>
                  {template.isDefault && (
                    <Badge variant="outline" className="ml-2">
                      <Star className="h-3 w-3 mr-1" />
                      Výchozí
                    </Badge>
                  )}
                </div>

                {getCompanyProfileNames(template).length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-medium">Použité profily:</div>
                    <div className="flex flex-wrap gap-2">
                      {getCompanyProfileNames(template).map((name, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Vytvořeno: {formatDate(template.createdAt)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(template);
                    }}
                  >
                    Použít
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">Nemáte žádné uložené šablony pro tyto dokumenty.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setOpen(false);
                // TODO: Navigate to template management page
              }}
            >
              Vytvořit novou šablonu
            </Button>
          </div>
        )}

        <DialogFooter className="sm:justify-start">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Zrušit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
