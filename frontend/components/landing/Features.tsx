"use client";

import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  BarChart3,
  BrainCircuit,
  FileText,
  MessageSquareText,
  Target,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Generated Questions",
    description:
      "Receive realistic interview questions based on your selected job role, interview type, difficulty level, and resume.",
  },
  {
    icon: AudioLines,
    title: "Voice-Based Interviews",
    description:
      "Record your answers naturally using your microphone and experience a more realistic mock interview environment.",
  },
  {
    icon: MessageSquareText,
    title: "Detailed AI Feedback",
    description:
      "Get clear feedback on communication, confidence, technical accuracy, fluency, strengths, and areas for improvement.",
  },
  {
    icon: FileText,
    title: "Resume-Based Practice",
    description:
      "Upload and select your resume so InterviewIQ can create questions relevant to your experience and skills.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description:
      "Review previous interviews, compare performance scores, and monitor your improvement over time.",
  },
  {
    icon: Target,
    title: "Personalised Preparation",
    description:
      "Configure your interview type, job role, difficulty level, and number of questions to match your preparation goals.",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          // Play the entrance animation only once.
          observer.unobserve(section);
        }
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative overflow-hidden bg-[#071126] px-5 py-20 sm:px-6 lg:px-10 lg:py-24"
    >
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[680px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            Powerful Features
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything You Need to Prepare with Confidence
          </h2>

          <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
            InterviewIQ combines realistic mock interviews, voice recording,
            resume-based questions, and intelligent feedback in one complete
            preparation platform.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                style={{
                  transitionDelay: isVisible ? `${index * 120}ms` : "0ms",
                }}
                className={`group relative cursor-default overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 shadow-lg shadow-transparent transition-all duration-700 ease-out hover:-translate-y-2 hover:border-blue-500/50 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-blue-950/30 ${
                  isVisible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-12 scale-[0.96] opacity-0"
                }`}
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/0 blur-3xl transition-all duration-500 group-hover:bg-blue-500/15" />

                {/* Icon */}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:border-blue-400/40 group-hover:bg-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/10">
                  <Icon className="h-6 w-6 transition-transform duration-500 group-hover:-rotate-6" />
                </div>

                <h3 className="relative mt-5 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-blue-100">
                  {feature.title}
                </h3>

                <p className="relative mt-3 text-sm leading-6 text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}