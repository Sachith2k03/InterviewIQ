"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is InterviewIQ free to use?",
    answer:
      "Yes. You can practice interviews and receive AI-powered feedback without any cost during the current version of InterviewIQ.",
  },
  {
    question: "How does the AI evaluate my answers?",
    answer:
      "InterviewIQ analyzes your voice responses using AI to evaluate communication, confidence, fluency, technical accuracy, and overall interview performance.",
  },
  {
    question: "Can I upload multiple resumes?",
    answer:
      "Yes. You can upload and manage multiple resumes, then choose the most relevant one before starting each interview.",
  },
  {
    question: "What interview types are supported?",
    answer:
      "InterviewIQ supports Technical, HR, and Behavioral interviews with configurable difficulty levels and question counts.",
  },
  {
    question: "Is my interview data secure?",
    answer:
      "Yes. Your interview history, resumes, and reports are securely stored and accessible only through your authenticated account.",
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
      id="faq"
      className="relative overflow-hidden bg-[#081326] px-5 py-20 sm:px-6 lg:px-10 lg:py-24"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[150px]" />

      <div className="relative mx-auto max-w-4xl">
        {/* Heading */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            Frequently Asked Questions
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Everything You Need to Know
          </h2>

          <p className="mt-5 text-slate-400 leading-7">
            Find answers to the most common questions about InterviewIQ.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="mt-14 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
                className={`overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-300 hover:bg-white/[0.03]"
                >
                  <h3 className="text-base font-semibold text-white sm:text-lg">
                    {faq.question}
                  </h3>

                  <ChevronDown
                    className={`h-5 w-5 text-blue-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm leading-7 text-slate-400 sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}