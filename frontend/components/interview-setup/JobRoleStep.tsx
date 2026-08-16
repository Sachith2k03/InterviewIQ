"use client";

import { useState } from "react";
import {
    Braces,
    CloudCog,
    Database,
    Layers3,
    Paintbrush,
    Plus,
    Search,
    ShieldCheck,
    Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface JobRoleStepProps {
    selectedRole: string;
    onSelect: (role: string) => void;
    onBack: () => void;
}

interface RoleOption {
    title: string;
    description: string;
    icon: React.ComponentType<{
        className?: string;
    }>;
}

const roles: RoleOption[] = [
    {
        title: "Frontend Developer",
        description:
            "Build responsive and interactive web applications.",
        icon: Braces,
    },
    {
        title: "Backend Developer",
        description:
            "Design APIs, services, databases, and backend systems.",
        icon: Database,
    },
    {
        title: "Full Stack Developer",
        description:
            "Work across frontend, backend, and databases.",
        icon: Layers3,
    },
    {
        title: "UI/UX Designer",
        description:
            "Design user experiences, interfaces, and product flows.",
        icon: Paintbrush,
    },
    {
        title: "Data Analyst",
        description:
            "Analyze data and communicate actionable insights.",
        icon: Database,
    },
    {
        title: "DevOps Engineer",
        description:
            "Manage infrastructure, CI/CD, deployment, and reliability.",
        icon: CloudCog,
    },
    {
        title: "QA Engineer",
        description:
            "Test applications and improve software quality.",
        icon: ShieldCheck,
    },
    {
        title: "Mobile Developer",
        description:
            "Build mobile applications and platform experiences.",
        icon: Smartphone,
    },
];

export default function JobRoleStep({
    selectedRole,
    onSelect,
    onBack,
}: JobRoleStepProps) {
    const [search, setSearch] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [showCustomRole, setShowCustomRole] =
        useState(false);

    const filteredRoles = roles.filter((role) =>
        role.title
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    const handleCustomRole = () => {
        const role = customRole.trim();

        if (!role) {
            return;
        }

        onSelect(role);
    };

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm text-slate-400 transition hover:text-white"
                    >
                        ← Back to Interview Type
                    </button>

                    <p className="mt-6 text-sm font-medium text-blue-400">
                        Step 2 of 5
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        Choose your target role
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Select the role you want InterviewIQ
                        to tailor your questions for.
                    </p>
                </div>

                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <Input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search roles..."
                        className="border-white/10 bg-[#111a2d] pl-9 text-white placeholder:text-slate-500"
                    />
                </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredRoles.map((role) => {
                    const Icon = role.icon;

                    const isSelected =
                        selectedRole === role.title;

                    return (
                        <button
                            key={role.title}
                            type="button"
                            onClick={() =>
                                onSelect(role.title)
                            }
                            className="text-left"
                        >
                            <Card
                                className={`h-full min-h-48 border p-5 transition-all duration-200 ${
                                    isSelected
                                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-950/30"
                                        : "border-white/10 bg-[#111a2d] hover:border-blue-500/40 hover:bg-[#14203a]"
                                }`}
                            >
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                        isSelected
                                            ? "bg-blue-500/20 text-blue-300"
                                            : "bg-blue-500/10 text-blue-400"
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h2 className="mt-4 font-semibold text-white">
                                    {role.title}
                                </h2>

                                <p className="mt-2 text-sm leading-5 text-slate-400">
                                    {role.description}
                                </p>

                                {isSelected ? (
                                    <span className="mt-4 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                                        Selected
                                    </span>
                                ) : null}
                            </Card>
                        </button>
                    );
                })}

                <button
                    type="button"
                    onClick={() =>
                        setShowCustomRole(true)
                    }
                    className="text-left"
                >
                    <Card
                        className={`flex h-full min-h-48 flex-col items-center justify-center border p-5 text-center transition-all ${
                            showCustomRole
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-white/10 bg-[#111a2d] hover:border-blue-500/40 hover:bg-[#14203a]"
                        }`}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                            <Plus className="h-5 w-5" />
                        </div>

                        <h2 className="mt-4 font-semibold text-white">
                            Custom Role
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Enter a role that is not listed.
                        </p>
                    </Card>
                </button>
            </div>

            {showCustomRole ? (
                <div className="mt-5 rounded-xl border border-white/10 bg-[#111a2d] p-5">
                    <label
                        htmlFor="custom-role"
                        className="text-sm font-medium text-white"
                    >
                        Custom Role
                    </label>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <Input
                            id="custom-role"
                            value={customRole}
                            onChange={(event) =>
                                setCustomRole(
                                    event.target.value,
                                )
                            }
                            placeholder="e.g. Machine Learning Engineer"
                            maxLength={100}
                            className="border-white/10 bg-[#0c1527] text-white placeholder:text-slate-500"
                        />

                        <Button
                            type="button"
                            onClick={handleCustomRole}
                            disabled={!customRole.trim()}
                            className="bg-blue-600 text-white hover:bg-blue-500"
                        >
                            Use Role
                        </Button>
                    </div>
                </div>
            ) : null}

            <div className="mt-8">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                    Back
                </Button>
            </div>
        </div>
    );
}