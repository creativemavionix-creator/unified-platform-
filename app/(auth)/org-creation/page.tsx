"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Building2 } from "lucide-react";

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
import { supabase, isDemoMode } from "@/lib/supabase";

const orgSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  size: z.string().min(1, "Please select organization size"),
  industry: z.string().min(2, "Industry name must be at least 2 characters"),
});

type OrgFormValues = z.infer<typeof orgSchema>;

export default function OrgCreationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      size: "",
      industry: "",
    },
  });

  const onSubmit = async (values: OrgFormValues) => {
    setIsLoading(true);
    if (!isDemoMode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("organizations").upsert({
          owner_id: user.id,
          name: values.name,
          size: values.size,
          industry: values.industry,
        }, { onConflict: "owner_id" });
        // Link profile to org
        const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
        if (org) {
          await supabase.from("profiles").update({ org_id: org.id }).eq("id", user.id);
        }
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    setIsLoading(false);
    setIsSuccess(true);

    // Proceed to workspace selection step
    setTimeout(() => {
      router.push("/role-selection");
    }, 450);
  };

  return (
    <div className="bg-surface border border-border/45 rounded-xl p-8 space-y-6 shadow-xl relative z-10 w-full">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-scale-xl font-bold text-bone">Set Up Organization</h1>
        <p className="text-scale-xs text-muted-foreground font-mono uppercase tracking-wider">
          Step 3: Establish Workstation Tenant
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Org Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-scale-xs font-semibold text-muted-foreground">Organization Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Mavionix Corp"
                    disabled={isLoading || isSuccess}
                    className="bg-void/40 border-border/40 text-scale-sm h-10 focus-visible:ring-1 focus-visible:ring-signal"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Org Size */}
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-scale-xs font-semibold text-muted-foreground">Company Size</FormLabel>
                <FormControl>
                  <select
                    disabled={isLoading || isSuccess}
                    className="flex w-full rounded-md border border-border/40 bg-void/40 hover:bg-void/60 text-bone px-3 h-10 text-scale-sm focus:outline-none focus:ring-1 focus:ring-signal select-custom"
                    {...field}
                  >
                    <option value="" className="bg-surface text-muted-foreground">Select team size...</option>
                    <option value="1-10" className="bg-surface">1 - 10 members (Startup)</option>
                    <option value="11-50" className="bg-surface">11 - 50 members (Growth)</option>
                    <option value="51-200" className="bg-surface">51 - 200 members (Mid-Market)</option>
                    <option value="201+" className="bg-surface">201+ members (Enterprise)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Industry */}
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-scale-xs font-semibold text-muted-foreground">Industry</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Software & Automation"
                    disabled={isLoading || isSuccess}
                    className="bg-void/40 border-border/40 text-scale-sm h-10 focus-visible:ring-1 focus-visible:ring-signal"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`w-full font-semibold text-scale-sm h-10 rounded-md mt-6 transition-all duration-200 ${
              isSuccess
                ? "bg-emerald-600 text-bone hover:bg-emerald-600"
                : "bg-signal hover:bg-signal/90 text-void"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Tenant Workspace...</span>
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>Tenant Established</span>
              </span>
            ) : (
              <span>Establish Organization</span>
            )}
          </Button>

          {/* Skip option */}
          <button
            type="button"
            disabled={isLoading || isSuccess}
            onClick={async () => {
              setIsLoading(true);
              if (!isDemoMode) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  const defaultName = "My Workspace";
                  await supabase.from("organizations").upsert({
                    owner_id: user.id,
                    name: defaultName,
                    size: null,
                    industry: null,
                  }, { onConflict: "owner_id" });
                  // Link profile to org
                  const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
                  if (org) {
                    await supabase.from("profiles").update({ org_id: org.id }).eq("id", user.id);
                  }
                }
              } else {
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
              setIsLoading(false);
              router.push("/dashboard");
            }}
            className="w-full text-center text-scale-xs text-muted-foreground hover:text-signal transition-colors py-2"
          >
            Skip for now →
          </button>
        </form>
      </Form>
    </div>
  );
}
