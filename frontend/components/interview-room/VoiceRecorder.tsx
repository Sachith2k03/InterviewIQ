"use client";

import { useEffect, useRef, useState } from "react";

import { Loader2, Mic, Square } from "lucide-react";

import {
  submitInterviewResponse,
  type InterviewResponse,
} from "@/lib/api/responses";

type RecorderState = "idle" | "recording" | "processing" | "error";

interface VoiceRecorderProps {
  interviewId: string;
  questionNumber: number;

  onSubmitted: (response: InterviewResponse) => void;
}

const MIN_RECORDING_SECONDS = 2;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export default function VoiceRecorder({
  interviewId,
  questionNumber,
  onSubmitted,
}: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const chunksRef = useRef<Blob[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  const durationRef = useRef(0);

  const [recorderState, setRecorderState] = useState<RecorderState>("idle");

  const [duration, setDuration] = useState(0);

  const [error, setError] = useState<string | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const cleanupTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }
  };

  const cleanupAudioAnalysis = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();

      audioContextRef.current = null;
    }

    analyserRef.current = null;

    setAudioLevel(0);
  };

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());

      streamRef.current = null;
    }
  };

  const cleanupRecording = () => {
    cleanupTimer();
    cleanupAudioAnalysis();
    cleanupStream();

    mediaRecorderRef.current = null;

    chunksRef.current = [];
  };

  const startAudioAnalysis = (stream: MediaStream) => {
    const audioContext = new AudioContext();

    const source = audioContext.createMediaStreamSource(stream);

    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;

    source.connect(analyser);

    audioContextRef.current = audioContext;

    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      const normalizedLevel = Math.min(average / 80, 1);

      setAudioLevel(normalizedLevel);

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const startTimer = () => {
    cleanupTimer();

    durationRef.current = 0;
    setDuration(0);

    timerRef.current = setInterval(() => {
      durationRef.current += 1;

      setDuration(durationRef.current);
    }, 1000);
  };

  const getSupportedMimeType = () => {
    const supportedTypes = ["audio/webm;codecs=opus", "audio/webm"];

    return (
      supportedTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
    );
  };

  const startRecording = async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Microphone recording is not supported by this browser.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mimeType = getSupportedMimeType();

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const recordedDuration = durationRef.current;

        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        cleanupTimer();
        cleanupAudioAnalysis();
        cleanupStream();

        if (recordedDuration < MIN_RECORDING_SECONDS) {
          setRecorderState("error");

          setError(
            `Your answer must be at least ${MIN_RECORDING_SECONDS} seconds long.`,
          );

          return;
        }

        if (blob.size === 0) {
          setRecorderState("error");

          setError("No audio was recorded. Please try again.");

          return;
        }

        await submitRecording(blob, recordedDuration);
      };

      mediaRecorderRef.current = mediaRecorder;

      startAudioAnalysis(stream);

      startTimer();

      mediaRecorder.start();

      setRecorderState("recording");
    } catch (error) {
      cleanupRecording();

      setRecorderState("error");

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setError(
          "Microphone permission was denied. Allow microphone access and try again.",
        );

        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Unable to start microphone recording.",
      );
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== "recording") {
      return;
    }

    /*
     * Immediately lock the UI.
     *
     * onstop will create the Blob
     * and submit it.
     */
    setRecorderState("processing");

    recorder.stop();
  };

  const submitRecording = async (audioBlob: Blob, recordedDuration: number) => {
    try {
      setRecorderState("processing");

      setError(null);

      const response = await submitInterviewResponse(
        interviewId,
        questionNumber,
        audioBlob,
        recordedDuration,
      );

      onSubmitted(response);
    } catch (error) {
      setRecorderState("error");

      setError(
        error instanceof Error
          ? error.message
          : "Failed to process your answer.",
      );
    }
  };

  const handleMicrophoneClick = () => {
    if (recorderState === "idle" || recorderState === "error") {
      void startRecording();

      return;
    }

    if (recorderState === "recording") {
      stopRecording();
    }
  };

  const isRecording = recorderState === "recording";

  const isProcessing = recorderState === "processing";

  /*
   * This produces a fake-looking
   * waveform shape, but its intensity
   * is driven by the REAL microphone
   * level from AnalyserNode.
   */
  const waveformBars = [
    0.35, 0.55, 0.8, 0.45, 1, 0.65, 0.85, 0.55, 0.75, 0.95, 0.6, 0.4, 0.7, 0.9,
    0.5, 0.75, 0.35,
  ];

  return (
    <div className="flex w-full flex-col items-center pt-4 pb-1 sm:py-6 lg:min-h-0 lg:flex-1 lg:justify-center lg:py-4">
      {/* Status */}
      <p className="text-center text-xs font-medium text-slate-300 sm:text-sm">
        {isRecording
          ? "Listening..."
          : isProcessing
            ? "Analyzing your answer..."
            : recorderState === "error"
              ? "Ready to try again"
              : "Ready when you are"}
      </p>

      {/* Timer */}
      <p
        className={`mt-1.5 font-mono text-xs sm:mt-2 sm:text-sm ${
          isRecording ? "text-blue-300" : "text-slate-500"
        }`}
      >
        {formatTime(duration)}
      </p>

      {/* Waveform */}
      <div className="mt-3 flex h-12 w-full max-w-xs shrink-0 items-center justify-center gap-1 sm:mt-5 sm:h-16">
        {waveformBars.map((multiplier, index) => {
          const baseHeight = 10;

          const activeHeight = 10 + audioLevel * multiplier * 38;

          return (
            <span
              key={index}
              className={`w-1 rounded-full transition-[height,background-color] duration-75 ${
                isRecording
                  ? "bg-blue-500"
                  : isProcessing
                    ? "animate-pulse bg-violet-500/70"
                    : "bg-blue-500/35"
              }`}
              style={{
                height: `${
                  isRecording ? activeHeight : baseHeight + multiplier * 14
                }px`,
              }}
            />
          );
        })}
      </div>

      {/* Microphone */}
      <button
        type="button"
        onClick={handleMicrophoneClick}
        disabled={isProcessing}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={`
        mt-3
        flex
        h-16
        w-16
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        transition-all
        duration-200
        sm:mt-5
        sm:h-20
        sm:w-20
        lg:h-24
        lg:w-24
        ${
          isRecording
            ? "border-red-500/60 bg-red-500/10 shadow-[0_0_45px_rgba(239,68,68,0.25)]"
            : isProcessing
              ? "cursor-not-allowed border-violet-500/30 bg-violet-500/10"
              : "border-blue-500/40 bg-blue-600/10 shadow-[0_0_40px_rgba(37,99,235,0.25)] hover:border-blue-400/70 hover:bg-blue-500/15"
        }
      `}
      >
        <div
          className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          text-white
          transition
          sm:h-14
          sm:w-14
          lg:h-16
          lg:w-16
          ${
            isRecording
              ? "bg-red-600"
              : isProcessing
                ? "bg-violet-600"
                : "bg-blue-600"
          }
        `}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin sm:h-6 sm:w-6" />
          ) : isRecording ? (
            <Square className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
          ) : (
            <Mic className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
          )}
        </div>
      </button>

      {/* Action hint */}
      <p className="mt-3 max-w-sm shrink-0 px-3 text-center text-xs leading-5 text-slate-400 sm:mt-4 sm:text-sm">
        {isRecording
          ? "Tap to stop"
          : isProcessing
            ? "Please wait while InterviewIQ evaluates your response"
            : "Tap to answer"}
      </p>

      {/* Error */}
      {error ? (
        <div className="mt-4 w-full max-w-md rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-center">
          <p className="text-sm leading-5 text-red-400">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
