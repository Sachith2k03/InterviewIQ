import Image from "next/image";

import { Bot, Circle, Lightbulb } from "lucide-react";

import { Card } from "@/components/ui/card";

export default function AIInterviewerPanel() {
  return (
    <aside className="hidden min-h-0 flex-col gap-3 overflow-hidden lg:flex">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-white/10 bg-[#111a2d] p-4">
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-[#081326]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15),transparent_65%)]" />

          <Image
            src="/images/robot.png"
            alt="AI Interviewer"
            fill
            sizes="280px"
            className="relative z-10 object-contain object-center p-3"
          />
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Bot className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">AI Interviewer</p>

            <div className="mt-1 flex items-center gap-1.5">
              <Circle className="h-2 w-2 shrink-0 fill-emerald-400 text-emerald-400" />

              <span className="text-xs text-emerald-400">Online</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="shrink-0 border-white/10 bg-[#111a2d] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Lightbulb className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Helpful Tip</p>

            <p className="mt-2 text-sm leading-5 text-slate-400">
              Take your time and structure your answer clearly. Speak naturally
              as you would in a real interview.
            </p>
          </div>
        </div>
      </Card>
    </aside>
  );
}
