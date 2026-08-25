"use client";

import { type SyntheticEvent, useState } from "react";

import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");

      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");

      return;
    }

    try {
      setIsSubmitting(true);

      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);

        return;
      }

      setSuccess(true);

      setPassword("");

      setConfirmPassword("");
    } catch {
      setError("Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050d1d] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#101a2e] p-7 shadow-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <KeyRound className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">Reset Password</h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Choose a new password for your InterviewIQ account.
          </p>

          {success ? (
            <div className="mt-6">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                  <div>
                    <p className="font-medium text-emerald-300">
                      Password updated
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-200/70">
                      Your password has been changed successfully.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="mt-5 w-full bg-blue-600 text-white hover:bg-blue-500"
                onClick={async () => {
                  const supabase = createClient();

                  await supabase.auth.signOut();

                  router.replace("/login");

                  router.refresh();
                }}
              >
                Continue to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium text-slate-300"
                >
                  New Password
                </label>

                <div className="relative mt-2">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    className="border-white/10 bg-[#0c1527] pl-10 pr-10 text-white"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-slate-300"
                >
                  Confirm Password
                </label>

                <div className="relative mt-2">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className="border-white/10 bg-[#0c1527] pl-10 pr-10 text-white"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
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
                    Updating...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
