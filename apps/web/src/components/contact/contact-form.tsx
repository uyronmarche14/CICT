"use client";

import { useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea as TextareaType } from "@/components/ui/textarea";
import { appToast } from "@/lib/app-toast";
import { inquiriesAPI } from "@/lib/api/inquiries";

type InputFieldProps = ComponentProps<typeof Input>;
type SelectFieldProps = { value?: string; onChange: (value: string) => void };
type TextareaFieldProps = ComponentProps<typeof TextareaType>;

const contactSchema = z.object({
  fullName: z.string().min(1, "Full Name is required."),
  email: z
    .string()
    .min(1, "Email Address is required.")
    .email("Please enter a valid email address."),
  contactNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-+()]{7,15}$/.test(val),
      "Please enter a valid contact number."
    ),
  userType: z.string().min(1, "Role / User Type is required."),
  subject: z.string().min(1, "Subject is required."),
  inquiryType: z.string().min(1, "Inquiry Type is required."),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const userTypes = [
  "Student",
  "Faculty",
  "Staff",
  "Parent / Guardian",
  "Visitor",
  "Student Organization",
  "Alumni",
  "Other",
];

const inquiryTypes = [
  "General Inquiry",
  "Student Concern",
  "Event Concern",
  "Announcement Concern",
  "Technical Support",
  "Collaboration Request",
  "Partnership Inquiry",
  "Feedback / Suggestion",
  "Other",
];

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      contactNumber: "",
      userType: "",
      subject: "",
      inquiryType: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    setIsSubmitted(false);

    try {
      await inquiriesAPI.create({
        ...values,
        contactNumber: values.contactNumber?.trim() || undefined,
      });
      form.reset();
      setIsSubmitted(true);
      appToast.success("Inquiry Sent", "Your message has been received by the CICT office.");
    } catch {
      appToast.error(
        "Submission Failed",
        "Your inquiry could not be sent. Please use the official contact details on this page."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Send a message to CICT.</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Submit your inquiry here and the office can review it from the admin Messages page.
            </p>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold">Inquiry sent successfully.</h3>
                <p className="mt-1 text-xs leading-5">
                  Thank you. Your message is now recorded for admin review.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>
                    Email Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 0917 123 4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userType"
              render={({ field }: { field: SelectFieldProps }) => (
                <FormItem>
                  <FormLabel>
                    Role / User Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }: { field: InputFieldProps }) => (
                <FormItem>
                  <FormLabel>
                    Subject <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Brief subject of your inquiry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inquiryType"
              render={({ field }: { field: SelectFieldProps }) => (
                <FormItem>
                  <FormLabel>
                    Inquiry Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inquiryTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }: { field: TextareaFieldProps }) => (
              <FormItem>
                <FormLabel>
                  Message <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your concern or inquiry in detail..."
                    className="min-h-[120px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3 pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isSubmitting ? "Sending Inquiry..." : "Send Inquiry"}
            </Button>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              For urgent concerns, use the listed phone, email, or office channels directly.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
