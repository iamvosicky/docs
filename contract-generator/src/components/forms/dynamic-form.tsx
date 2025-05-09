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

// Define JSON schema property type
interface JsonSchemaProperty {
  type: string;
  title: string;
  description?: string;
}

// Define JSON schema type
interface JsonSchema {
  properties: Record<string, JsonSchemaProperty>;
}

// Helper function to convert JSON schema to Zod schema
const jsonSchemaToZod = (schema: JsonSchema) => {
  const zodSchema: Record<string, z.ZodType> = {};

  Object.entries(schema.properties).forEach(([key, value]: [string, JsonSchemaProperty]) => {
    if (value.type === "string") {
      zodSchema[key] = z.string().min(1, { message: `${value.title} is required` });
    }
    // Add more types as needed
  });

  return z.object(zodSchema);
};

interface DynamicFormProps {
  templateId: string;
  schema: JsonSchema;
}

export function DynamicForm({ templateId, schema }: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<{ docx?: string; pdf?: string }>({});

  // Convert JSON schema to Zod schema
  const zodSchema = jsonSchemaToZod(schema);

  // Initialize form
  const form = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
    defaultValues: Object.keys(schema.properties).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {} as Record<string, string>),
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof zodSchema>) => {
    setIsSubmitting(true);

    try {
      // This would be an actual API call in a real implementation
      console.log("Submitting form data:", data);

      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Set mock download links
      setDownloadLinks({
        docx: `#generated-${templateId}.docx`,
        pdf: `#generated-${templateId}.pdf`,
      });

      toast.success("Documents generated successfully!");
    } catch (error) {
      console.error("Error generating documents:", error);
      toast.error("Failed to generate documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(schema.properties).map(([key, value]: [string, JsonSchemaProperty]) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{value.title}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={
                            key.toLowerCase().includes('date') ||
                            key.toLowerCase().includes('birth') ||
                            key.toLowerCase().includes('narozeni') ? 'date' :
                            key.toLowerCase().includes('email') ? 'email' :
                            key.toLowerCase().includes('phone') ||
                            key.toLowerCase().includes('telefon') ? 'tel' :
                            key.toLowerCase().includes('number') ||
                            key.toLowerCase().includes('cislo') ? 'number' :
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

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Documents"}
            </Button>
          </form>
        </Form>
      </Card>

      {downloadLinks.docx && downloadLinks.pdf && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Generated Documents</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline">
              <a href={downloadLinks.docx} download>Download DOCX</a>
            </Button>
            <Button asChild>
              <a href={downloadLinks.pdf} download>Download PDF</a>
            </Button>
          </div>
        </Card>
      )}

      <Sonner />
    </>
  );
}
