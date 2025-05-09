"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

// Define the form schema with validation
const inviteFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email je povinný" })
    .email({ message: "Neplatný formát emailu" }),
  name: z
    .string()
    .min(1, { message: "Jméno je povinné" }),
  role: z
    .string()
    .min(1, { message: "Role je povinná" }),
  message: z
    .string()
    .optional(),
});

// Define the form values type
type InviteFormValues = z.infer<typeof inviteFormSchema>;

// Default values for the form
const defaultValues: Partial<InviteFormValues> = {
  email: "",
  name: "",
  role: "user",
  message: "Dobrý den,\n\nrád bych Vás pozval do naší aplikace pro generování právních dokumentů.\n\nS pozdravem",
};

export function InviteUserForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues,
  });

  // Handle form submission
  async function onSubmit(data: InviteFormValues) {
    setIsSubmitting(true);

    try {
      // Call the API endpoint to send the invitation
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation');
      }

      // Show success message
      toast({
        title: "Pozvánka odeslána",
        description: `Pozvánka byla úspěšně odeslána na adresu ${data.email}.`,
      });

      // Reset the form
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error sending invitation:", error);

      // Show error message
      toast({
        title: "Chyba při odesílání pozvánky",
        description: error instanceof Error ? error.message : "Nastala chyba při odesílání pozvánky. Zkuste to prosím znovu.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Email uživatele, kterého chcete pozvat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jméno</FormLabel>
                <FormControl>
                  <Input placeholder="Jan Novák" {...field} />
                </FormControl>
                <FormDescription>
                  Jméno pozvaného uživatele
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte roli" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrátor</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="user">Uživatel</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Role určuje oprávnění uživatele v aplikaci
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Osobní zpráva (volitelné)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Napište osobní zprávu..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Osobní zpráva, která bude součástí pozvánky
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Odesílání...
            </>
          ) : (
            "Odeslat pozvánku"
          )}
        </Button>
      </form>
    </Form>
  );
}
