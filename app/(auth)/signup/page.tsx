"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { supabase, isDemoMode } from "@/lib/supabase";
import { toast } from "sonner";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 600));
        localStorage.setItem("mvx_session", "demo");
      } else {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { data: { full_name: values.name } },
        });
        if (error) throw error;
      }
      setIsSuccess(true);
      toast.success("Account created successfully");
      setTimeout(() => router.push("/otp"), 400);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border/40 rounded-2xl p-8 space-y-6 shadow-xl dark:bg-surface/60 dark:backdrop-blur-xl relative z-10 w-full">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-signal/25 bg-signal/5 dark:bg-signal/10 mx-auto">
          <UserPlus className="w-3 h-3 text-signal" />
          <span className="eyebrow text-signal">CREATE ACCOUNT</span>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-bone uppercase tracking-tight">
          JOIN <span className="text-gradient">MAVIONIX</span>
        </h1>
        <p className="text-sm text-muted-foreground">Set up your workspace credentials</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-500 text-center">
          {errorMsg}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="space-y-1.5">
              <label className="eyebrow text-muted-foreground">FULL NAME <span className="text-signal">*</span></label>
              <FormControl><Input placeholder="Alex Morgan" disabled={isLoading || isSuccess} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem className="space-y-1.5">
              <label className="eyebrow text-muted-foreground">EMAIL <span className="text-signal">*</span></label>
              <FormControl><Input type="email" placeholder="alex@company.com" disabled={isLoading || isSuccess} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem className="space-y-1.5">
              <label className="eyebrow text-muted-foreground">PASSWORD <span className="text-signal">*</span></label>
              <div className="relative">
                <FormControl><Input type={showPassword ? "text" : "password"} placeholder="Min 8 characters" disabled={isLoading || isSuccess} className="pr-10" {...field} /></FormControl>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-bone">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem className="space-y-1.5">
              <label className="eyebrow text-muted-foreground">CONFIRM PASSWORD <span className="text-signal">*</span></label>
              <FormControl><Input type={showPassword ? "text" : "password"} placeholder="Re-enter password" disabled={isLoading || isSuccess} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" disabled={isLoading || isSuccess} className={`w-full h-11 mt-2 ${isSuccess ? "bg-emerald-600 text-white hover:bg-emerald-600" : ""}`}>
            {isLoading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</span>
            ) : isSuccess ? "Account Created" : (
              <span className="flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></span>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground pt-1">
        Already have an account? <Link href="/login" className="text-signal hover:underline font-medium">Sign In</Link>
      </div>
    </div>
  );
}
