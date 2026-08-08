"use client";

import { CalendarDays, Mail, Pencil } from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProfileCardProps {
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    createdAt?: string | null;
    onEditProfile: () => void;
}

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

function formatMemberSince(
    createdAt?: string | null,
): string {
    if (!createdAt) {
        return "Not available";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

export function ProfileCard({
    fullName,
    email,
    avatarUrl,
    createdAt,
    onEditProfile,
}: ProfileCardProps) {
    return (
        <Card className="h-full border-white/10 bg-[#111a2d] p-6 text-white">
            <div className="flex h-full flex-col">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border-2 border-blue-500/50">
                        <AvatarImage
                            src={avatarUrl ?? undefined}
                            alt={`${fullName} profile picture`}
                        />

                        <AvatarFallback className="bg-blue-600 text-xl font-semibold text-white">
                            {getInitials(fullName)}
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="mt-4 text-xl font-semibold">
                        {fullName}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <Mail className="h-4 w-4" />
                        <span className="break-all">
                            {email}
                        </span>
                    </div>
                </div>

                <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                            <CalendarDays className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Member since
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-200">
                                {formatMemberSince(createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    type="button"
                    className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-500"
                    onClick={onEditProfile}
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    Update Profile
                </Button>
            </div>
        </Card>
    );
}