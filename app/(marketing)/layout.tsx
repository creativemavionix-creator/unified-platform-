"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import Image from "next/image";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-lavender-wash flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-surface/80 backdrop-blur-xl dark:bg-void/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-signal/10 border border-signal/20 overflow-hidden shrink-0">
              <Image
                src="/logo.jpg"
                alt="MaVionix Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-bone">
              Ma<span className="text-gradient">Vionix</span>
            </span>
          </Link>

          {/* Nav Items - pill shaped */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/about"
              className="px-4 py-2 rounded-pill text-sm font-medium text-muted-foreground hover:text-bone hover:bg-muted/60 transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-pill text-sm font-medium text-muted-foreground hover:text-bone hover:bg-muted/60 transition-colors"
            >
              Pricing
            </Link>
            <button className="flex items-center gap-1 px-4 py-2 rounded-pill text-sm font-medium text-muted-foreground hover:text-bone hover:bg-muted/60 transition-colors">
              Resources
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/docs"
              className="px-4 py-2 rounded-pill text-sm font-medium text-muted-foreground hover:text-bone hover:bg-muted/60 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/changelog"
              className="px-4 py-2 rounded-pill text-sm font-medium text-muted-foreground hover:text-bone hover:bg-muted/60 transition-colors"
            >
              Changelog
            </Link>
          </nav>

          {/* Right utility section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-bone">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="shadow-lg shadow-signal/25">
                Contact
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-display font-semibold text-bone">
            Ma<span className="text-gradient">Vionix</span>
          </span>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-bone transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-bone transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-bone transition-colors">Docs</Link>
            <Link href="/help" className="hover:text-bone transition-colors">Help</Link>
            <Link href="/contact" className="hover:text-bone transition-colors">Contact</Link>
          </div>
          <span className="text-xs text-muted-foreground/60">© 2026 MaVionix. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
