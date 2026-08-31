"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, RefreshCw, Mail, ArrowRight } from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlEmail = searchParams.get("email") || "";
  const urlToken = searchParams.get("token") || "";
  const urlVerified = searchParams.get("verified") === "true";
  const urlError = searchParams.get("error") || "";

  const [email, setEmail] = useState(urlEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState(urlError);
  const [success, setSuccess] = useState(urlVerified);
  const [statusMessage, setStatusMessage] = useState(
    urlVerified ? "Your email has been successfully verified! You can now log in." : ""
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-fill OTP if token URL param is 6 digits
  useEffect(() => {
    if (urlToken && urlToken.length === 6 && /^\d+$/.test(urlToken)) {
      setOtp(urlToken.split(""));
    }
  }, [urlToken]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const fullOtp = otp.join("");
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: fullOtp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setStatusMessage(data.message || "Email verified successfully!");
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 2500);
      } else {
        setError(data.error || "Failed to verify email. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address to resend the code.");
      return;
    }

    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResendCooldown(60);
        setStatusMessage(data.message || "A new 6-digit code has been sent to your email.");
      } else {
        setError(data.error || "Failed to resend verification code.");
      }
    } catch (err) {
      setError("Failed to resend code. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We sent a 6-digit code to <strong className="text-gray-900 dark:text-white">{email || "your email"}</strong>
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 p-6 rounded-xl text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold">Email Verified!</h3>
            <p className="text-sm">{statusMessage}</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md"
              >
                Proceed to Sign In <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {statusMessage && !error && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-400 text-blue-700 dark:text-blue-300 p-4 rounded-xl text-sm text-center">
                {statusMessage}
              </div>
            )}

            {!urlEmail && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:text-white outline-none"
                  placeholder="your@email.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white outline-none transition shadow-sm"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50 transition shadow-md"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="inline-flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400 font-medium hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
                {resendCooldown > 0
                  ? `Resend Code in ${resendCooldown}s`
                  : resending
                  ? "Sending..."
                  : "Resend Verification Code"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-gray-700">
          <Link
            href="/login"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
