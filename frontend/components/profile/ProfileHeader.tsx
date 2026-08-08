"use client";

import { Camera, Mail, Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProfileHeaderProps {
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    onEdit: () => void;
    onAvatarChange?: () => void;
}

function getInitials(fullName: string): string {
    const initials = fullName
        .trim()
        .split(/\s+/)
        .map((name) => name.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return initials || "U";
}

export function ProfileHeader({
    fullName,
    email,
    avatarUrl,
    onEdit,
    onAvatarChange,
}: ProfileHeaderProps) {
    return (
        <Card className="overflow-hidden border-white/10 bg-[#0b1528]">
            <div className="h-28 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-500/20" />

            <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="-mt-12 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                    <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-[#0b1528]">
                            <AvatarImage
                                src={avatarUrl ?? undefined}
                                alt={fullName}
                            />

                            <AvatarFallback className="bg-indigo-500 text-xl font-semibold text-white">
                                {getInitials(fullName)}
                            </AvatarFallback>
                        </Avatar>

                        {onAvatarChange ? (
                            <Button
                                type="button"
                                size="icon"
                                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                                onClick={onAvatarChange}
                                aria-label="Change profile picture"
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        ) : null}
                    </div>

                    <div className="pb-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-white">
                            {fullName}
                        </h1>

                        <div className="mt-1 flex items-center justify-center gap-2 text-sm text-slate-400 sm:justify-start">
                            <Mail className="h-4 w-4" />
                            <span>{email}</span>
                        </div>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    onClick={onEdit}
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
            </div>
        </Card>
    );
}