"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Count down resend timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle changes in digits
  const handleChange = (index: number, value: string) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Keep only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setErrorMsg("");

    // Auto-advance focus if value is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Focus previous input if current is empty
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
      setErrorMsg("");
    }
  };

  // Handle code paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedText)) {
      setErrorMsg("Please paste a valid 6-digit numeric code");
      return;
    }

    const digits = pastedText.split("");
    setOtp(digits);
    setErrorMsg("");
    inputRefs.current[5]?.focus();
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(Array(6).fill(""));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length < 6) {
      setErrorMsg("Please fill in all 6 verification digits");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    // Simulate 800ms backend OTP verification
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSuccess(true);

    // Proceed to organization creation
    setTimeout(() => {
      router.push("/org-creation");
    }, 450);
  };

  return (
    <div className="bg-surface border border-border/45 rounded-xl p-8 space-y-6 shadow-xl relative z-10 w-full">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-scale-xl font-bold text-bone">Verify Workstation</h1>
        <p className="text-scale-xs text-muted-foreground font-mono uppercase tracking-wider">
          Step 2: Enter 6-Digit Telemetry Key
        </p>
        <p className="text-scale-xs text-muted-foreground pt-1">
          We sent a code to your registered email address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 max-w-sm mx-auto">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              disabled={isLoading || isSuccess}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-scale-lg font-mono font-bold bg-void/50 border border-border/40 hover:border-signal/40 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal rounded-md text-bone disabled:opacity-55 transition-colors"
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-scale-xs font-medium text-destructive text-center">{errorMsg}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading || isSuccess}
          className={`w-full font-semibold text-scale-sm h-10 rounded-md transition-all duration-200 ${
            isSuccess
              ? "bg-emerald-600 text-bone hover:bg-emerald-600"
              : "bg-signal hover:bg-signal/90 text-void"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Connection...</span>
            </span>
          ) : isSuccess ? (
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Telemetry Verified</span>
            </span>
          ) : (
            <span>Verify Security Code</span>
          )}
        </Button>
      </form>

      <div className="text-center text-scale-xs text-muted-foreground pt-2">
        {timer > 0 ? (
          <span>Resend code in <strong className="font-mono text-signal">{timer}s</strong></span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-signal hover:underline flex items-center gap-1.5 mx-auto font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resend Verification Code</span>
          </button>
        )}
      </div>
    </div>
  );
}
