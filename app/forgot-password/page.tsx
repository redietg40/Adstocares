"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(data.message || "If an account exists, a reset link has been sent.");
      }
    } catch (err: any) {
      setError("Failed to connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl"></div>

      {/* Header */}
      <header className="p-6 relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logoswomen.jpg"
            alt="Ad2Care"
            width={40}
            height={40}
            className="rounded-full shadow-lg"
            onError={(e: any) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-10 h-10 bg-orange-600 rounded-full items-center justify-center hidden shadow-lg">
            <span className="text-white font-bold text-xs">A2C</span>
          </div>
          <span className="font-bold text-xl text-white tracking-wide">
            Ad<span className="text-orange-500">2</span>Care
          </span>
        </Link>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-[#1E293B]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/50 relative overflow-hidden">
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-600"></div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                <span className="text-orange-500 text-2xl">🔒</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
              <p className="text-gray-400 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm text-center mb-6 animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            {success ? (
              <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl text-sm">
                  {success}
                </div>
                <p className="text-gray-400 text-sm">
                  Please check your inbox and spam folder.
                </p>
                <Link
                  href="/login"
                  className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500">✉️</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-orange-600/20 transition-all duration-200 flex justify-center items-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending Link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            )}

            {!success && (
              <div className="mt-8 text-center">
                <Link
                  href="/login"
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Remember your password? <span className="text-orange-500">Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
