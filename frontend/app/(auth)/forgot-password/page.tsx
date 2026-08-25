"use client";

import { type SyntheticEvent, useState } from "react";

import Link from "next/link";

import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email address.");

      return;
    }

    try {
      setIsSubmitting(true);

      setError(null);

      const supabase = createClient();

      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo,
        },
      );

      if (error) {
        setError(error.message);

        return;
      }

      setSuccess(true);
    } catch {
      setError("Unable to send the password reset email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050d1d] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#101a2e] p-7 shadow-2xl">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <div className="mt-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <Mail className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-white">
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Enter your account email and we&apos;ll send you a secure password
              reset link.
            </p>
          </div>

          {success ? (
            <div className="mt-6">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                  <div>
                    <p className="font-medium text-emerald-300">
                      Check your email
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-200/70">
                      If an account exists for{" "}
                      <span className="font-medium">{email}</span>, a password
                      reset link has been sent.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-5 w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => {
                  setSuccess(false);

                  setError(null);
                }}
              >
                Send Another Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-300"
                >
                  Email Address
                </label>

                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="border-white/10 bg-[#0c1527] pl-10 text-white"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white hover:bg-blue-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
