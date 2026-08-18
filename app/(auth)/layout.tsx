import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-lavender-wash flex items-center justify-center p-4 relative overflow-hidden">
      {/* Purple radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-signal/5 dark:bg-signal/8 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
