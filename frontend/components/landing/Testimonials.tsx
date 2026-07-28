"use client";

import { useEffect, useRef, useState } from "react";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Morgan",
    role: "Software Engineering Student",
    initials: "AM",
    quote:
      "InterviewIQ helped me structure my answers better and identify the areas I needed to improve before my real interview.",
  },
  {
    name: "Sarah Chen",
    role: "Junior Frontend Developer",
    initials: "SC",
    quote:
      "The AI feedback was clear, practical, and easy to understand. I felt much more confident after only a few practice sessions.",
  },
  {
    name: "Daniel Perera",
    role: "Computer Science Undergraduate",
    initials: "DP",
    quote:
      "The voice-based interview experience felt realistic, and the progress reports made it easy to see how I was improving.",
  },
];

type Position = "left" | "center" | "right";

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [order, setOrder] = useState([0, 1, 2]);
  const [isPaused, setIsPaused] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

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
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused) return;

    const interval = window.setInterval(() => {
      setIsRotating(true);

      window.setTimeout(() => {
        setOrder(([left, center, right]) => [right, left, center]);
        setIsRotating(false);
      }, 700);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [isVisible, isPaused]);

  const getPosition = (testimonialIndex: number): Position => {
    const positionIndex = order.indexOf(testimonialIndex);

    if (positionIndex === 0) return "left";
    if (positionIndex === 1) return "center";

    return "right";
  };

  const getPositionClasses = (
    position: Position,
    testimonialIndex: number,
  ) => {
    const rightCardIndex = order[2];
    const isExitingRight =
      isRotating && testimonialIndex === rightCardIndex;

    if (isExitingRight) {
      return `
        lg:left-[115%]
        lg:z-0
        lg:w-[30%]
        lg:-translate-x-1/2
        lg:-translate-y-1/2
        lg:scale-[0.88]
        lg:opacity-0
      `;
    }

    switch (position) {
      case "left":
        return `
          lg:left-[16%]
          lg:z-10
          lg:w-[30%]
          lg:-translate-x-1/2
          lg:-translate-y-1/2
          lg:scale-[0.92]
          lg:opacity-75
        `;

      case "center":
        return `
          lg:left-1/2
          lg:z-30
          lg:w-[35%]
          lg:-translate-x-1/2
          lg:-translate-y-1/2
          lg:scale-105
          lg:opacity-100
        `;

      case "right":
        return `
          lg:left-[84%]
          lg:z-20
          lg:w-[30%]
          lg:-translate-x-1/2
          lg:-translate-y-1/2
          lg:scale-[0.92]
          lg:opacity-75
        `;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative overflow-hidden bg-[#071126] px-5 py-20 sm:px-6 lg:px-10 lg:py-24"
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-blue-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[130px]" />

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
            User Experiences
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            What Learners Say About InterviewIQ
          </h2>

          <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
            See how realistic mock interviews and personalised AI feedback
            help users prepare with greater confidence.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative mt-14 grid gap-6 lg:mt-20 lg:block lg:h-[430px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {testimonials.map((testimonial, index) => {
            const position = getPosition(index);
            const isCenter = position === "center";

            return (
              <article
                key={testimonial.name}
                className={`
                  group relative overflow-hidden rounded-2xl border p-7
                  transition-all duration-700 ease-in-out

                  lg:absolute
                  lg:top-1/2
                  lg:min-h-[350px]

                  ${
                    isCenter
                      ? "border-blue-500/40 bg-[#101d35] shadow-2xl shadow-blue-950/50"
                      : "border-white/10 bg-white/[0.03] shadow-lg shadow-black/10"
                  }

                  ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-12 opacity-0"
                  }

                  ${getPositionClasses(position, index)}

                  hover:border-blue-500/50
                  hover:bg-white/[0.055]
                `}
              >
                {/* Center glow */}
                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                    isCenter ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

                  <div className="absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
                </div>

                <div className="relative flex items-center justify-between">
                  <div
                    className={`flex items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400 transition-all duration-700 ${
                      isCenter ? "h-12 w-12" : "h-11 w-11"
                    }`}
                  >
                    <Quote
                      className={isCenter ? "h-6 w-6" : "h-5 w-5"}
                    />
                  </div>

                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="h-4 w-4 fill-current"
                      />
                    ))}
                  </div>
                </div>

                <blockquote
                  className={`relative mt-7 leading-7 text-slate-300 transition-all duration-700 ${
                    isCenter ? "text-base sm:text-lg" : "text-sm sm:text-base"
                  }`}
                >
                  “{testimonial.quote}”
                </blockquote>

                <div className="relative mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 font-semibold text-blue-300 transition-all duration-700 ${
                      isCenter
                        ? "h-12 w-12 text-sm"
                        : "h-11 w-11 text-xs"
                    }`}
                  >
                    {testimonial.initials}
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {testimonial.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Center active line */}
                <div
                  className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent transition-all duration-700 ${
                    isCenter ? "w-2/3 opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}