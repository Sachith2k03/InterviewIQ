"use client";

import { useEffect, useRef, useState } from "react";
import { ChartColumn, FileUp, Mic } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    number: "01",
    title: "Upload Your Resume",
    description:
      "Upload and select your resume, choose the job role, interview type, difficulty, and number of questions.",
  },
  {
    icon: Mic,
    number: "02",
    title: "Take the Interview",
    description:
      "Answer AI-generated interview questions using your voice in a realistic mock interview environment.",
  },
  {
    icon: ChartColumn,
    number: "03",
    title: "Receive AI Feedback",
    description:
      "View detailed scores, strengths, weaknesses, and recommendations to improve future interviews.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          // Run the animation only once.
          observer.unobserve(section);
        }
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden bg-[#081326] px-5 py-24 lg:px-10"
      id="how-it-works"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[680px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section heading */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            Simple Process
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            How InterviewIQ Works
          </h2>

          <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
            Prepare for your next interview in just three simple steps.
          </p>
        </div>

        {/* Step cards */}
        <div className="relative mt-16 grid gap-8 lg:mt-20 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                style={{
                  transitionDelay: isVisible ? `${index * 180}ms` : "0ms",
                }}
                className={`group relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-lg shadow-transparent transition-all duration-700 ease-out hover:-translate-y-2 hover:border-blue-500/50 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-blue-950/30 ${
                  isVisible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-12 scale-95 opacity-0"
                }`}
              >
                {/* Icon */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-600/10 text-blue-400 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-blue-600/20 group-hover:shadow-lg group-hover:shadow-blue-500/10">
                  <Icon
                    size={30}
                    className="transition-transform duration-500 group-hover:-rotate-6"
                  />
                </div>

                {/* Step number */}
                <span className="text-sm font-bold tracking-wider text-blue-400">
                  {step.number}
                </span>

                {/* Step title */}
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {step.title}
                </h3>

                {/* Step description */}
                <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                  {step.description}
                </p>

                {/* Desktop connector */}
                {index < steps.length - 1 && (
                  <div className="pointer-events-none absolute -right-8 top-1/2 z-10 hidden h-[2px] w-16 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-transparent lg:block" />
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}