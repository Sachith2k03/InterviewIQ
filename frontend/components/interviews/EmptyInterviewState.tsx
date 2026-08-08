import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyInterviewState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">

            <h2 className="text-xl font-semibold">
                No interviews yet
            </h2>

            <p className="mt-2 text-muted-foreground">
                Start your first AI interview to
                track your progress.
            </p>

            <Button
                asChild
                className="mt-6"
            >
                <Link href="/interviews/create">
                    Start Interview
                </Link>
            </Button>

        </div>
    );
}