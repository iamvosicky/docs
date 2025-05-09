"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sonner, toast } from "@/components/ui/sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CompanyProfileSelector } from "@/components/company-profile-selector";
import { FormTemplateSelector } from "@/components/form-template-selector";
import { SaveFormTemplateDialog } from "@/components/save-form-template-dialog";
import { useCompanyProfileStore } from "@/lib/company-profile-store";
import { useFormTemplateStore } from "@/lib/form-template-store";
import { FormTemplate } from "@/types/form-template";
import { companyFieldMapping } from "@/types/company-profile";
import { generatePDF, generateDOCX, downloadDocument } from "@/lib/document-generator";

// Define JSON schema property type
interface JsonSchemaProperty {
  type: string;
  title: string;
  description?: string;
}

// Define JSON schema type
interface JsonSchema {
  type: string;
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}

// Define template type
interface Template {
  id: string;
  name: string;
  description: string;
  schema: JsonSchema;
}

// Helper function to merge schemas from multiple templates
const mergeSchemas = (templates: Template[]) => {
  const mergedProperties: Record<string, JsonSchemaProperty> = {};
  const fieldToTemplateMap: Record<string, string[]> = {};

  templates.forEach(template => {
    Object.entries(template.schema.properties).forEach(([key, value]) => {
      // If the field already exists, don't override it
      if (!mergedProperties[key]) {
        mergedProperties[key] = value;
      }

      // Track which templates use this field
      if (!fieldToTemplateMap[key]) {
        fieldToTemplateMap[key] = [];
      }
      fieldToTemplateMap[key].push(template.id);
    });
  });

  return {
    mergedProperties,
    fieldToTemplateMap
  };
};

// Helper function to convert JSON schema to Zod schema
const jsonSchemaToZod = (schema: Record<string, JsonSchemaProperty>) => {
  const zodSchema: Record<string, z.ZodType<any, any>> = {};

  Object.entries(schema).forEach(([key, value]) => {
    if (value.type === "string") {
      zodSchema[key] = z.string().min(1, { message: `${value.title} je povinné` });
    } else {
      // Default to string for unknown types
      zodSchema[key] = z.string().optional();
    }
    // Add more types as needed
  });

  return z.object(zodSchema);
};

// Group fields by common prefixes to organize the form
const groupFieldsByPrefix = (properties: Record<string, JsonSchemaProperty>) => {
  const groups: Record<string, Record<string, JsonSchemaProperty>> = {
    "KUP": {},
    "PROD": {},
    "ZAM": {},
    "PRAC": {},
    "OTHER": {}
  };

  Object.entries(properties).forEach(([key, value]) => {
    if (key.startsWith("KUP_")) {
      groups["KUP"][key] = value;
    } else if (key.startsWith("PROD_")) {
      groups["PROD"][key] = value;
    } else if (key.startsWith("ZAM_")) {
      groups["ZAM"][key] = value;
    } else if (key.startsWith("PRAC_")) {
      groups["PRAC"][key] = value;
    } else {
      groups["OTHER"][key] = value;
    }
  });

  return groups;
};

// Get human-readable group names
const getGroupName = (groupKey: string) => {
  switch (groupKey) {
    case "KUP": return "Kupující";
    case "PROD": return "Prodávající";
    case "ZAM": return "Zaměstnavatel";
    case "PRAC": return "Pracovník";
    case "OTHER": return "Další údaje";
    default: return groupKey;
  }
};

interface MultiDocumentFormProps {
  templates: Template[];
}

export function MultiDocumentForm({ templates }: MultiDocumentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<Record<string, { docx?: string; pdf?: string }>>({});
  const [usedCompanyProfiles, setUsedCompanyProfiles] = useState<{
    buyer?: string;
    seller?: string;
    employer?: string;
    employee?: string;
  }>({});

  // Get company profiles and form templates
  const { getProfileById } = useCompanyProfileStore();
  const { getDefaultTemplate } = useFormTemplateStore();

  // Merge schemas from all templates
  const { mergedProperties, fieldToTemplateMap } = mergeSchemas(templates);

  // Convert merged JSON schema to Zod schema
  const zodSchema = jsonSchemaToZod(mergedProperties);

  // Group fields by prefix
  const fieldGroups = groupFieldsByPrefix(mergedProperties);

  // Initialize form with type safety
  type FormSchema = z.infer<ReturnType<typeof jsonSchemaToZod>>;

  // Create default values with proper typing
  const defaultValues = Object.keys(mergedProperties).reduce<Record<string, string>>((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});

  const form = useForm<FormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: defaultValues,
  });

  // Check for default form template on initial load
  useEffect(() => {
    // Wait for the form to be fully initialized before applying the template
    const timer = setTimeout(() => {
      try {
        const documentTemplateIds = templates.map(t => t.id);
        const defaultTemplate = getDefaultTemplate(documentTemplateIds);

        if (defaultTemplate) {
          applyFormTemplate(defaultTemplate);
        }
      } catch (error) {
        console.error("Error applying default template:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to apply company profile data to form
  const applyCompanyProfile = (profileId: string, groupKey: string) => {
    const profile = getProfileById(profileId);
    if (!profile) return;

    const mappings = companyFieldMapping[profile.type];
    if (!mappings) return;

    // Update form values with profile data
    Object.entries(mappings).forEach(([profileField, formField]) => {
      if (profile.data[profileField as keyof typeof profile.data] && form.getValues(formField) !== undefined) {
        form.setValue(formField, profile.data[profileField as keyof typeof profile.data] as string);
      }
    });

    // Update used company profiles
    setUsedCompanyProfiles(prev => ({
      ...prev,
      [profile.type]: profileId
    }));

    toast.success(`Profil ${profile.name} byl použit`);
  };

  // Function to apply form template
  const applyFormTemplate = (template: FormTemplate) => {
    try {
      // Apply form values - only for fields that exist in the current form
      const currentFields = Object.keys(form.getValues());

      Object.entries(template.values).forEach(([field, value]) => {
        if (currentFields.includes(field)) {
          form.setValue(field, value);
        }
      });

      // Apply company profiles
      if (template.companyProfiles.buyer) {
        applyCompanyProfile(template.companyProfiles.buyer, 'KUP');
      }

      if (template.companyProfiles.seller) {
        applyCompanyProfile(template.companyProfiles.seller, 'PROD');
      }

      if (template.companyProfiles.employer) {
        applyCompanyProfile(template.companyProfiles.employer, 'ZAM');
      }

      if (template.companyProfiles.employee) {
        applyCompanyProfile(template.companyProfiles.employee, 'PRAC');
      }

      toast.success(`Šablona "${template.name}" byla použita`);
    } catch (error) {
      console.error("Error applying form template:", error);
      toast.error("Chyba při aplikaci šablony. Zkuste to prosím znovu.");
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormSchema) => {
    setIsSubmitting(true);

    try {
      // Call the API to generate documents
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templates: templates.map(t => t.id),
          formData: data,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Nepodařilo se vygenerovat dokumenty';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.error('Chyba při zpracování chybové odpovědi:', e);
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error('Chyba při zpracování odpovědi:', e);
        throw new Error('Neplatná odpověď ze serveru');
      }

      if (result.success && result.links) {
        // Set the download links from the API response
        setDownloadLinks(result.links);
        toast.success(`${templates.length} ${templates.length === 1 ? 'dokument byl' : templates.length < 5 ? 'dokumenty byly' : 'dokumentů bylo'} úspěšně vygenerováno!`);
      } else {
        throw new Error('Neplatná odpověď ze serveru');
      }
    } catch (error) {
      console.error("Chyba při generování dokumentů:", error);
      toast.error(error instanceof Error ? error.message : "Nepodařilo se vygenerovat dokumenty. Zkuste to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get template names for a field
  const getTemplateNamesForField = (fieldKey: string) => {
    const templateIds = fieldToTemplateMap[fieldKey] || [];
    return templateIds.map(id => {
      const template = templates.find(t => t.id === id);
      return template ? template.name : id;
    });
  };

  return (
    <>
      {/* Form Template Selector */}
      <FormTemplateSelector
        documentTemplateIds={templates.map(t => t.id)}
        onSelect={applyFormTemplate}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Accordion type="multiple" defaultValue={Object.keys(fieldGroups)}>
            {Object.entries(fieldGroups).map(([groupKey, fields]) => {
              // Skip empty groups
              if (Object.keys(fields).length === 0) return null;

              return (
                <AccordionItem key={groupKey} value={groupKey}>
                  <AccordionTrigger className="text-lg font-medium">
                    {getGroupName(groupKey)}
                  </AccordionTrigger>
                  <AccordionContent>
                    {/* Company Profile Selector - only show for company-related groups */}
                    {['KUP', 'PROD', 'ZAM', 'PRAC'].includes(groupKey) && (
                      <CompanyProfileSelector
                        groupKey={groupKey}
                        onSelect={(profileId) => applyCompanyProfile(profileId, groupKey)}
                      />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {Object.entries(fields).map(([key, value]) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name={key}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex flex-col space-y-1">
                                <FormLabel>{value.title}</FormLabel>
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {getTemplateNamesForField(key).map((name, index) => {
                                    // Assign different colors based on template name or index using Catalyst style
                                    const colorVariants = [
                                      'blue', 'green', 'purple', 'orange',
                                      'teal', 'red', 'amber', 'gray',
                                      'indigo', 'cyan', 'pink', 'lime',
                                      'rose', 'sky', 'emerald', 'violet'
                                    ];
                                    const colorIndex = index % colorVariants.length;
                                    const variant = colorVariants[colorIndex] as any;

                                    return (
                                      <Badge key={index} variant={variant} className="text-xs">
                                        {name}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                              <FormControl>
                                <Input
                                  {...field}
                                  type={
                                    key.toLowerCase().includes('date') ||
                                    key.toLowerCase().includes('birth') ||
                                    key.toLowerCase().includes('narozeni') ||
                                    key.toLowerCase().includes('datum') ? 'date' :
                                    key.toLowerCase().includes('email') ? 'email' :
                                    key.toLowerCase().includes('phone') ||
                                    key.toLowerCase().includes('telefon') ? 'tel' :
                                    key.toLowerCase().includes('number') ||
                                    key.toLowerCase().includes('cislo') ||
                                    key.toLowerCase().includes('ico') ||
                                    key.toLowerCase().includes('dic') ? 'number' :
                                    key.toLowerCase().includes('password') ||
                                    key.toLowerCase().includes('heslo') ? 'password' :
                                    key.toLowerCase().includes('url') ||
                                    key.toLowerCase().includes('web') ? 'url' :
                                    'text'
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <div className="flex items-center">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Generuji..." : `Vygenerovat ${templates.length} ${templates.length === 1 ? 'dokument' : templates.length < 5 ? 'dokumenty' : 'dokumentů'}`}
            </Button>

            <SaveFormTemplateDialog
              documentTemplateIds={templates.map(t => t.id)}
              formValues={form.getValues()}
              companyProfiles={usedCompanyProfiles}
            />
          </div>
        </form>
      </Form>

      {Object.keys(downloadLinks).length > 0 && (
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Vygenerované dokumenty</h2>
          <div className="space-y-4">
            {templates.map((template) => {
              const links = downloadLinks[template.id];
              if (!links) return null;

              // Get template name
              const templateNames: Record<string, string> = {
                'smlouva-o-dilo': 'Smlouva o dílo',
                'dohoda-o-provedeni-prace': 'Dohoda o provedení práce',
                'kupni-smlouva': 'Kupní smlouva'
              };

              const templateName = templateNames[template.id] || template.id;

              return (
                <div key={template.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium mb-2">{templateName}</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {links.docx && (
                      <Button asChild variant="outline" size="sm">
                        <a href={links.docx} download={`${templateName}.docx`}>
                          Stáhnout DOCX
                        </a>
                      </Button>
                    )}
                    {links.pdf && (
                      <Button asChild size="sm">
                        <a href={links.pdf} download={`${templateName}.pdf`}>
                          Stáhnout PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Sonner />
    </>
  );
}
