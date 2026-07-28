import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import dashboardImage from "../../public/images/interview-dashboard.jpeg";
import robotImage from "../../public/images/robot.png";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] bg-[#071126]">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[130px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-0">
        {/* Left content */}
        <div className="max-w-xl">
          <p className="mb-3 text-sm font-medium text-blue-400">
            AI-powered interview preparation
          </p>

        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Master Your Next Interview with{" "}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            AI.
          </span>
        </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
            Practise realistic mock interviews, answer questions using your
            voice, and receive personalised AI feedback to improve your skills,
            confidence, and interview performance.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="#features"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Explore Features
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              AI-generated questions
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              Voice-based answers
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              Detailed feedback
            </span>
          </div>
        </div>

        {/* Right preview */}
        <div className="relative mx-auto w-full max-w-xl xl:max-w-2xl">
          <div className="animate-dashboard-glow absolute -inset-6 rounded-[32px] bg-blue-600/20 blur-3xl" />

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111d32] p-3 shadow-2xl shadow-black/40 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.015] hover:border-blue-500/30 hover:shadow-blue-950/40 sm:p-4">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            </div>

            <Image
              src={dashboardImage}
              alt="InterviewIQ dashboard preview"
              priority
              className="h-auto max-h-[62vh] w-full rounded-xl border border-white/[0.06] object-contain transition-transform duration-700 group-hover:scale-[1.02]"
            />            
          </div>

          <Image
            src={robotImage}
            alt="InterviewIQ AI assistant"
            priority
            className="animate-robot-float absolute -bottom-10 -right-15 block h-auto w-48 object-contain drop-shadow-2xl sm:-bottom-12 sm:-right-8 sm:w-32 lg:-bottom-20 lg:-right-30 lg:w-100"
          />
        </div>
      </div>
    </section>
  );
}