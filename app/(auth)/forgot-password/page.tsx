"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    void values;
    setIsLoading(true);
    // Simulate 800ms backend email reset trigger
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSuccess(true);
  };

  return (
    <div className="bg-surface border border-border/45 rounded-xl p-8 space-y-6 shadow-xl relative z-10 w-full">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-scale-xl font-bold text-bone">Restore Credentials</h1>
        <p className="text-scale-xs text-muted-foreground font-mono uppercase tracking-wider">
          Reset workstation session keys
        </p>
      </div>

      {isSuccess ? (
        <div className="space-y-6 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-scale-base text-bone">Recovery Link Dispatched</h3>
            <p className="text-scale-xs text-muted-foreground leading-relaxed">
              If the email <strong className="text-bone">{form.getValues("email")}</strong> is registered, we have sent link recovery telemetry.
            </p>
          </div>
          <Link href="/login" className="block pt-2">
            <Button className="w-full bg-signal hover:bg-signal/90 text-void font-semibold text-scale-sm h-10 rounded-md">
              Return to Login
            </Button>
          </Link>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-scale-xs font-semibold text-muted-foreground">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@mavionix.ai"
                      disabled={isLoading}
                      className="bg-void/40 border-border/40 text-scale-sm h-10 focus-visible:ring-1 focus-visible:ring-signal"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-signal hover:bg-signal/90 text-void font-semibold text-scale-sm h-10 rounded-md mt-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Requesting Reset Key...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Send Recovery Instructions</span>
                </span>
              )}
            </Button>
          </form>
        </Form>
      )}

      {!isSuccess && (
        <div className="text-center pt-2">
          <Link href="/login" className="text-scale-xs text-muted-foreground hover:text-bone inline-flex items-center gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      )}
    </div>
  );
}
