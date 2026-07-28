"use client";

import { type SyntheticEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase";

import registerImage from "../../../public/images/register-image.png";
import googleLogo from "../../../public/images/google-logo.svg";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isLoading = isRegistering || isGoogleLoading;

  async function handleRegister(event: SyntheticEvent<HTMLFormElement, SubmitEvent>,) {
  event.preventDefault();

    if (isLoading) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage(
        "Please agree to the Terms of Service and Privacy Policy.",
      );
      return;
    }

    setIsRegistering(true);

    try {
      const supabase = createClient();

      const emailRedirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: normalizedName,
          },
        },
      });

      if (error) {
        setErrorMessage(getFriendlyRegisterError(error.message));
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Account created successfully. Check your email to verify your account.",
      );

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Registration error:", error);

      setErrorMessage(
        "Unable to create your account right now. Please try again.",
      );
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleGoogleRegister() {
    if (isLoading) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();

      const callbackUrl = `${window.location.origin}/auth/callback?next=/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        setErrorMessage(getFriendlyRegisterError(error.message));
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error("Google registration error:", error);

      setErrorMessage(
        "Unable to connect to Google. Please try again.",
      );

      setIsGoogleLoading(false);
    }
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#050d1d]">
      {/* Main content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left illustration */}
        <section className="relative hidden h-full w-1/2 overflow-hidden lg:block">
          <Image
            src={registerImage}
            alt="Student creating an InterviewIQ account"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050d1d]/20" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050d1d]/60 to-transparent" />
        </section>

        {/* Registration form */}
        <section className="relative flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-3 sm:px-8 lg:w-1/2 lg:px-12">
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-500/10 blur-[140px]" />

          <div className="relative w-full max-w-md">
            {/* Mobile brand */}
            <Link
              href="/"
              className="mb-3 inline-block text-xl font-semibold text-blue-300 transition hover:text-blue-200 lg:hidden"
            >
              InterviewIQ
            </Link>

            {/* Heading */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Start Your Journey
              </p>

              <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Create an account
              </h1>

              <p className="mt-1.5 text-sm leading-5 text-slate-400">
                Start your journey to interview mastery today.
              </p>
            </div>

            {/* Messages */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mt-3 flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{successMessage}</p>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleRegister}
              className="mt-4 space-y-2.5"
            >
              {/* Full name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1 block text-xs font-medium text-slate-300"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setErrorMessage("");
                    }}
                    autoComplete="name"
                    placeholder="Alex Johnson"
                    required
                    disabled={isLoading}
                    className="h-10 w-full rounded-lg border border-white/10 bg-[#111b30] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-medium text-slate-300"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrorMessage("");
                    }}
                    autoComplete="email"
                    placeholder="name@company.com"
                    required
                    disabled={isLoading}
                    className="h-10 w-full rounded-lg border border-white/10 bg-[#111b30] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password row */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-xs font-medium text-slate-300"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setErrorMessage("");
                      }}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      required
                      disabled={isLoading}
                      className="h-10 w-full rounded-lg border border-white/10 bg-[#111b30] pl-10 pr-10 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setShowPassword((current) => !current);
                      }}
                      disabled={isLoading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1 block text-xs font-medium text-slate-300"
                  >
                    Confirm
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setErrorMessage("");
                      }}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      required
                      disabled={isLoading}
                      className="h-10 w-full rounded-lg border border-white/10 bg-[#111b30] pl-10 pr-10 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setShowConfirmPassword((current) => !current);
                      }}
                      disabled={isLoading}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-4 text-slate-500">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    setAcceptedTerms(event.target.checked);
                    setErrorMessage("");
                  }}
                  disabled={isLoading}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/20 bg-[#111b30] accent-blue-600"
                />

                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-950/40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-blue-600/60 disabled:shadow-none"
              >
                {isRegistering ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-3 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-[10px] uppercase tracking-wider text-slate-600">
                Or register with Google
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={isLoading}
              className="flex h-10 w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-transparent text-sm font-medium text-slate-200 transition hover:border-blue-500/40 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Image
                    src={googleLogo}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                  />

                  Continue with Google
                </>
              )}
            </button>

            {/* Login */}
            <p className="mt-3 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-400 transition hover:text-blue-300"
              >
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-white/10 bg-[#050d1d] px-5 py-3 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3 sm:items-center">
          <div className="order-1 justify-self-start">
            <Link
              href="/"
              className="text-base font-semibold tracking-tight text-blue-300 transition hover:text-blue-200"
            >
              InterviewIQ
            </Link>
          </div>

          <nav
            aria-label="Footer navigation"
            className="order-2 flex flex-wrap items-center gap-x-5 gap-y-2 sm:order-3 sm:justify-self-end"
          >
            <Link
              href="/privacy"
              className="text-xs text-slate-500 transition hover:text-blue-300"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-slate-500 transition hover:text-blue-300"
            >
              Terms of Service
            </Link>

            <Link
              href="mailto:interviewiq@example.com"
              className="text-xs text-slate-500 transition hover:text-blue-300"
            >
              Contact Us
            </Link>

            <Link
              href="/#faq"
              className="text-xs text-slate-500 transition hover:text-blue-300"
            >
              FAQ
            </Link>
          </nav>

          <p className="order-3 text-center text-xs text-slate-600 sm:order-2 sm:justify-self-center">
            © {new Date().getFullYear()} InterviewIQ. All rights
            reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function getFriendlyRegisterError(message: string): string {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already exists")
  ) {
    return "An account already exists with this email address.";
  }

  if (normalizedMessage.includes("password")) {
    return "Your password does not meet the required security rules.";
  }

  if (normalizedMessage.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("too many requests")
  ) {
    return "Too many registration attempts. Please wait and try again.";
  }

  if (normalizedMessage.includes("provider is not enabled")) {
    return "Google authentication has not been enabled in Supabase.";
  }

  return message;
}