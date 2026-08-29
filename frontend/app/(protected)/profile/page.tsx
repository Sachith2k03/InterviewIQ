"use client";

import {
  type ChangeEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Camera, CheckCircle2, Loader2, Upload } from "lucide-react";

import {
  ProfileCard,
  ResumeManagementCard,
  ProfileStatsGrid,
  ProfileProgressSection,
  RecentInterviews,
} from "@/components/profile";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { useProfile } from "@/contexts/ProfileContext";

import { DashboardResponse, getDashboard } from "@/lib/api/dashboard";

import { updateProfile, uploadProfileAvatar } from "@/lib/api/profile";

function getInitials(fullName: string): string {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "U";
}

export default function ProfilePage() {
  const {
    profile,
    authAvatarUrl,
    isLoading: isProfileLoading,
    setProfile,
    refreshProfile,
  } = useProfile();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);

  const [fullNameInput, setFullNameInput] = useState("");

  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [updateError, setUpdateError] = useState<string | null>(null);

  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsDashboardLoading(true);

      setDashboardError(null);

      const data = await getDashboard();

      setDashboard(data);
    } catch (error) {
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Failed to load profile statistics.",
      );
    } finally {
      setIsDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (isProfileLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 animate-pulse rounded bg-white/10" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-white/5" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl bg-white/5" />

          <div className="h-96 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  const fullName = profile?.full_name?.trim() || "InterviewIQ User";

  const email = profile?.email || "Email unavailable";

  const avatarUrl = profile?.avatar_url || authAvatarUrl || null;

  const performanceData =
    dashboard?.performance.map((point, index) => ({
      label: `Interview ${index + 1}`,
      score: point.score,
    })) ?? [];

  const distributionData = dashboard?.interview_distribution ?? [];

  const recentInterviews = dashboard?.recent_interview
    ? [
        {
          id: dashboard.recent_interview.id,

          jobRole: dashboard.recent_interview.job_role,

          interviewType: dashboard.recent_interview.interview_type,

          status: dashboard.recent_interview.status,

          overallScore: dashboard.recent_interview.overall_score,

          createdAt: dashboard.recent_interview.created_at,
        },
      ]
    : [];

  function openEditProfile() {
    setFullNameInput(profile?.full_name ?? "");

    setSelectedAvatar(null);

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarPreview(null);

    setUpdateError(null);

    setUpdateSuccess(null);

    setEditOpen(true);
  }

  function handleAvatarSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setUpdateError("Choose a JPEG, PNG, or WebP image.");

      event.target.value = "";

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUpdateError("Profile picture must be 2 MB or smaller.");

      event.target.value = "";

      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setSelectedAvatar(file);

    setAvatarPreview(URL.createObjectURL(file));

    setUpdateError(null);
  }

  async function handleProfileUpdate(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = fullNameInput.trim();

    if (trimmedName.length < 2) {
      setUpdateError("Full name must contain at least 2 characters.");

      return;
    }

    try {
      setIsSaving(true);

      setUpdateError(null);

      setUpdateSuccess(null);

      let updatedProfile = await updateProfile(trimmedName);

      if (selectedAvatar) {
        updatedProfile = await uploadProfileAvatar(selectedAvatar);
      }

      setProfile(updatedProfile);

      await refreshProfile();

      setUpdateSuccess("Profile updated successfully.");

      setSelectedAvatar(null);

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);

        setAvatarPreview(null);
      }

      setTimeout(() => {
        setEditOpen(false);
      }, 700);
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const previewAvatar = avatarPreview || avatarUrl || undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Profile</h1>

        <p className="mt-1 text-sm text-slate-400">
          Monitor your interview journey with personalized performance insights.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard
          fullName={fullName}
          email={email}
          avatarUrl={avatarUrl}
          createdAt={profile?.created_at ?? null}
          onEditProfile={openEditProfile}
        />

        <ResumeManagementCard />
      </div>

      {dashboardError ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{dashboardError}</p>

          <button
            type="button"
            className="mt-2 text-sm font-medium text-red-300 underline underline-offset-4"
            onClick={() => void loadDashboard()}
          >
            Try again
          </button>
        </div>
      ) : null}

      {isDashboardLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl bg-white/5"
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-xl bg-white/5" />

            <div className="h-80 animate-pulse rounded-xl bg-white/5" />
          </div>
        </>
      ) : (
        <>
          <ProfileStatsGrid
            completedInterviews={dashboard?.interviews_completed ?? 0}
            averageScore={dashboard?.average_score ?? 0}
            practiceMinutes={dashboard?.practice_minutes ?? 0}
            bestScore={dashboard?.best_score ?? 0}
          />

          <ProfileProgressSection
            performanceData={performanceData}
            distributionData={distributionData}
          />

          <RecentInterviews interviews={recentInterviews} />
        </>
      )}

      {/* Update Profile Dialog */}

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (isSaving) {
            return;
          }

          setEditOpen(open);

          if (!open) {
            setUpdateError(null);

            setUpdateSuccess(null);

            setSelectedAvatar(null);
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#101a2e] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>

            <DialogDescription className="text-slate-400">
              Update your display name and profile picture.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            {/* Avatar */}

            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-blue-500/50">
                  <AvatarImage src={previewAvatar} alt="Profile preview" />

                  <AvatarFallback className="bg-blue-600 text-xl font-semibold text-white">
                    {getInitials(fullNameInput || fullName)}
                  </AvatarFallback>
                </Avatar>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-blue-600 text-white transition hover:bg-blue-500"
                  aria-label="Choose profile picture"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarSelection}
              />

              <Button
                type="button"
                variant="outline"
                className="mt-4 border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Photo
              </Button>

              <p className="mt-2 text-center text-xs text-slate-500">
                JPEG, PNG or WebP. Maximum 2 MB.
              </p>
            </div>

            {/* Full name */}

            <div>
              <label
                htmlFor="profile-full-name"
                className="text-sm font-medium text-slate-300"
              >
                Full Name
              </label>

              <Input
                id="profile-full-name"
                value={fullNameInput}
                onChange={(event) => setFullNameInput(event.target.value)}
                disabled={isSaving}
                className="mt-2 border-white/10 bg-[#0c1527] text-white"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="profile-email"
                className="text-sm font-medium text-slate-300"
              >
                Email
              </label>

              <Input
                id="profile-email"
                value={email}
                readOnly
                disabled
                className="mt-2 border-white/10 bg-[#0c1527] text-slate-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Email cannot be changed from profile settings.
              </p>
            </div>

            {updateError ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {updateError}
              </div>
            ) : null}

            {updateSuccess ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />

                {updateSuccess}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setEditOpen(false)}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 text-white hover:bg-blue-500"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
