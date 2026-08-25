import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  const requestedPath =
    requestUrl.searchParams.get("next") ?? "/dashboard";

  const nextPath = isSafeInternalPath(requestedPath)
    ? requestedPath
    : "/dashboard";

  const redirectUrl = new URL(
    nextPath,
    requestUrl.origin,
  );

  if (!code) {
    const loginUrl = new URL(
      "/login",
      requestUrl.origin,
    );

    loginUrl.searchParams.set(
      "error",
      "Authentication callback did not contain a code.",
    );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabasePublishableKey
  ) {
    throw new Error(
      "Supabase environment variables are missing.",
    );
  }

  const cookieStore =
    await cookies();

  const supabase =
    createServerClient(
      supabaseUrl,
      supabasePublishableKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(
                ({
                  name,
                  value,
                  options,
                }) => {
                  cookieStore.set(
                    name,
                    value,
                    options,
                  );
                },
              );
            } catch {
              // Cookie writing can fail in contexts
              // where cookies are read-only.
            }
          },
        },
      },
    );

  const {
    error,
  } =
    await supabase.auth.exchangeCodeForSession(
      code,
    );

  if (error) {
    console.error(
      "Authentication callback error:",
      error,
    );

    const loginUrl = new URL(
      "/login",
      requestUrl.origin,
    );

    loginUrl.searchParams.set(
      "error",
      "Authentication failed. Please try again.",
    );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  return NextResponse.redirect(
    redirectUrl,
  );
}

function isSafeInternalPath(
  path: string,
): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//")
  );
}