"use client";

import {
    ChangeEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    AlertTriangle,
    FileText,
    Loader2,
    RefreshCw,
    Trash2,
    UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    getResumes,
    removeResume,
    Resume,
    uploadResume,
} from "@/lib/api/resumes";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_RESUMES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatUploadDate(createdAt: string): string {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "Upload date unavailable";
    }

    return `Uploaded ${date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        },
    )}`;
}

function getDefaultTitle(fileName: string): string {
    return fileName.replace(/\.pdf$/i, "").trim();
}

export function ResumeManagementCard() {
    const fileInputRef =
        useRef<HTMLInputElement>(null);

    const [resumes, setResumes] = useState<Resume[]>(
        [],
    );
    const [title, setTitle] = useState("");
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);
    const [isUploading, setIsUploading] =
        useState(false);

    const [resumeToDelete, setResumeToDelete] =
        useState<Resume | null>(null);
    
    const [deletingResumeId, setDeletingResumeId] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);
    const [message, setMessage] =
        useState<string | null>(null);

    useEffect(() => {
        if (!message) {
            return;
        }
    
        const timer = setTimeout(() => {
            setMessage(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    useEffect(() => {
        if (!error) {
            return;
        }
    
        const timer = setTimeout(() => {
            setMessage(null);
        }, 5000);

        return () => clearTimeout(timer);
    }, [error]);


    const activeResumeCount = resumes.length;
    const uploadLimitReached =
        activeResumeCount >= MAX_RESUMES;

    const loadResumes = useCallback(async () => {
        try {
            setError(null);

            const data = await getResumes();
            setResumes(data);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Failed to load resumes.",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadResumes();
    }, [loadResumes]);

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setTitle("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError(null);
        setMessage(null);

        const isPdf =
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
            setError(
                "Only PDF resume files are allowed.",
            );
            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(
                "Resume file must be smaller than 5 MB.",
            );
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
        setTitle(getDefaultTitle(file.name));
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError(
                "Select a PDF resume before uploading.",
            );
            return;
        }

        const cleanedTitle = title.trim();

        if (!cleanedTitle) {
            setError("Enter a resume title.");
            return;
        }

        if (uploadLimitReached) {
            setError(
                "You already have 5 active resumes. Remove one before uploading another.",
            );
            return;
        }

        try {
            setIsUploading(true);
            setError(null);
            setMessage(null);

            const uploadedResume = await uploadResume(
                selectedFile,
                cleanedTitle,
            );

            setResumes((currentResumes) => [
                uploadedResume,
                ...currentResumes,
            ]);

            clearSelectedFile();

            setMessage(
                "Resume uploaded successfully.",
            );
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : "Failed to upload resume.",
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!resumeToDelete) {
            return;
        }

        const resume = resumeToDelete;

        try {
            setDeletingResumeId(resume.id);
            setError(null);
            setMessage(null);

            const result = await removeResume(
                resume.id,
            );

            setResumes((currentResumes) =>
                currentResumes.filter(
                    (item) => item.id !== resume.id,
                ),
            );

            setMessage(
                result.action === "archived"
                    ? "Resume removed. Existing interview history was preserved."
                    : "Resume deleted successfully.",
            );

            setResumeToDelete(null);
        } catch (removeError) {
            setError(
                removeError instanceof Error
                    ? removeError.message
                    : "Failed to remove resume.",
            );
        } finally {
            setDeletingResumeId(null);
        }
    };



    return (
        <Card className="h-full border-white/10 bg-[#111a2d] p-6 text-white">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-400" />

                        <h2 className="text-sm font-semibold">
                            Resume Management
                        </h2>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                        {activeResumeCount}/{MAX_RESUMES}{" "}
                        active resumes
                    </p>
                </div>

                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                        setIsLoading(true);
                        void loadResumes();
                    }}
                    disabled={
                        isLoading || isUploading
                    }
                    aria-label="Refresh resumes"
                    className="text-slate-400 hover:bg-white/5 hover:text-white"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            isLoading
                                ? "animate-spin"
                                : ""
                        }`}
                    />
                </Button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleFileChange}
            />

            <button
                type="button"
                className="mt-5 flex min-h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-600 bg-[#0c1527] px-4 py-5 text-center transition hover:border-blue-500 hover:bg-blue-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() =>
                    fileInputRef.current?.click()
                }
                disabled={
                    isUploading ||
                    uploadLimitReached
                }
            >
                <UploadCloud className="h-7 w-7 text-slate-300" />

                <span className="mt-3 text-sm font-medium">
                    {uploadLimitReached
                        ? "Resume limit reached"
                        : "Select a PDF resume"}
                </span>

                <span className="mt-1 text-xs text-slate-500">
                    PDF only, maximum 5 MB
                </span>
            </button>

            {selectedFile ? (
                <div className="mt-4 space-y-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 shrink-0 text-blue-400" />

                        <p className="min-w-0 truncate text-sm text-slate-300">
                            {selectedFile.name}
                        </p>
                    </div>

                    <Input
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        placeholder="Resume title"
                        disabled={isUploading}
                        maxLength={100}
                        className="border-white/10 bg-[#0c1527] text-white placeholder:text-slate-500"
                    />

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={handleUpload}
                            disabled={
                                isUploading ||
                                !title.trim()
                            }
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                "Upload Resume"
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearSelectedFile}
                            disabled={isUploading}
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : null}

            <div className="mt-5 space-y-3">
                {isLoading ? (
                    <div className="flex min-h-24 items-center justify-center rounded-lg border border-white/10 bg-[#0c1527]">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    </div>
                ) : resumes.length > 0 ? (
                    resumes.map((resume) => {
                        const isDeleting =
                            deletingResumeId ===
                            resume.id;

                        return (
                            <div
                                key={resume.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0c1527] p-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
                                        <FileText className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-200">
                                            {resume.title}
                                        </p>

                                        <p className="mt-0.5 truncate text-xs text-slate-500">
                                            {resume.file_name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {formatUploadDate(
                                                resume.created_at,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setResumeToDelete(resume)}
                                    disabled={
                                        isUploading ||
                                        deletingResumeId !==
                                            null
                                    }
                                    aria-label={`Remove ${resume.title}`}
                                    className="shrink-0 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-white/10 bg-[#0c1527] p-4 text-sm text-slate-400">
                        No active resumes uploaded yet.
                    </div>
                )}
            </div>

            {error ? (
                <p
                    role="alert"
                    className="mt-4 text-sm text-red-400"
                >
                    {error}
                </p>
            ) : null}

            {message ? (
                <p
                    role="status"
                    className="mt-4 text-sm text-emerald-400"
                >
                    {message}
                </p>
            ) : null}

            <AlertDialog
    open={resumeToDelete !== null}
    onOpenChange={(open) => {
        if (!open && deletingResumeId === null) {
            setResumeToDelete(null);
        }
    }}
>
    <AlertDialogContent
        className="
            border-white/10
            bg-[#111a2d]
            text-white
            shadow-2xl
            sm:max-w-md
        "
    >
        <AlertDialogHeader>
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
                    <Trash2 className="h-5 w-5" />
                </div>

                <AlertDialogTitle className="text-lg font-semibold text-white">
                    Remove Resume
                </AlertDialogTitle>
            </div>

            <AlertDialogDescription className="pt-2 text-sm leading-6 text-slate-400">
                Are you sure you want to remove{" "}
                <span className="font-medium text-slate-200">
                    {resumeToDelete?.title}
                </span>
                ?
            </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />

            <p className="text-sm leading-5 text-amber-200">
                If this resume has been used in an
                interview, the interview history will
                remain available. Only the resume file
                will be removed.
            </p>
        </div>

        <AlertDialogFooter className="mt-2">
            <AlertDialogCancel
                disabled={deletingResumeId !== null}
                className="
                    border-white/10
                    bg-white/5
                    text-slate-300
                    hover:bg-white/10
                    hover:text-white
                "
            >
                Cancel
            </AlertDialogCancel>

            <AlertDialogAction
                onClick={(event) => {
                    event.preventDefault();
                    void handleRemove();
                }}
                disabled={deletingResumeId !== null}
                className="
                    bg-red-600
                    text-white
                    hover:bg-red-500
                    focus-visible:ring-red-500
                "
            >
                {deletingResumeId !== null ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Removing...
                    </>
                ) : (
                    <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Resume
                    </>
                )}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
        </Card>
    );
}