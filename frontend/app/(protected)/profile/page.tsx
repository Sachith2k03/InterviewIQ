"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ProfileCard,
    ResumeManagementCard,
    ProfileStatsGrid,
    ProfileProgressSection,
    RecentInterviews,
} from "@/components/profile";

import { useProfile } from "@/contexts/ProfileContext";
import {
    DashboardResponse,
    getDashboard,
} from "@/lib/api/dashboard";

export default function ProfilePage() {
    const {
        profile,
        authAvatarUrl,
        isLoading: isProfileLoading,
    } = useProfile();

    const [dashboard, setDashboard] =
        useState<DashboardResponse | null>(null);

    const [isDashboardLoading, setIsDashboardLoading] =
        useState(true);

    const [dashboardError, setDashboardError] =
        useState<string | null>(null);

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
        void loadDashboard();
    }, [loadDashboard]);

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

    const fullName =
        profile?.full_name?.trim() ||
        "InterviewIQ User";

    const email =
        profile?.email ||
        "Email unavailable";

    const avatarUrl =
        profile?.avatar_url ||
        authAvatarUrl ||
        null;

    const performanceData =
        dashboard?.performance.map(
            (point, index) => ({
                label: `Interview ${index + 1}`,
                score: point.score,
            }),
        ) ?? [];

    const distributionData =
        dashboard?.interview_distribution ?? [];

    const recentInterviews =
        dashboard?.recent_interview
            ? [
                  {
                      id: dashboard.recent_interview.id,
                      jobRole:
                          dashboard.recent_interview
                              .job_role,
                      interviewType:
                          dashboard.recent_interview
                              .interview_type,
                      status:
                          dashboard.recent_interview
                              .status,
                      overallScore:
                          dashboard.recent_interview
                              .overall_score,
                      createdAt:
                          dashboard.recent_interview
                              .created_at,
                  },
              ]
            : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">
                    User Profile
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    Monitor your interview journey with
                    personalized performance insights.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ProfileCard
                    fullName={fullName}
                    email={email}
                    avatarUrl={avatarUrl}
                    createdAt={
                        profile?.created_at ?? null
                    }
                    onEditProfile={() => {
                        console.log(
                            "Open edit profile dialog",
                        );
                    }}
                />

                <ResumeManagementCard />
            </div>

            {dashboardError ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">
                        {dashboardError}
                    </p>

                    <button
                        type="button"
                        className="mt-2 text-sm font-medium text-red-300 underline underline-offset-4"
                        onClick={() =>
                            void loadDashboard()
                        }
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
                        completedInterviews={
                            dashboard?.interviews_completed ??
                            0
                        }
                        averageScore={
                            dashboard?.average_score ?? 0
                        }
                        practiceMinutes={
                            dashboard?.practice_minutes ?? 0
                        }
                        bestScore={
                            dashboard?.best_score ?? 0
                        }
                    />

                    <ProfileProgressSection
                        performanceData={
                            performanceData
                        }
                        distributionData={
                            distributionData
                        }
                    />

                    <RecentInterviews
                        interviews={recentInterviews}
                    />
                </>
            )}
        </div>
    );
}