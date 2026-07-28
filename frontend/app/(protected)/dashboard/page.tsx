// This is temporary code to get the JWT access token for test the APIs.
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function DashboardPage() {
  useEffect(() => {
    const getToken = async () => {
      const supabase = createClient();

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        return;
      }

      console.log("SESSION:", session);
      console.log("JWT ACCESS TOKEN:", session?.access_token);
    };

    getToken();
  }, []);

  return <div>Dashboard</div>;
}
//TODO: Remove the above code before production.