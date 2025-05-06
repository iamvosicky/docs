"use client";

import { useState } from "react";
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
      zodSchema[key] = z.string().min(1, { message: `${value.title} is required` });
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

  // Handle form submission
  const onSubmit = async (data: FormSchema) => {
    setIsSubmitting(true);

    try {
      // This would be an actual API call in a real implementation
      console.log("Submitting form data:", data);

      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Set mock download links for each template
      const links: Record<string, { docx?: string; pdf?: string }> = {};
      templates.forEach(template => {
        links[template.id] = {
          docx: `#generated-${template.id}.docx`,
          pdf: `#generated-${template.id}.pdf`,
        };
      });

      setDownloadLinks(links);

      toast.success(`${templates.length} documents generated successfully!`);
    } catch (error) {
      console.error("Error generating documents:", error);
      toast.error("Failed to generate documents. Please try again.");
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
                                  {getTemplateNamesForField(key).map((name, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <FormControl>
                                <Input {...field} />
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

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Generating..." : `Generate ${templates.length} Documents`}
          </Button>
        </form>
      </Form>

      {Object.keys(downloadLinks).length > 0 && (
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Generated Documents</h2>
          <div className="space-y-4">
            {templates.map((template) => {
              const links = downloadLinks[template.id];
              if (!links) return null;

              return (
                <div key={template.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="outline" size="sm">
                      <a href={links.docx} download>Download DOCX</a>
                    </Button>
                    <Button asChild size="sm">
                      <a href={links.pdf} download>Download PDF</a>
                    </Button>
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
