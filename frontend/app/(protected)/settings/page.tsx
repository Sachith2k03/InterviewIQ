"use client";

import { type SyntheticEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { deleteAccount } from "@/lib/api/account";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useProfile } from "@/contexts/ProfileContext";
import { createClient } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();

  const { profile, isLoading: isProfileLoading } = useProfile();

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [logoutError, setLogoutError] = useState<string | null>(null);

  const fullName = profile?.full_name?.trim() || "InterviewIQ User";

  const email = profile?.email || "Email unavailable";

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null,
  );

  async function handleDeleteAccount() {
    if (deleteConfirmation !== "DELETE") {
      setDeleteAccountError('Type "DELETE" to confirm account deletion.');

      return;
    }

    try {
      setIsDeletingAccount(true);
      setDeleteAccountError(null);

      await deleteAccount();

      const supabase = createClient();

      await supabase.auth.signOut();

      router.replace("/login");

      router.refresh();
    } catch (error) {
      setDeleteAccountError(
        error instanceof Error
          ? error.message
          : "Unable to delete your account.",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  }

  async function handlePasswordChange(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isChangingPassword) {
      return;
    }

    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("Your new password must contain at least 8 characters.");

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The passwords do not match.");

      return;
    }

    try {
      setIsChangingPassword(true);

      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);

        return;
      }

      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess("Your password has been updated successfully.");
    } catch {
      setPasswordError("Unable to update your password right now.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      setLogoutError(null);

      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        setLogoutError(error.message);

        return;
      }

      router.replace("/login");

      router.refresh();
    } catch {
      setLogoutError("Unable to log out right now.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isProfileLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-36 animate-pulse rounded bg-white/10" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-white/5" />
        </div>

        <div className="space-y-5">
          <div className="h-48 animate-pulse rounded-xl bg-white/5" />

          <div className="h-80 animate-pulse rounded-xl bg-white/5" />

          <div className="h-48 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Header */}

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Settings className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage your account, security and session.
            </p>
          </div>
        </div>
      </div>

      {/* Account */}

      <section className="rounded-xl border border-white/10 bg-[#101a2e]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <UserRound className="h-5 w-5 text-blue-400" />

            <div>
              <h2 className="font-semibold text-white">Account</h2>

              <p className="mt-1 text-xs text-slate-500">
                Review your InterviewIQ account information.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Full Name
              </p>

              <p className="mt-2 text-sm font-medium text-white">{fullName}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Email Address
              </p>

              <p className="mt-2 break-all text-sm font-medium text-white">
                {email}
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-5">
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/profile">
                <UserRound className="mr-2 h-4 w-4" />
                Manage Profile
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Security */}

      <section className="rounded-xl border border-white/10 bg-[#101a2e]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />

            <div>
              <h2 className="font-semibold text-white">Security</h2>

              <p className="mt-1 text-xs text-slate-500">
                Update the password used to access your account.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {/* New password */}

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
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className="border-white/10 bg-[#0c1527] pl-10 pr-10 text-white"
                />

                <button
                  type="button"
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                >
                  {showNewPassword ? (
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
          </div>

          {passwordError ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {passwordError}
            </div>
          ) : null}

          {passwordSuccess ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />

              {passwordSuccess}
            </div>
          ) : null}

          <div>
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </section>

      {/* Session */}

      <section className="rounded-xl border border-white/10 bg-[#101a2e]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5 text-slate-400" />

            <div>
              <h2 className="font-semibold text-white">Session</h2>

              <p className="mt-1 text-xs text-slate-500">
                Sign out of your current InterviewIQ session.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">Sign out</p>

              <p className="mt-1 text-sm text-slate-500">
                You will need to authenticate again to access your account.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              className="shrink-0 border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <LogOut className="mr-2 h-4 w-4" />

              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>

          {logoutError ? (
            <p className="mt-4 text-sm text-red-400">{logoutError}</p>
          ) : null}
        </div>
      </section>

      {/* Danger Zone */}

      <section className="rounded-xl border border-red-500/20 bg-red-500/5">
        <div className="border-b border-red-500/20 px-6 py-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />

            <div>
              <h2 className="font-semibold text-red-300">Danger Zone</h2>

              <p className="mt-1 text-xs text-slate-500">
                Permanently delete your InterviewIQ account and associated data.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Delete Account</p>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              This permanently removes your account, resumes, interviews,
              responses, reports and stored interview files. This action cannot
              be undone.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDeleteAccountError(null);

              setDeleteConfirmation("");

              setDeleteDialogOpen(true);
            }}
            className="shrink-0 border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </section>

      {/* Delete Account Confirmation Dialog */}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (isDeletingAccount) {
            return;
          }

          setDeleteDialogOpen(open);

          if (!open) {
            setDeleteConfirmation("");
            setDeleteAccountError(null);
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#101a2e] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="h-5 w-5" />
              Permanently delete account?
            </DialogTitle>

            <DialogDescription className="leading-6 text-slate-400">
              Your InterviewIQ account and all associated data will be
              permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm font-medium text-red-200">
                The following data will be permanently removed:
              </p>

              <ul className="mt-3 space-y-2 text-sm text-red-200/70">
                <li>• Your InterviewIQ account</li>
                <li>• Uploaded resumes</li>
                <li>• Interview history and questions</li>
                <li>• Recorded answers and transcripts</li>
                <li>• Interview scores and feedback</li>
                <li>• Generated interview reports</li>
              </ul>
            </div>

            <div className="mt-5">
              <label
                htmlFor="delete-confirmation"
                className="text-sm text-slate-300"
              >
                Type <span className="font-semibold text-red-300">DELETE</span>{" "}
                to confirm.
              </label>

              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(event) => {
                  setDeleteConfirmation(event.target.value);
                  setDeleteAccountError(null);
                }}
                disabled={isDeletingAccount}
                placeholder="DELETE"
                autoComplete="off"
                className="mt-3 border-red-500/20 bg-[#0c1527] text-white placeholder:text-slate-600 focus-visible:ring-red-500/30"
              />
            </div>

            {deleteAccountError ? (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-300">{deleteAccountError}</p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeletingAccount}
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
                setDeleteAccountError(null);
              }}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={isDeletingAccount || deleteConfirmation !== "DELETE"}
              onClick={() => void handleDeleteAccount()}
              className="bg-red-600 text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />

              {isDeletingAccount ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
