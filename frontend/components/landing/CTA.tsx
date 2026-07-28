"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
      className="relative overflow-hidden bg-[#071126] px-5 py-24 sm:px-6 lg:px-10"
    >
      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[160px]" />

      <div className="absolute -left-20 top-0 h-72 w-72 animate-pulse-soft rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="absolute -right-20 bottom-0 h-72 w-72 animate-pulse-soft rounded-full bg-blue-600/10 blur-[120px]" />

      <div
        className={`relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d1b33] to-[#111d35] px-8 py-16 text-center shadow-2xl transition-all duration-700 ease-out lg:px-16 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
          Ready to Get Started?
        </p>

        <h2 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Ace Your Next Interview with{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            InterviewIQ
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400">
          Practice realistic interviews, receive personalized AI feedback,
          improve your confidence, and track your progress—all in one platform.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-900/40"
          >
            Get Started

            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="#features"
            className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}