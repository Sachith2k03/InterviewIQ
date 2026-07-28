"use client";

import {
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { createClient } from "@/lib/supabase"

import loginImage from "../../../public/images/login-image.png";
import googleLogo from "../../../public/images/google-logo.svg";

const REMEMBERED_EMAIL_KEY = "interviewiq-remembered-email";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isLoading = isEmailLoading || isGoogleLoading;

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem(
      REMEMBERED_EMAIL_KEY,
    );

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberEmail(true);
    }
  }, []);


  async function handleEmailLogin(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setErrorMessage("");
    setIsEmailLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password) {
        setErrorMessage("Please enter your email and password.");
        return;
      }

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorMessage(getFriendlyAuthError(error.message));
        return;
      }

      if (rememberEmail) {
        window.localStorage.setItem(
          REMEMBERED_EMAIL_KEY,
          normalizedEmail,
        );
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Email login error:", error);

      setErrorMessage(
        "Unable to sign in right now. Please try again.",
      );
    } finally {
      setIsEmailLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (isLoading) {
      return;
    }

    setErrorMessage("");
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
        setErrorMessage(getFriendlyAuthError(error.message));
        setIsGoogleLoading(false);
      }

      // On success, Supabase redirects the browser to Google.
    } catch (error) {
      console.error("Google login error:", error);

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
            src={loginImage}
            alt="Student preparing for an interview using InterviewIQ"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050d1d]/20" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050d1d]/60 to-transparent" />
        </section>

        {/* Login form */}
        <section className="relative flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-4 sm:px-8 lg:w-1/2 lg:px-12">
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-500/10 blur-[140px]" />

          <div className="relative w-full max-w-md">
            {/* Mobile brand */}
            <Link
              href="/"
              className="mb-4 inline-block text-xl font-semibold text-blue-300 transition-colors hover:text-blue-200 lg:hidden"
            >
              InterviewIQ
            </Link>

            {/* Heading */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 sm:text-sm">
                Welcome Back
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Login
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Sign in to continue your interview preparation journey.
              </p>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <p>{errorMessage}</p>
              </div>
            )}

            {/* Email login form */}
            <form
              className="mt-5 space-y-3.5"
              onSubmit={handleEmailLogin}
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

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
                    className="h-11 w-full rounded-lg border border-white/10 bg-[#111b30] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-400 transition hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrorMessage("");
                    }}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="h-11 w-full rounded-lg border border-white/10 bg-[#111b30] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword((current) => !current);
                    }}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300 disabled:cursor-not-allowed"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember email */}
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(event) => {
                    setRememberEmail(event.target.checked);
                  }}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-white/20 bg-[#111b30] accent-blue-600 disabled:cursor-not-allowed"
                />

                Remember my email
              </label>

              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-950/40 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-blue-600/60 disabled:shadow-none"
              >
                {isEmailLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs uppercase tracking-wider text-slate-600">
                Or
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-transparent text-sm font-medium text-slate-200 transition-all duration-300 hover:border-blue-500/40 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
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
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />

                  Continue with Google
                </>
              )}
            </button>

            {/* Register link */}
            <p className="mt-4 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-400 transition hover:text-blue-300"
              >
                Get Started
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
              className="text-base font-semibold tracking-tight text-blue-300 transition-colors hover:text-blue-200"
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

function getFriendlyAuthError(message: string): string {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "The email or password you entered is incorrect.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Please verify your email address before logging in.";
  }

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("too many requests")
  ) {
    return "Too many login attempts. Please wait and try again.";
  }

  if (normalizedMessage.includes("provider is not enabled")) {
    return "Google login has not been enabled in Supabase.";
  }

  return message;
}