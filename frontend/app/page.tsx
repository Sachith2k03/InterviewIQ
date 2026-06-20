"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
    return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <h1>Welcome to InterviewIQ</h1>
            <p>Your AI-powered interview preparation companion.</p>

            <Link href="/login">
                <button className={buttonVariants({ variant: "default" })}>
                    Get Started
                </button>
            </Link>

        </div>
    );
}