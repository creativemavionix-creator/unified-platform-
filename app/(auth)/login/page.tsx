"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Key, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { supabase, isDemoMode } from "@/lib/supabase";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isDemoMode) {
        // Demo mode — simulate login
        await new Promise((r) => setTimeout(r, 600));
        localStorage.setItem("mvx_session", "demo");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
      }
      setIsSuccess(true);
      toast.success("Login successful");
      setTimeout(() => router.push("/dashboard"), 400);
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : "Login failed";
      if (message.includes("Email not confirmed")) {
        message = "Email not confirmed. Check your inbox for a verification link, or disable email confirmation in Supabase Dashboard → Auth → Email Settings.";
      } else if (message.includes("Invalid login credentials")) {
        message = "Invalid email or password. Please check your credentials and try again.";
      }
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem("mvx_session", "demo");
    toast.success("Welcome to Demo Mode — logged in as Alex Mercer");
    router.push("/dashboard");
  };

  return (
    <div className="bg-surface border border-border/40 rounded-2xl p-8 space-y-6 shadow-xl dark:bg-surface/60 dark:backdrop-blur-xl relative z-10 w-full">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-signal/25 bg-signal/5 dark:bg-signal/10 mx-auto">
          <Sparkles className="w-3 h-3 text-signal" />
          <span className="eyebrow text-signal">SECURE LOGIN</span>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-bone uppercase tracking-tight">
          WORKSTATION <span className="text-gradient">LOGIN</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your workspace
        </p>
        {isDemoMode && (
          <p className="text-xs text-signal bg-signal/10 border border-signal/20 rounded-pill px-3 py-1 inline-block">
            Demo Mode — no Supabase connected
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-500 text-center">
          {errorMsg}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <label className="eyebrow text-muted-foreground">EMAIL ADDRESS <span className="text-signal">*</span></label>
                <FormControl>
                  <Input type="email" placeholder="admin@mavionix.ai" disabled={isLoading || isSuccess} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="eyebrow text-muted-foreground">PASSWORD <span className="text-signal">*</span></label>
                  <Link href="/forgot-password" className="text-xs text-signal hover:underline font-medium">Forgot?</Link>
                </div>
                <div className="relative">
                  <FormControl>
                    <Input type={showPassword ? "text" : "password"} placeholder="Enter password" disabled={isLoading || isSuccess} className="pr-10" {...field} />
                  </FormControl>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-bone">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading || isSuccess} className={`w-full h-11 mt-2 ${isSuccess ? "bg-emerald-600 text-white hover:bg-emerald-600" : ""}`}>
            {isLoading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</span>
            ) : isSuccess ? (
              <span className="flex items-center gap-1.5"><Key className="w-4 h-4" /> Session Verified</span>
            ) : "Sign In"}
          </Button>
        </form>
      </Form>

      {/* Demo Mode shortcut */}
      <Button variant="outline" onClick={handleDemoLogin} className="w-full h-10 border-signal/30 text-signal">
        <Sparkles className="w-4 h-4 mr-2" />
        Try Demo — No Account Needed
      </Button>

      <div className="text-center text-sm text-muted-foreground pt-1">
        New to MaVionix? <Link href="/signup" className="text-signal hover:underline font-medium">Create Account</Link>
      </div>
    </div>
  );
}
