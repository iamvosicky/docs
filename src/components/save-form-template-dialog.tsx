"use client";

import { useState } from 'react';
import { useFormTemplateStore } from '@/lib/form-template-store';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { Save } from 'lucide-react';

interface SaveFormTemplateDialogProps {
  documentTemplateIds: string[];
  formValues: Record<string, string>;
  companyProfiles: {
    buyer?: string;
    seller?: string;
    employer?: string;
    employee?: string;
  };
}

export function SaveFormTemplateDialog({
  documentTemplateIds,
  formValues,
  companyProfiles
}: SaveFormTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const { saveCurrentFormAsTemplate } = useFormTemplateStore();

  const handleSave = () => {
    if (!name) {
      toast.error("Zadejte název šablony");
      return;
    }

    try {
      // Make a safe copy of form values to avoid any reference issues
      const safeFormValues = { ...formValues };
      const safeCompanyProfiles = { ...companyProfiles };

      saveCurrentFormAsTemplate(
        name,
        description,
        documentTemplateIds,
        safeFormValues,
        safeCompanyProfiles,
        isDefault
      );

      setOpen(false);
      toast.success("Šablona byla úspěšně uložena");

      // Reset form
      setName('');
      setDescription('');
      setIsDefault(false);
    } catch (error) {
      console.error("Error saving form template:", error);
      toast.error("Chyba při ukládání šablony. Zkuste to prosím znovu.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="ml-4"
        >
          <Save className="h-4 w-4 mr-2" />
          Uložit jako šablonu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Uložit jako šablonu</DialogTitle>
          <DialogDescription>
            Uložte aktuální formulář jako šablonu pro budoucí použití.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Název šablony *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Např. Standardní kupní smlouva"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Popis</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Stručný popis šablony"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-default"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <Label htmlFor="is-default">Nastavit jako výchozí šablonu</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Zrušit</Button>
          <Button onClick={handleSave}>Uložit šablonu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
