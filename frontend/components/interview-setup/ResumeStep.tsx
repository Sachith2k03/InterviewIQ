"use client";

import { useEffect, useRef, useState } from "react";

import { FileText, Loader2, Plus, RefreshCw, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { getResumes, uploadResume, type Resume } from "@/lib/api/resumes";

interface ResumeStepProps {
  selectedResumeId: string | null;

  onSelect: (resumeId: string, resumeTitle: string) => void;

  onBack: () => void;
}

function formatUploadDate(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Upload date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ResumeStep({
  selectedResumeId,
  onSelect,
  onBack,
}: ResumeStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumes, setResumes] = useState<Resume[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [resumeTitle, setResumeTitle] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const [showUploadForm, setShowUploadForm] = useState(false);

  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const resumeLimitReached = resumes.length >= 5;

  async function loadResumes() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getResumes();

      setResumes(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load resumes.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadResumes();
  }, []);

  useEffect(() => {
    if (!uploadMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setUploadMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [uploadMessage]);

  const resetUploadForm = () => {
    setSelectedFile(null);
    setResumeTitle("");
    setShowUploadForm(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Only PDF resume files are allowed.");

      event.target.value = "";
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setError("Resume file must be smaller than 5 MB.");

      event.target.value = "";
      return;
    }

    setError(null);
    setSelectedFile(file);

    setResumeTitle(file.name.replace(/\.pdf$/i, "").trim());
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume file.");
      return;
    }

    const title = resumeTitle.trim();

    if (!title) {
      setError("Please enter a resume title.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadMessage(null);

      const uploadedResume = await uploadResume(selectedFile, title);

      setResumes((currentResumes) => [uploadedResume, ...currentResumes]);

      resetUploadForm();

      setUploadMessage("Resume uploaded successfully.");
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

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Target Role
        </button>

        <p className="mt-6 text-sm font-medium text-blue-400">Step 3 of 5</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Choose Your Resume
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Select an existing resume or upload a new one for InterviewIQ to use
          when personalizing your questions.
        </p>
      </div>

      {/* Error */}
      {error ? (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : null}

      {/* Success */}
      {uploadMessage ? (
        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-400">{uploadMessage}</p>
        </div>
      ) : null}

      {/* Loading */}
      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Resume grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {resumes.map((resume) => {
              const isSelected = selectedResumeId === resume.id;

              return (
                <button
                  key={resume.id}
                  type="button"
                  onClick={() => onSelect(resume.id, resume.title)}
                  className="text-left"
                >
                  <Card
                    className={`h-full border p-5 transition-all duration-200 ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-950/30"
                        : "border-white/10 bg-[#111a2d] hover:border-blue-500/40 hover:bg-[#14203a]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-white">
                              {resume.title}
                            </h2>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {resume.file_name}
                            </p>
                          </div>

                          {isSelected ? (
                            <span className="shrink-0 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-300">
                              Selected
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                          Uploaded {formatUploadDate(resume.created_at)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}

            {/* Upload card */}
            {!resumeLimitReached ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setShowUploadForm(true);
                }}
                className="text-left"
              >
                <Card className="flex h-full min-h-36 flex-col items-center justify-center border border-dashed border-white/10 bg-[#111a2d] p-5 text-center transition hover:border-blue-500/40 hover:bg-[#14203a]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Plus className="h-5 w-5" />
                  </div>

                  <h2 className="mt-3 text-sm font-semibold text-white">
                    Upload New Resume
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add another PDF resume
                  </p>
                </Card>
              </button>
            ) : null}
          </div>

          {/* Resume limit */}
          {resumeLimitReached ? (
            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <p className="text-sm text-amber-300">
                You have reached the maximum of 5 active resumes. Remove one
                from your profile before uploading another.
              </p>
            </div>
          ) : null}

          {/* Upload form */}
          {showUploadForm && !resumeLimitReached ? (
            <Card className="mt-6 border-white/10 bg-[#111a2d] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <UploadCloud className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Upload Resume
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    PDF only, maximum 5 MB
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {/* File picker */}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-600 bg-[#0c1527] px-4 py-5 text-center transition hover:border-blue-500 hover:bg-blue-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UploadCloud className="h-6 w-6 text-slate-300" />

                  <span className="mt-2 max-w-full truncate text-sm font-medium text-slate-300">
                    {selectedFile ? selectedFile.name : "Choose a PDF resume"}
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    Click to browse
                  </span>
                </button>

                {/* Title */}
                <div>
                  <label
                    htmlFor="resume-title"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Resume Title
                  </label>

                  <Input
                    id="resume-title"
                    value={resumeTitle}
                    onChange={(event) => setResumeTitle(event.target.value)}
                    placeholder="e.g. Software Engineer Resume"
                    disabled={isUploading}
                    maxLength={100}
                    className="border-white/10 bg-[#0c1527] text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading}
                    onClick={resetUploadForm}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={() => void handleUpload()}
                    disabled={
                      isUploading || !selectedFile || !resumeTitle.trim()
                    }
                    className="bg-blue-600 text-white hover:bg-blue-500"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Empty state */}
          {resumes.length === 0 && !showUploadForm ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-[#111a2d] p-6 text-center">
              <p className="text-sm text-slate-400">
                You don't have any active resumes yet. Upload one above to
                continue.
              </p>
            </div>
          ) : null}
        </>
      )}

      {/* Retry only for load errors */}
      {error && resumes.length === 0 ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => void loadResumes()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      ) : null}

      {/* Back */}
      <div className="mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isUploading}
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
